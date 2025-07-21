import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import TypeChip from "./TypeChip";
import { getMovesBatch } from "@/app/utils/api";
import { Move } from "@/app/utils/types";

// FIX: Define a specific type for the detailed move data from the backend
interface DetailedMove {
  name: string;
  type: string;
  damage_class: string;
  category?: string; // category is an alternative name for damage_class
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

const TYPE_COLORS: Record<string, string> = {
  normal: "#9FA29F", fire: "#E72324", water: "#2481EF", electric: "#FAC100",
  grass: "#3DA224", ice: "#3DD9FF", fighting: "#FF8100", poison: "#923FCC",
  ground: "#92501B", flying: "#82BAEF", psychic: "#EF3F7A", bug: "#92A212",
  rock: "#B0A981", ghost: "#703F70", dragon: "#036DC5", dark: "#4F3F3D",
  steel: "#5FA2BA", fairy: "#EF70EF",
};

const MOVE_METHODS = [
  { key: "level-up", label: "Level Up" },
  { key: "machine", label: "TM/HM/TR" },
  { key: "tutor", label: "Tutor" },
  { key: "egg", label: "Egg" },
];

function normalizeMoveName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// FIX: Use the new DetailedMove type
function groupAndDedupeMoves(moves: Move[], versionGroup: string, detailedMoves: Record<string, DetailedMove>) {
  const groups: Record<string, Move[]> = {};
  for (const move of moves) {
    if (move.version_group !== versionGroup) continue;
    if (!groups[move.method]) groups[move.method] = [];

    const detailed = detailedMoves[normalizeMoveName(move.name)] || {};
    const merged: Move = { 
      ...move, 
      ...detailed,
      type: detailed.type || move.type || "normal",
      damage_class: detailed.damage_class || detailed.category || "status",
      power: detailed.power ?? move.power,
      accuracy: detailed.accuracy ?? move.accuracy,
      pp: detailed.pp ?? move.pp,
    };

    if (!groups[move.method].some(m => m.name === merged.name && m.level_learned_at === merged.level_learned_at)) {
      groups[move.method].push(merged);
    }
  }

  for (const method in groups) {
    groups[method] = method === "level-up"
      ? groups[method].sort((a, b) => (a.level_learned_at ?? 0) - (b.level_learned_at ?? 0))
      : groups[method].sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

export default function MovesCardContent({
  moves,
  availableVersions = [],
  primaryType = "normal",
}: {
  moves: Move[];
  availableVersions?: string[];
  primaryType?: string;
}) {
  const [selectedVersion, setSelectedVersion] = useState(availableVersions[0] || "");
  const [activeTab, setActiveTab] = useState("level-up");
  // FIX: Use the new DetailedMove type for the state
  const [detailedMoves, setDetailedMoves] = useState<Record<string, DetailedMove>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accentColor = TYPE_COLORS[primaryType?.toLowerCase()] || "#fac100";

  useEffect(() => {
    const moveNames = Array.from(new Set(moves.map(m => normalizeMoveName(m.name))));
    if (moveNames.length === 0) return;

    setLoading(true);
    setError(null);

    getMovesBatch(moveNames)
      .then(res => {
        if (res.error) {
          setError("Failed to load move details. Using basic information.");
          setDetailedMoves({});
        } else if (res.data?.moves) {
          const map = Object.fromEntries(
            // FIX: Cast the incoming data to the new DetailedMove type
            (res.data.moves as DetailedMove[]).map((m) => [normalizeMoveName(m.name), m])
          );
          setDetailedMoves(map);
        } else {
          setDetailedMoves({});
        }
      })
      .catch(() => {
        setError("Failed to load move details. Using basic information.");
        setDetailedMoves({});
      })
      .finally(() => {
        setLoading(false);
      });
  }, [moves]);

  const grouped = useMemo(
    () => groupAndDedupeMoves(moves, selectedVersion, detailedMoves),
    [moves, selectedVersion, detailedMoves]
  );

  return (
    <div className="flex flex-col w-full items-center gap-6">
      <h2
        className="font-retro text-3xl text-center tracking-wider"
        style={{ color: accentColor }}
      >
        Moves
      </h2>

      {/* Game Version Filters */}
      {availableVersions.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
          {availableVersions.map((version) => (
            <motion.button
              key={version}
              onClick={() => setSelectedVersion(version)}
              type="button"
              whileTap={{ scale: 0.97 }}
              className={`font-retro border-2 rounded-full px-3 py-1 text-xs transition-all duration-200 ${
                selectedVersion === version
                  ? "text-white shadow-lg scale-105"
                  : "bg-transparent text-muted-foreground hover:border-primary/70 hover:text-primary"
              }`}
              style={{
                borderColor: accentColor,
                backgroundColor: selectedVersion === version ? accentColor : undefined,
                boxShadow: selectedVersion === version ? `0 4px 16px ${accentColor}55` : 'none',
              }}
            >
              {version.replace("-", " ")}
            </motion.button>
          ))}
        </div>
      )}

      {/* Move Method Tabs */}
      <div className="flex gap-3 justify-center flex-wrap">
        {MOVE_METHODS.map(({ key, label }) => (
          <motion.button
            key={key}
            onClick={() => setActiveTab(key)}
            type="button"
            whileTap={{ scale: 0.97 }}
            className={`font-retro border-2 rounded-lg px-6 py-2 text-sm transition-all duration-200 ${
              activeTab === key
                ? "text-white shadow-lg scale-105"
                : "bg-card border-border text-muted-foreground hover:bg-primary/10 hover:border-primary"
            }`}
             style={{
                borderColor: activeTab === key ? accentColor : undefined,
                backgroundColor: activeTab === key ? accentColor : undefined,
             }}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full text-center py-2 text-amber-500 text-sm bg-amber-500/10 rounded-lg">
          {error}
        </div>
      )}

      {/* Moves Table */}
      <motion.div
        className="w-full rounded-xl glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36 }}
        style={{
          background: "var(--color-card, rgba(255,255,255,0.14))",
          border: `1.5px solid ${accentColor}88`,
          minHeight: 320,
          boxShadow: `0 4px 24px 0 ${accentColor}22`,
          paddingBottom: 16,
        }}
      >
        {loading ? (
          <div className="w-full text-center py-8 text-muted-foreground font-retro">Loading...</div>
        ) : (
          <table className="min-w-full text-base rounded-lg table-fixed border-separate border-spacing-0">
            <colgroup>
              {activeTab === "level-up" && <col style={{ width: "8%" }} />}
              <col style={{ width: "22%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.15)" }}>
                {activeTab === "level-up" && (
                  <th className="font-retro px-2 py-3 text-center" style={{ color: accentColor }}>Level</th>
                )}
                <th className="font-retro px-2 py-3 text-left" style={{ color: accentColor }}>Name</th>
                <th className="font-retro px-2 py-3 text-center" style={{ color: accentColor }}>Type</th>
                <th className="font-retro px-2 py-3 text-center" style={{ color: accentColor }}>Cat.</th>
                <th className="font-retro px-2 py-3 text-center" style={{ color: accentColor }}>Power</th>
                <th className="font-retro px-2 py-3 text-center" style={{ color: accentColor }}>Acc.</th>
                <th className="font-retro px-2 py-3 text-center" style={{ color: accentColor }}>PP</th>
              </tr>
            </thead>
            <tbody>
              {(grouped[activeTab] || []).map((move, idx) => (
                <tr
                  key={`${move.name}-${idx}`}
                  className="hover:bg-white/5 transition-colors"
                >
                  {activeTab === "level-up" && (
                    <td className="px-2 py-1 text-center font-mono align-middle">{move.level_learned_at ?? "-"}</td>
                  )}
                  <td className="px-2 py-1 font-retro capitalize align-middle">{move.name.replace("-", " ")}</td>
                  <td className="px-2 py-1 text-center align-middle"><TypeChip type={move.type || "normal"} /></td>
                  <td className="px-2 py-1 text-center align-middle capitalize">{move.damage_class}</td>
                  <td className="px-2 py-1 text-center align-middle">{move.power ?? "-"}</td>
                  <td className="px-2 py-1 text-center align-middle">{move.accuracy ?? "-"}</td>
                  <td className="px-2 py-1 text-center align-middle">{move.pp ?? "-"}</td>
                </tr>
              ))}
              {(!grouped[activeTab] || grouped[activeTab].length === 0) && (
                <tr>
                  <td
                    colSpan={activeTab === "level-up" ? 7 : 6}
                    className="px-2 py-8 text-center text-muted-foreground font-retro"
                  >
                    No moves found for this method in {selectedVersion}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
