import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import TypeChip from "./TypeChip";
import { getMovesBatch } from "@/app/utils/api";
import { Move } from "@/app/utils/types";

// Type colors for move method and game filters
const TYPE_COLORS: Record<string, string> = {
  normal: "#9FA29F",
  fire: "#E72324",
  water: "#2481EF",
  electric: "#FAC100",
  grass: "#3DA224",
  ice: "#3DD9FF",
  fighting: "#FF8100",
  poison: "#923FCC",
  ground: "#92501B",
  flying: "#82BAEF",
  psychic: "#EF3F7A",
  bug: "#92A212",
  rock: "#B0A981",
  ghost: "#703F70",
  dragon: "#036DC5",
  dark: "#4F3F3D",
  steel: "#5FA2BA",
  fairy: "#EF70EF",
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

function groupAndDedupeMoves(moves: Move[], versionGroup: string, detailedMoves: Record<string, any>) {
  const groups: Record<string, Move[]> = {};
  for (const move of moves) {
    if (move.version_group !== versionGroup) continue;
    if (!groups[move.method]) groups[move.method] = [];

    const detailed = detailedMoves[normalizeMoveName(move.name)] || {};
    const merged = { 
      ...move, 
      ...detailed,
      type: detailed.type || move.type || "normal",
      damage_class: detailed.damage_class || detailed.category || "status",
      power: detailed.power || move.power || null,
      accuracy: detailed.accuracy || move.accuracy || null,
      pp: detailed.pp || move.pp || null,
    };

    if (!groups[move.method].some(
      m =>
        m.name === merged.name &&
        m.level_learned_at === merged.level_learned_at &&
        m.method === merged.method &&
        m.version_group === merged.version_group
    )) {
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
  primaryType = "normal", // pass the Pokémon's type here for accents
}: {
  moves: Move[];
  availableVersions?: string[];
  primaryType?: string;
}) {
  const [selectedVersion, setSelectedVersion] = useState(availableVersions[0] || "");
  const [activeTab, setActiveTab] = useState("level-up");
  const [detailedMoves, setDetailedMoves] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accentColor = TYPE_COLORS[primaryType?.toLowerCase()] || "#fac100";
  console.log("CLIENT: Props received by MovesCardContent:", { moves, availableVersions });

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
            res.data.moves.map((m: any) => [normalizeMoveName(m.name), m])
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
    <div className="flex flex-col w-full h-full gap-4">
      {/* Heading */}
      <h2
        className="font-retro text-2xl mb-1"
        style={{
          fontFamily: "var(--font-retro)",
          color: accentColor,
          letterSpacing: "0.08em",
          textAlign: "center",
        }}
      >
        Moves
      </h2>

      {/* Game Version Filters */}
      {availableVersions.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center mb-2">
          {availableVersions.map((version) => (
            <motion.button
              key={version}
              className={`px-4 py-1 rounded-full font-retro text-xs border-2 transition flex items-center 
                ${selectedVersion === version
                  ? "shadow"
                  : "bg-card text-muted-foreground"}
              `}
              style={{
                fontFamily: "var(--font-retro)",
                color: selectedVersion === version ? "#fff" : accentColor,
                borderColor: accentColor,
                background: selectedVersion === version ? accentColor : undefined,
                boxShadow: selectedVersion === version ? `0 2px 12px 0 ${accentColor}44` : undefined,
                letterSpacing: "0.03em",
              }}
              onClick={() => setSelectedVersion(version)}
              type="button"
              whileTap={{ scale: 0.97 }}
            >
              {version}
            </motion.button>
          ))}
        </div>
      )}

      {/* Move Method Tabs/Chips */}
      <div className="flex gap-2 mb-2 justify-center flex-wrap">
        {MOVE_METHODS.map(({ key, label }) => (
          <motion.button
            key={key}
            className={`px-4 py-1 rounded-full font-retro text-base border-2 transition flex items-center 
              ${activeTab === key
                ? "shadow"
                : "bg-card text-muted-foreground"}
            `}
            style={{
              fontFamily: "var(--font-retro)",
              color: activeTab === key ? "#fff" : accentColor,
              borderColor: accentColor,
              background: activeTab === key ? accentColor : undefined,
              boxShadow: activeTab === key ? `0 2px 12px 0 ${accentColor}33` : undefined,
              letterSpacing: "0.03em",
            }}
            onClick={() => setActiveTab(key)}
            type="button"
            whileTap={{ scale: 0.97 }}
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
          border: `2.5px solid ${accentColor}`,
          minHeight: 320,
          boxShadow: `0 2px 16px 0 ${accentColor}18`,
          paddingBottom: 16,
        }}
      >
        {loading ? (
          <div className="w-full text-center py-8 text-muted-foreground">Loading move details...</div>
        ) : (
          <table
            className="min-w-full text-base rounded-lg"
            style={{
              background: "transparent",
              color: "var(--color-card-foreground, #fff)",
              fontFamily: "var(--font-sans)",
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
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
              <tr style={{ color: accentColor, background: "rgba(0,0,0,0.08)" }}>
                {activeTab === "level-up" && (
                  <th className="px-2 py-2 font-retro text-primary text-center">Level</th>
                )}
                <th className="px-2 py-2 font-retro text-primary text-left">Name</th>
                <th className="px-2 py-2 font-retro text-primary text-center">Type</th>
                <th className="px-2 py-2 font-retro text-primary text-center">Cat.</th>
                <th className="px-2 py-2 font-retro text-primary text-center">Power</th>
                <th className="px-2 py-2 font-retro text-primary text-center">Acc.</th>
                <th className="px-2 py-2 font-retro text-primary text-center">PP</th>
              </tr>
            </thead>
            <tbody>
              {(grouped[activeTab] || []).map((move, idx) => (
                <tr
                  key={`${move.name}-${move.type}-${move.level_learned_at ?? ""}-${move.method}-${move.version_group}-${selectedVersion}-${idx}`}
                  className="hover:bg-white/5 transition-all"
                  style={{ height: 48 }}
                >
                  {activeTab === "level-up" && (
                    <td className="px-2 py-1 text-center font-mono align-middle">
                      {move.level_learned_at ?? "-"}
                    </td>
                  )}
                  <td className="px-2 py-1 font-retro capitalize align-middle">
                    {move.name.replace("-", " ")}
                  </td>
                  <td className="px-2 py-1 text-center align-middle">
                    <TypeChip type={move.type || "normal"} />
                  </td>
                  <td className="px-2 py-1 text-center align-middle">
                    {move.damage_class
                      ? move.damage_class.charAt(0).toUpperCase() + move.damage_class.slice(1)
                      : "Status"}
                  </td>
                  <td className="px-2 py-1 text-center align-middle">{move.power ?? "-"}</td>
                  <td className="px-2 py-1 text-center align-middle">{move.accuracy ?? "-"}</td>
                  <td className="px-2 py-1 text-center align-middle">{move.pp ?? "-"}</td>
                </tr>
              ))}
              {(!grouped[activeTab] || grouped[activeTab].length === 0) && (
                <tr>
                  <td
                    colSpan={activeTab === "level-up" ? 7 : 6}
                    className="px-2 py-8 text-center text-muted-foreground"
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
