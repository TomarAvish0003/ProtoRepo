"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { TeamMember, StatName, ALL_POKEMON_TYPES, LocalMoveEntry } from "@/app/utils/teamBuilder/types";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import { clampEV } from "@/app/hooks/useTeamStore";
import {
  NATURE_MODIFIERS,
  getStealthRockDamagePercent,
  getProtosynthesisBoostedStat,
} from "@/app/utils/teamBuilder/damageCalcEngine";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";
import {
  classifySpecimenRole,
  getPokemonLegalAbilities,
  getPokemonLegalLearnset,
  ALL_ITEMS,
  isItemLegal,
} from "@/app/utils/teamBuilder/roleClassifier";
import pokedexDataRaw from "@/app/data/pokedex-data.json";
import { Swords, Trash2, Search, X, Check, ShieldAlert, Sparkles, Wand2 } from "lucide-react";

const POKEDEX_MAP = new Map<number, { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }>(
  (pokedexDataRaw as unknown as FlatVarietyWithTypes[])
    .filter((p): p is FlatVarietyWithTypes & { stats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number } } =>
      Boolean(p.stats?.hp !== undefined && p.stats?.atk !== undefined && p.stats?.def !== undefined && p.stats?.spa !== undefined && p.stats?.spd !== undefined && p.stats?.spe !== undefined)
    )
    .map((p) => [p.id, p.stats as { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }])
);

interface MemberInspectorProps {
  member: TeamMember;
  movesData: Record<string, LocalMoveEntry>;
  format?: string;
  onUpdate: (updater: (m: TeamMember) => TeamMember) => void;
  onRemove: () => void;
  onOpenCalc: () => void;
}

const STAT_LABELS: Record<StatName, { label: string; short: string }> = {
  hp: { label: "HP", short: "HP" },
  atk: { label: "Attack", short: "Atk" },
  def: { label: "Defense", short: "Def" },
  spa: { label: "Sp. Atk", short: "SpA" },
  spd: { label: "Sp. Def", short: "SpD" },
  spe: { label: "Speed", short: "Spe" },
};

export default function MemberInspector({
  member,
  movesData,
  format = "gen9ou",
  onUpdate,
  onRemove,
  onOpenCalc,
}: MemberInspectorProps) {
  // Dropdown States
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const itemContainerRef = useRef<HTMLDivElement>(null);

  const [activeMoveSlot, setActiveMoveSlot] = useState<number | null>(null);
  const [moveSearchQuery, setMoveSearchQuery] = useState("");
  const moveContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        itemContainerRef.current &&
        !itemContainerRef.current.contains(event.target as Node)
      ) {
        setItemDropdownOpen(false);
      }
      if (
        moveContainerRef.current &&
        !moveContainerRef.current.contains(event.target as Node)
      ) {
        setActiveMoveSlot(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // EV Calculations
  const totalEvs = Object.values(member.evs).reduce((a, b) => a + (b || 0), 0);

  const handleEvChange = (stat: StatName, val: number) => {
    onUpdate((m) => ({
      ...m,
      evs: clampEV(m.evs, stat, val),
    }));
  };

  const applySpreadPreset = (preset: "physical" | "special" | "bulkyPhys" | "bulkySpd" | "zero") => {
    onUpdate((m) => {
      if (preset === "physical") {
        return { ...m, evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 } };
      }
      if (preset === "special") {
        return { ...m, evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 } };
      }
      if (preset === "bulkyPhys") {
        return { ...m, evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 } };
      }
      if (preset === "bulkySpd") {
        return { ...m, evs: { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 } };
      }
      return { ...m, evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } };
    });
  };

  // Dynamic Specimen Role
  const specimenRole = useMemo(() => {
    const baseStats = POKEDEX_MAP.get(member.pokemonId);
    return classifySpecimenRole(member, baseStats);
  }, [member]);

  // Legal Abilities for this Pokémon
  const legalAbilities = useMemo(() => {
    return getPokemonLegalAbilities(member.speciesName);
  }, [member.speciesName]);

  // Legal Learnset for this Pokémon
  const legalMoveIds = useMemo(() => {
    return getPokemonLegalLearnset(member.speciesName);
  }, [member.speciesName]);

  // Stealth Rock Vulnerability
  const stealthRockData = useMemo(() => {
    return getStealthRockDamagePercent(member.types, member.ability, member.item);
  }, [member.types, member.ability, member.item]);

  // Protosynthesis / Quark Drive dynamic booster stat
  const boosterStatInfo = useMemo(() => {
    const isProto = (member.ability || "").toLowerCase().includes("proto");
    const isQuark = (member.ability || "").toLowerCase().includes("quark");
    if (!isProto && !isQuark) return null;

    const baseStats = POKEDEX_MAP.get(member.pokemonId) || { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 };
    return getProtosynthesisBoostedStat(baseStats, member.ivs, member.evs, member.nature, member.level);
  }, [member.ability, member.pokemonId, member.ivs, member.evs, member.nature, member.level]);

  // Auto-Optimize IVs
  const handleAutoOptimizeIvs = () => {
    onUpdate((m) => {
      // Check if all 4 moves are special or status (no physical moves)
      let hasPhysical = false;
      for (const mv of m.moves) {
        if (!mv || mv.trim() === "" || mv === "Tackle") continue;
        const rawKey = mv.toLowerCase().trim().replace(/[\s_]/g, "-");
        const raw = movesData[rawKey] || movesData[rawKey.replace(/-/g, " ")];
        if (raw?.category === "Physical") {
          hasPhysical = true;
          break;
        }
      }

      const speedDownNatures = ["quiet", "brave", "relaxed", "sassy"];
      const isSpeedDown = speedDownNatures.includes(m.nature.toLowerCase());

      return {
        ...m,
        ivs: {
          ...m.ivs,
          atk: hasPhysical ? 31 : 0, // 0 Atk IV minimizes Foul Play & confusion damage
          spe: isSpeedDown ? 0 : 31, // 0 Spe IV maximizes Trick Room priority
        },
      };
    });
  };

  // Filtered & Ranked Items
  const filteredItems = useMemo(() => {
    const q = itemSearchQuery.toLowerCase().trim();
    const cleanSpec = member.speciesName.toLowerCase().replace(/[^a-z0-9]/g, "");

    return ALL_ITEMS.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.id.includes(q)
      );
    }).sort((a, b) => {
      // 1. Species-specific Mega Stones (e.g. garchompite for garchomp)
      const aIsMyMega = a.megaStone && a.megaUser?.some((u) => u.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanSpec);
      const bIsMyMega = b.megaStone && b.megaUser?.some((u) => u.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanSpec);
      if (aIsMyMega && !bIsMyMega) return -1;
      if (!aIsMyMega && bIsMyMega) return 1;

      // 2. Matching search exact prefix
      if (q) {
        const aStarts = a.name.toLowerCase().startsWith(q);
        const bStarts = b.name.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
      }

      // 3. Top competitive items priority
      if (a.isTopCompetitive && !b.isTopCompetitive) return -1;
      if (!a.isTopCompetitive && b.isTopCompetitive) return 1;

      // 4. Alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [itemSearchQuery, member.speciesName]);

  // Filtered & Ranked Legal Moves
  const filteredLegalMoves = useMemo(() => {
    const q = moveSearchQuery.toLowerCase().trim();
    const list: { id: string; name: string; meta: LocalMoveEntry }[] = [];

    // Map each move from movesData that belongs to this Pokemon's learnset
    for (const [id, meta] of Object.entries(movesData)) {
      const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, "");
      // If legal in learnset (or fallback if empty learnset)
      if (legalMoveIds.size === 0 || legalMoveIds.has(cleanId)) {
        list.push({
          id,
          name: id
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          meta,
        });
      }
    }

    return list
      .filter((m) => {
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          (m.meta?.type && m.meta.type.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (q) {
          const aStarts = a.name.toLowerCase().startsWith(q);
          const bStarts = b.name.toLowerCase().startsWith(q);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
        }

        // STAB priority
        const aIsStab = member.types.some(
          (t) => t.toLowerCase() === a.meta?.type?.toLowerCase()
        );
        const bIsStab = member.types.some(
          (t) => t.toLowerCase() === b.meta?.type?.toLowerCase()
        );
        if (aIsStab && !bIsStab) return -1;
        if (!aIsStab && bIsStab) return 1;

        // Base Power priority
        const pwrA = typeof a.meta?.power === "number" ? a.meta.power : parseInt(a.meta?.power || "0", 10) || 0;
        const pwrB = typeof b.meta?.power === "number" ? b.meta.power : parseInt(b.meta?.power || "0", 10) || 0;
        if (pwrA !== pwrB) return pwrB - pwrA;

        return a.name.localeCompare(b.name);
      });
  }, [movesData, legalMoveIds, moveSearchQuery, member.types]);

  return (
    <div className="bg-charcoal-surface border border-border-crisp rounded-2xl p-5 space-y-6 shadow-xs">
      {/* Header: Specimen Identity & Dynamic Combat Role */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-crisp">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 relative rounded-2xl bg-surface-container-low border border-border-crisp p-1 shrink-0">
            {member.sprite && (
              <Image
                src={member.sprite}
                alt={member.speciesName}
                fill
                sizes="56px"
                className="object-contain"
              />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-on-surface capitalize">
                {member.speciesName}
              </h3>
              <div className="flex gap-1">
                {member.types.map((t) => {
                  const conf = TYPE_CONFIGS[t.toLowerCase()];
                  return (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: conf?.colorHex || "#666" }}
                    >
                      {conf?.kanji} {t}
                    </span>
                  );
                })}
              </div>
              {/* Dynamic Combat Role Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1 ${specimenRole.badgeClass}`}
                title={specimenRole.description}
              >
                <Sparkles className="w-3 h-3" />
                {specimenRole.title}
              </span>

              {/* Stealth Rock Vulnerability Alert */}
              {stealthRockData.alertSeverity !== "none" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
                    stealthRockData.alertSeverity === "critical"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : stealthRockData.alertSeverity === "high"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-slate-panel text-on-surface-variant border-border-crisp"
                  }`}
                  title={
                    stealthRockData.percent >= 25
                      ? `Stealth Rock Vulnerability: Takes ${stealthRockData.percent}% max HP on entry without Heavy-Duty Boots!`
                      : `Takes ${stealthRockData.percent}% on entry from Stealth Rock`
                  }
                >
                  <ShieldAlert className="w-3 h-3" />
                  SR: -{stealthRockData.percent}%
                </span>
              )}

              {/* Booster Stat Target */}
              {boosterStatInfo && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1"
                  title={`Protosynthesis/Quark Drive boosts ${boosterStatInfo.statName} by ${boosterStatInfo.multiplier === 1.5 ? "50%" : "30%"} (raw ${boosterStatInfo.rawValue} → ${boosterStatInfo.boostedValue})`}
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Booster: {boosterStatInfo.statName}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-on-surface-variant mt-1">
              Slot Inspector • ID #{member.pokemonId} •{" "}
              <span className="text-on-surface font-semibold">
                {specimenRole.description}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCalc}
            className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            Damage Calc
          </button>
          <button
            onClick={onRemove}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
            title="Remove from team"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Details (Item Combobox, Ability Switcher, Nature, Tera Type) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        {/* 1. Held Item Combobox */}
        <div ref={itemContainerRef} className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <label className="text-on-surface-variant block font-semibold">
              Held Item:
            </label>
            {member.item && (
              <button
                onClick={() => onUpdate((m) => ({ ...m, item: "" }))}
                className="text-[10px] text-on-surface-variant hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={itemDropdownOpen ? itemSearchQuery : member.item || ""}
              onFocus={() => {
                setItemDropdownOpen(true);
                setItemSearchQuery(member.item || "");
              }}
              onChange={(e) => {
                setItemSearchQuery(e.target.value);
                setItemDropdownOpen(true);
              }}
              placeholder="Search Held Item..."
              className="w-full px-3 py-2 rounded-xl bg-slate-panel border border-border-crisp text-on-surface focus:outline-none focus:border-primary pr-8"
            />
            <Search className="w-3.5 h-3.5 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Item Dropdown Panel */}
          {itemDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-charcoal-surface border border-border-crisp rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-border-crisp/40 font-mono">
              <div className="p-2 bg-slate-panel/50 text-[10px] text-on-surface-variant flex items-center justify-between">
                <span>{filteredItems.length} matching items</span>
                <span>Tournament standard</span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="p-3 text-center text-on-surface-variant text-xs">
                  No matching items found.
                </div>
              ) : (
                filteredItems.slice(0, 50).map((item) => {
                  const legality = isItemLegal(item.id, format, member.speciesName);
                  const isSelected = member.item?.toLowerCase() === item.name.toLowerCase();

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onUpdate((m) => ({ ...m, item: item.name }));
                        setItemDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 text-left hover:bg-slate-panel transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                        isSelected ? "bg-primary/10 border-l-2 border-primary" : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">
                            {item.name}
                          </span>
                          {item.megaStone && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] font-bold">
                              MEGA STONE
                            </span>
                          )}
                          {item.isTopCompetitive && !item.megaStone && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                              COMPETITIVE
                            </span>
                          )}
                          {!legality.legal && (
                            <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold flex items-center gap-0.5">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              PAST GEN
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 2. Ability Switcher Dropdown */}
        <div className="space-y-1.5">
          <label className="text-on-surface-variant block font-semibold">
            Ability:
          </label>
          <select
            value={member.ability || legalAbilities[0] || ""}
            onChange={(e) => onUpdate((m) => ({ ...m, ability: e.target.value.replace(/\s*\([^)]*\)/g, "") }))}
            className="w-full px-3 py-2 rounded-xl bg-slate-panel border border-border-crisp text-on-surface cursor-pointer focus:outline-none focus:border-primary"
          >
            {legalAbilities.map((ab) => (
              <option key={ab} value={ab}>
                {ab}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Nature */}
        <div className="space-y-1.5">
          <label className="text-on-surface-variant block font-semibold">
            Nature:
          </label>
          <select
            value={member.nature.toLowerCase()}
            onChange={(e) => onUpdate((m) => ({ ...m, nature: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-slate-panel border border-border-crisp text-on-surface capitalize cursor-pointer focus:outline-none focus:border-primary"
          >
            {Object.keys(NATURE_MODIFIERS).map((nat) => {
              const conf = NATURE_MODIFIERS[nat];
              const label = conf.plus
                ? `${nat} (+${conf.plus.toUpperCase()}, -${conf.minus?.toUpperCase()})`
                : `${nat} (Neutral)`;
              return (
                <option key={nat} value={nat}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* 4. Tera Type */}
        <div className="space-y-1.5">
          <label className="text-on-surface-variant block font-semibold">
            Tera Type:
          </label>
          <select
            value={(member.teraType || "Normal").toLowerCase()}
            onChange={(e) =>
              onUpdate((m) => ({
                ...m,
                teraType: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1),
              }))
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-panel border border-border-crisp text-on-surface capitalize cursor-pointer focus:outline-none focus:border-secondary"
          >
            {ALL_POKEMON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Moves Selectors with Legal Learnset Combobox */}
      <div ref={moveContainerRef} className="space-y-2 pt-2 border-t border-border-crisp">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-semibold text-on-surface block">
            Technique Movepool (4 Moves • Legal Learnset Enforced):
          </label>
          <span className="text-[10px] font-mono text-on-surface-variant">
            {legalMoveIds.size} Legal Moves Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {([0, 1, 2, 3] as const).map((idx) => {
            const currentMove = member.moves[idx] || "";
            const cleanKey = currentMove.toLowerCase().trim().replace(/[\s_]/g, "-");
            const moveMeta = movesData[cleanKey] || movesData[cleanKey.replace(/-/g, " ")];
            const isSlotActive = activeMoveSlot === idx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl bg-slate-panel/40 border transition-all space-y-2 relative ${
                  isSlotActive ? "border-primary ring-1 ring-primary" : "border-border-crisp"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-on-surface-variant font-bold">
                    Move #{idx + 1}
                  </span>
                  {moveMeta?.type && (
                    <span
                      className="px-1.5 py-0.2 rounded text-[10px] font-bold text-white uppercase"
                      style={{
                        backgroundColor:
                          TYPE_CONFIGS[moveMeta.type.toLowerCase()]?.colorHex || "#666",
                      }}
                    >
                      {moveMeta.type}
                    </span>
                  )}
                </div>

                {/* Move Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={isSlotActive ? moveSearchQuery : currentMove}
                    onFocus={() => {
                      setActiveMoveSlot(idx);
                      setMoveSearchQuery(currentMove);
                    }}
                    onChange={(e) => {
                      setMoveSearchQuery(e.target.value);
                      setActiveMoveSlot(idx);
                    }}
                    placeholder={`Select Move ${idx + 1}...`}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-surface border border-border-crisp text-xs font-mono text-on-surface focus:outline-none focus:border-primary pr-6"
                  />
                  {currentMove && !isSlotActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newMoves = [...member.moves] as [string, string, string, string];
                        newMoves[idx] = "";
                        onUpdate((m) => ({ ...m, moves: newMoves }));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Move Metadata Preview */}
                {moveMeta && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant pt-0.5">
                    <span className="capitalize">{moveMeta.category || "Physical"}</span>
                    <span>Pwr: {moveMeta.power || "—"}</span>
                    <span>Acc: {moveMeta.accuracy || "—"}</span>
                  </div>
                )}

                {/* Move Dropdown Panel */}
                {isSlotActive && (
                  <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-charcoal-surface border border-border-crisp rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-border-crisp/40 font-mono">
                    <div className="p-2 bg-slate-panel/60 text-[10px] text-on-surface-variant flex items-center justify-between sticky top-0 backdrop-blur-md">
                      <span>{filteredLegalMoves.length} legal moves</span>
                      <span>Learnset</span>
                    </div>

                    {filteredLegalMoves.length === 0 ? (
                      <div className="p-3 text-center text-on-surface-variant text-xs">
                        No legal moves matching &quot;{moveSearchQuery}&quot;.
                      </div>
                    ) : (
                      filteredLegalMoves.slice(0, 40).map((m) => {
                        const isEquipped = member.moves.includes(m.name);
                        const conf = TYPE_CONFIGS[m.meta?.type?.toLowerCase() || "normal"];

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              const newMoves = [...member.moves] as [string, string, string, string];
                              newMoves[idx] = m.name;
                              onUpdate((mUp) => ({ ...mUp, moves: newMoves }));
                              setActiveMoveSlot(null);
                            }}
                            className={`w-full p-2 text-left hover:bg-slate-panel transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                              isEquipped ? "bg-primary/10" : ""
                            }`}
                          >
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-on-surface">
                                  {m.name}
                                </span>
                                {m.meta?.type && (
                                  <span
                                    className="px-1 py-0.2 rounded text-[8px] font-bold text-white uppercase"
                                    style={{ backgroundColor: conf?.colorHex || "#666" }}
                                  >
                                    {m.meta.type.slice(0, 3)}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 text-[9px] text-on-surface-variant mt-0.5">
                                <span className="capitalize">{m.meta?.category}</span>
                                <span>Pwr: {m.meta?.power || "—"}</span>
                                <span>Acc: {m.meta?.accuracy || "—"}</span>
                              </div>
                            </div>
                            {isEquipped && (
                              <span className="text-[9px] text-primary font-bold shrink-0">
                                Equipped
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* EV Budget & Slider Manager */}
      <div className="space-y-4 pt-2 border-t border-border-crisp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-on-surface">
                Effort Values (EVs)
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Budget: <strong className="text-primary">{totalEvs}</strong> / 510 Total
              </span>
            </div>
            {/* Budget Bar */}
            <div className="w-48 h-1.5 rounded-full bg-slate-panel overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  totalEvs >= 508 ? "bg-emerald-400" : "bg-primary"
                }`}
                style={{ width: `${(totalEvs / 510) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className="text-on-surface-variant mr-1">Presets:</span>
            <button
              onClick={() => applySpreadPreset("physical")}
              className="px-2 py-1 rounded bg-slate-panel hover:bg-slate-panel/80 border border-border-crisp text-on-surface cursor-pointer"
            >
              Max Atk/Spe
            </button>
            <button
              onClick={() => applySpreadPreset("special")}
              className="px-2 py-1 rounded bg-slate-panel hover:bg-slate-panel/80 border border-border-crisp text-on-surface cursor-pointer"
            >
              Max SpA/Spe
            </button>
            <button
              onClick={() => applySpreadPreset("bulkyPhys")}
              className="px-2 py-1 rounded bg-slate-panel hover:bg-slate-panel/80 border border-border-crisp text-on-surface cursor-pointer"
            >
              Bulky Def
            </button>
            <button
              onClick={() => applySpreadPreset("bulkySpd")}
              className="px-2 py-1 rounded bg-slate-panel hover:bg-slate-panel/80 border border-border-crisp text-on-surface cursor-pointer"
            >
              Bulky SpD
            </button>
            <button
              onClick={() => applySpreadPreset("zero")}
              className="px-2 py-1 rounded bg-slate-panel hover:bg-slate-panel/80 border border-border-crisp text-red-400 cursor-pointer"
            >
              Clear
            </button>

            {/* Auto-Optimize IVs Button */}
            <button
              onClick={handleAutoOptimizeIvs}
              className="px-2.5 py-1 rounded bg-secondary/15 hover:bg-secondary text-secondary hover:text-black border border-secondary/40 font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              title="Sets 0 Atk IV if running no physical moves (minimizes Foul Play / confusion), and 0 Spe IV if running speed-reducing nature."
            >
              <Wand2 className="w-3 h-3" />
              Auto-Optimize IVs
            </button>
          </div>
        </div>

        {/* Individual Values (IVs) Quick Controls */}
        <div className="p-3 rounded-xl bg-slate-panel/40 border border-border-crisp flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface">Individual Values (IVs):</span>
            <span className="text-[10px] text-on-surface-variant">Competitive optimization for Foul Play & Trick Room</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            {/* Atk IV Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface font-semibold">Atk IV:</span>
              <button
                onClick={() => onUpdate((m) => ({ ...m, ivs: { ...m.ivs, atk: 0 } }))}
                className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  member.ivs.atk === 0
                    ? "bg-secondary text-black font-bold border-secondary shadow-xs"
                    : "bg-charcoal-surface text-on-surface-variant border-border-crisp hover:text-on-surface"
                }`}
                title="0 Atk IV minimizes Foul Play & Confusion self-hit damage"
              >
                0 (Min Foul Play)
              </button>
              <button
                onClick={() => onUpdate((m) => ({ ...m, ivs: { ...m.ivs, atk: 31 } }))}
                className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  member.ivs.atk === 31
                    ? "bg-primary text-white font-bold border-primary shadow-xs"
                    : "bg-charcoal-surface text-on-surface-variant border-border-crisp hover:text-on-surface"
                }`}
              >
                31 (Max)
              </button>
            </div>

            {/* Spe IV Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface font-semibold">Spe IV:</span>
              <button
                onClick={() => onUpdate((m) => ({ ...m, ivs: { ...m.ivs, spe: 0 } }))}
                className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  member.ivs.spe === 0
                    ? "bg-purple-500 text-white font-bold border-purple-400 shadow-xs"
                    : "bg-charcoal-surface text-on-surface-variant border-border-crisp hover:text-on-surface"
                }`}
                title="0 Spe IV minimizes Speed for Trick Room and slow U-turn/Volt Switch"
              >
                0 (Trick Room)
              </button>
              <button
                onClick={() => onUpdate((m) => ({ ...m, ivs: { ...m.ivs, spe: 31 } }))}
                className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  member.ivs.spe === 31
                    ? "bg-primary text-white font-bold border-primary shadow-xs"
                    : "bg-charcoal-surface text-on-surface-variant border-border-crisp hover:text-on-surface"
                }`}
              >
                31 (Max)
              </button>
            </div>
          </div>
        </div>

        {/* 6 Stat Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(STAT_LABELS) as StatName[]).map((stat) => {
            const info = STAT_LABELS[stat];
            const currentVal = member.evs[stat] || 0;

            return (
              <div
                key={stat}
                className="p-3 rounded-xl bg-slate-panel/30 border border-border-crisp space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-on-surface">{info.label}</span>
                  <span className="font-bold text-primary">{currentVal}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="252"
                  step="4"
                  value={currentVal}
                  onChange={(e) => handleEvChange(stat, parseInt(e.target.value, 10) || 0)}
                  className="w-full accent-primary cursor-pointer"
                />

                <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                  <button
                    onClick={() => handleEvChange(stat, 0)}
                    className="px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handleEvChange(stat, currentVal + 4)}
                    className="px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                  >
                    +4
                  </button>
                  <button
                    onClick={() => handleEvChange(stat, 252)}
                    className="px-1.5 py-0.5 rounded bg-surface-container-low text-primary font-bold hover:bg-primary/20"
                  >
                    252
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
