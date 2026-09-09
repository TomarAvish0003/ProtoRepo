"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  TeamMember,
  DamageCalcParams,
  DamageRollResult,
  WeatherType,
  TerrainType,
  BattleFormat,
  StatSpread,
  StatStages,
} from "@/app/utils/teamBuilder/types";
import { calculateDamage } from "@/app/utils/teamBuilder/damageCalcEngine";
import { META_THREATS_LIST, MetaThreat } from "@/app/utils/teamBuilder/metaThreats";
import { X, Sparkles } from "lucide-react";
import SurvivalAreaCurve from "./SurvivalAreaCurve";

interface DamageCalculatorDrawerProps {
  attackerMember: TeamMember;
  pokedexData: any[];
  movesData: Record<string, any>;
  onClose?: () => void;
}

export default function DamageCalculatorDrawer({
  attackerMember,
  pokedexData,
  movesData,
  onClose,
}: DamageCalculatorDrawerProps) {
  // Attacker State
  const [selectedMoveIndex, setSelectedMoveIndex] = useState(0);
  const [attackerTeraActive, setAttackerTeraActive] = useState(false);
  const [attackerBurned, setAttackerBurned] = useState(false);
  const [attackerStages, setAttackerStages] = useState<StatStages>({
    atk: 0, def: 0, spa: 0, spd: 0, spe: 0,
  });

  // Defender State: Default to Great Tusk meta threat
  const [selectedThreatId, setSelectedThreatId] = useState<string>("great-tusk-def");
  const [defenderTeraActive, setDefenderTeraActive] = useState(false);
  const [defenderStages, setDefenderStages] = useState<StatStages>({
    atk: 0, def: 0, spa: 0, spd: 0, spe: 0,
  });
  const defenderCurrentHpPct = 100;

  // Field State
  const [format, setFormat] = useState<BattleFormat>("singles");
  const [weather, setWeather] = useState<WeatherType>("none");
  const [terrain, setTerrain] = useState<TerrainType>("none");
  const [isReflect, setIsReflect] = useState(false);
  const [isLightScreen, setIsLightScreen] = useState(false);
  const isAuroraVeil = false;
  const [isCritical, setIsCritical] = useState(false);
  const [isStealthRock, setIsStealthRock] = useState(false);
  const spikesLayers = 0;

  // Active Defender Threat Object
  const activeThreat: MetaThreat = useMemo(() => {
    const found = META_THREATS_LIST.find((t) => t.id === selectedThreatId);
    return found || META_THREATS_LIST[0];
  }, [selectedThreatId]);

  // Dex data lookup
  const dexMap = useMemo(() => {
    const map = new Map<number, any>();
    for (const p of pokedexData) {
      map.set(p.id, p);
    }
    return map;
  }, [pokedexData]);

  // Attacker Base Stats
  const attackerBaseStats: StatSpread = useMemo(() => {
    const attackerDex = dexMap.get(attackerMember.pokemonId);
    return (
      attackerDex?.stats || {
        hp: 80,
        atk: 80,
        def: 80,
        spa: 80,
        spd: 80,
        spe: 80,
      }
    );
  }, [dexMap, attackerMember.pokemonId]);

  // Selected Move Info
  const activeMoveName = attackerMember.moves[selectedMoveIndex] || "Tackle";
  const cleanMoveKey = activeMoveName.toLowerCase().trim().replace(/[\s_]/g, "-");
  const activeMoveRaw = movesData[cleanMoveKey] || movesData[cleanMoveKey.replace(/-/g, " ")];

  const movePower = parseInt(activeMoveRaw?.power, 10) || 80;
  const moveType = (activeMoveRaw?.type || "Normal").toLowerCase();
  const moveCategory = (activeMoveRaw?.category || "Physical") as "Physical" | "Special" | "Status";

  // Calculate Damage
  const calcResult: DamageRollResult = useMemo(() => {
    const params: DamageCalcParams = {
      attacker: {
        speciesName: attackerMember.speciesName,
        types: attackerMember.types,
        baseStats: attackerBaseStats,
        level: attackerMember.level,
        evs: attackerMember.evs,
        ivs: attackerMember.ivs,
        nature: attackerMember.nature,
        stages: attackerStages,
        item: attackerMember.item,
        ability: attackerMember.ability,
        teraType: attackerMember.teraType,
        isTeraActive: attackerTeraActive,
        isBurned: attackerBurned,
      },
      defender: {
        speciesName: activeThreat.speciesName,
        types: activeThreat.types,
        baseStats: activeThreat.baseStats,
        level: activeThreat.level,
        evs: activeThreat.evs,
        ivs: activeThreat.ivs,
        nature: activeThreat.nature,
        stages: defenderStages,
        item: activeThreat.item,
        ability: activeThreat.ability,
        teraType: activeThreat.teraType,
        isTeraActive: defenderTeraActive,
        currentHpPercent: defenderCurrentHpPct,
      },
      move: {
        name: activeMoveName,
        type: moveType,
        category: moveCategory,
        power: movePower,
      },
      field: {
        format,
        weather,
        terrain,
        isReflect,
        isLightScreen,
        isAuroraVeil,
        isCritical,
        isStealthRock,
        spikesLayers,
      },
    };

    return calculateDamage(params);
  }, [
    attackerMember,
    attackerBaseStats,
    attackerStages,
    attackerTeraActive,
    attackerBurned,
    activeThreat,
    defenderStages,
    defenderTeraActive,
    defenderCurrentHpPct,
    activeMoveName,
    moveType,
    moveCategory,
    movePower,
    format,
    weather,
    terrain,
    isReflect,
    isLightScreen,
    isAuroraVeil,
    isCritical,
    isStealthRock,
    spikesLayers,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Close */}
      <div className="p-5 rounded-2xl bg-charcoal-surface border border-border-crisp flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-primary uppercase">
              Damage Studio // ダメージ計算
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono font-bold">
              16-Roll Engine
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mt-0.5">
            Deterministic Damage & Common Threat Benchmarks
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Simulates tournament outcomes against tournament staples with discrete damage distribution.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-panel hover:bg-slate-panel/80 text-on-surface-variant hover:text-on-surface border border-border-crisp transition-all cursor-pointer self-start sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Calculation Studio: Attacker vs Defender */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Attacker Panel (Left 4 cols) */}
        <div className="lg:col-span-4 bg-charcoal-surface border border-border-crisp rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border-crisp pb-3">
            <div className="w-12 h-12 relative rounded-xl bg-surface-container-low border border-border-crisp p-1 shrink-0">
              {attackerMember.sprite && (
                <Image
                  src={attackerMember.sprite}
                  alt={attackerMember.speciesName}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono text-primary uppercase font-bold">
                Attacking Pokémon
              </span>
              <h4 className="text-base font-bold text-on-surface">
                {attackerMember.speciesName}
              </h4>
              <span className="text-xs font-mono text-on-surface-variant">
                Lv. {attackerMember.level} • {attackerMember.nature}
              </span>
            </div>
          </div>

          {/* Move Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-on-surface flex items-center justify-between">
              <span>Selected Attack Move:</span>
              <span className="text-primary font-bold">Slot #{selectedMoveIndex + 1}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {attackerMember.moves.map((mv, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMoveIndex(idx)}
                  className={`p-2 rounded-xl text-left border text-xs font-mono transition-all cursor-pointer truncate ${
                    selectedMoveIndex === idx
                      ? "bg-primary/15 text-primary border-primary font-bold shadow-xs"
                      : "bg-slate-panel/40 text-on-surface-variant border-border-crisp hover:text-on-surface"
                  }`}
                >
                  {mv || `Empty Slot ${idx + 1}`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-on-surface-variant">
              <span className="px-2 py-0.5 rounded bg-surface-container-low border border-border-crisp uppercase font-bold text-on-surface">
                {moveType}
              </span>
              <span>{moveCategory}</span>
              <span>• Power: {movePower}</span>
            </div>
          </div>

          {/* Attacker Toggles */}
          <div className="space-y-2 pt-2 border-t border-border-crisp">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface">Terastallize Attacker:</span>
              <button
                onClick={() => setAttackerTeraActive(!attackerTeraActive)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  attackerTeraActive
                    ? "bg-secondary/20 text-secondary border-secondary/40 font-bold"
                    : "bg-slate-panel text-on-surface-variant border-border-crisp"
                }`}
              >
                Tera {attackerMember.teraType || "Active"}: {attackerTeraActive ? "ON" : "OFF"}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface">Status (Burned):</span>
              <button
                onClick={() => setAttackerBurned(!attackerBurned)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  attackerBurned
                    ? "bg-red-500/20 text-red-400 border-red-500/40 font-bold"
                    : "bg-slate-panel text-on-surface-variant border-border-crisp"
                }`}
              >
                Burn: {attackerBurned ? "ON (-50% Phys)" : "OFF"}
              </button>
            </div>

            {/* Stat Stage Adjuster */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1">
                <span>Stat Stage Modifier:</span>
                <span className="font-bold text-primary">
                  {moveCategory === "Special" ? "SpA" : "Atk"}:{" "}
                  {moveCategory === "Special"
                    ? attackerStages.spa > 0
                      ? `+${attackerStages.spa}`
                      : attackerStages.spa
                    : attackerStages.atk > 0
                    ? `+${attackerStages.atk}`
                    : attackerStages.atk}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[-2, -1, 0, 1, 2, 3, 4].map((stg) => {
                  const activeStg = moveCategory === "Special" ? attackerStages.spa : attackerStages.atk;
                  return (
                    <button
                      key={stg}
                      onClick={() =>
                        setAttackerStages((prev) => ({
                          ...prev,
                          ...(moveCategory === "Special" ? { spa: stg } : { atk: stg }),
                        }))
                      }
                      className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                        activeStg === stg
                          ? "bg-primary text-white border-primary font-bold"
                          : "bg-slate-panel text-on-surface-variant border-border-crisp hover:text-on-surface"
                      }`}
                    >
                      {stg > 0 ? `+${stg}` : stg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Damage Output & 16-Roll Visualizer (Center 4 cols) */}
        <div className="lg:col-span-4 bg-linear-to-b from-charcoal-surface to-slate-panel/40 border border-border-crisp rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-center font-mono space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">
                Combat Calculation Result
              </span>
              <div className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                {calcResult.minPercent}% – {calcResult.maxPercent}%
              </div>
              <div className="text-xs font-mono text-on-surface-variant">
                Damage: {calcResult.minDamage} – {calcResult.maxDamage} HP / {calcResult.defenderMaxHp} HP
              </div>
            </div>

            {/* KO Probability Banner */}
            <div className="mt-4 p-3 rounded-xl bg-charcoal-surface border border-secondary/30 text-center shadow-xs">
              <div className="text-xs font-mono font-bold text-secondary uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {calcResult.koChanceText}
              </div>
            </div>

            {/* 16 Discrete Integer Damage Rolls Bar Visualizer */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                <span>16 Discrete Rolls ([85..100]%)</span>
                <span>Max: {calcResult.maxDamage}</span>
              </div>

              <div className="grid grid-cols-16 gap-1 h-16 items-end bg-surface-container-low/50 p-1.5 rounded-xl border border-border-crisp">
                {calcResult.rolls.map((roll, rIdx) => {
                  const rollPct = calcResult.defenderMaxHp > 0
                    ? Math.min(100, Math.round((roll / calcResult.defenderMaxHp) * 100))
                    : 0;
                  const isKo = roll >= calcResult.defenderMaxHp;

                  return (
                    <div
                      key={rIdx}
                      className="group relative flex flex-col items-center h-full justify-end"
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          isKo
                            ? "bg-secondary shadow-[0_0_6px_rgba(0,229,255,0.4)]"
                            : "bg-primary/80 group-hover:bg-primary"
                        }`}
                        style={{ height: `${Math.max(10, rollPct)}%` }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:block z-30 px-1.5 py-0.5 rounded bg-black text-white text-[9px] font-mono whitespace-nowrap shadow-md">
                        {roll} ({rollPct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border-crisp text-center font-mono text-[10px]">
            <div className="p-2 rounded-lg bg-slate-panel/50 border border-border-crisp">
              <span className="text-on-surface-variant block">Type Matchup</span>
              <span className="font-bold text-on-surface">{calcResult.typeMultiplier}×</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-panel/50 border border-border-crisp">
              <span className="text-on-surface-variant block">STAB Factor</span>
              <span className="font-bold text-on-surface">{calcResult.isStab ? "1.5× / 2.0×" : "1.0×"}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-panel/50 border border-border-crisp">
              <span className="text-on-surface-variant block">Stealth Rock</span>
              <span className="font-bold text-secondary">{calcResult.stealthRockDamage} HP</span>
            </div>
          </div>

          {/* 2HKO Discrete Survival Area Curve Visualizer */}
          <SurvivalAreaCurve result={calcResult} />
        </div>

        {/* Defender Panel: Benchmark Meta Staples (Right 4 cols) */}
        <div className="lg:col-span-4 bg-charcoal-surface border border-border-crisp rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border-crisp pb-3">
            <div>
              <span className="text-[10px] font-mono text-secondary uppercase font-bold">
                Defending Target
              </span>
              <h4 className="text-base font-bold text-on-surface">
                {activeThreat.name}
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary/15 text-secondary border border-secondary/30">
              {activeThreat.formatTier} Benchmark
            </span>
          </div>

          {/* Quick Threat Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-on-surface">
              Select Meta Staple Target:
            </label>
            <select
              value={selectedThreatId}
              onChange={(e) => setSelectedThreatId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-panel border border-border-crisp text-xs font-mono text-on-surface cursor-pointer focus:outline-none focus:border-secondary"
            >
              {META_THREATS_LIST.map((threat) => (
                <option key={threat.id} value={threat.id}>
                  {threat.name} ({threat.role})
                </option>
              ))}
            </select>
            <div className="text-[10px] font-mono text-on-surface-variant">
              Spread: {activeThreat.evs.hp} HP / {activeThreat.evs.def} Def / {activeThreat.evs.spd} SpD • {activeThreat.nature} • {activeThreat.item}
            </div>
          </div>

          {/* Defender Toggles */}
          <div className="space-y-2 pt-2 border-t border-border-crisp text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-on-surface">Tera Defender:</span>
              <button
                onClick={() => setDefenderTeraActive(!defenderTeraActive)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  defenderTeraActive
                    ? "bg-secondary/20 text-secondary border-secondary/40 font-bold"
                    : "bg-slate-panel text-on-surface-variant border-border-crisp"
                }`}
              >
                Tera {activeThreat.teraType || "Active"}: {defenderTeraActive ? "ON" : "OFF"}
              </button>
            </div>

            {/* Defender Stat Stages */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1">
                <span>Defensive Stage:</span>
                <span className="font-bold text-secondary">
                  {moveCategory === "Special" ? "SpD" : "Def"}:{" "}
                  {moveCategory === "Special"
                    ? defenderStages.spd > 0
                      ? `+${defenderStages.spd}`
                      : defenderStages.spd
                    : defenderStages.def > 0
                    ? `+${defenderStages.def}`
                    : defenderStages.def}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[-2, -1, 0, 1, 2, 3, 4].map((stg) => {
                  const activeStg = moveCategory === "Special" ? defenderStages.spd : defenderStages.def;
                  return (
                    <button
                      key={stg}
                      onClick={() =>
                        setDefenderStages((prev) => ({
                          ...prev,
                          ...(moveCategory === "Special" ? { spd: stg } : { def: stg }),
                        }))
                      }
                      className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                        activeStg === stg
                          ? "bg-secondary text-black border-secondary font-bold"
                          : "bg-slate-panel text-on-surface-variant border-border-crisp hover:text-on-surface"
                      }`}
                    >
                      {stg > 0 ? `+${stg}` : stg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field & Battlefield Modifiers Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-surface border border-border-crisp shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border-crisp pb-2">
          <span className="text-xs font-mono text-on-surface uppercase font-bold">
            Battlefield Environment & Modifiers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs font-mono">
          {/* Format */}
          <div className="space-y-1">
            <span className="text-on-surface-variant text-[10px]">Battle Format:</span>
            <div className="flex rounded-lg overflow-hidden border border-border-crisp">
              <button
                onClick={() => setFormat("singles")}
                className={`flex-1 py-1 text-center cursor-pointer ${
                  format === "singles" ? "bg-primary text-white font-bold" : "bg-slate-panel text-on-surface-variant"
                }`}
              >
                Singles
              </button>
              <button
                onClick={() => setFormat("doubles")}
                className={`flex-1 py-1 text-center cursor-pointer ${
                  format === "doubles" ? "bg-primary text-white font-bold" : "bg-slate-panel text-on-surface-variant"
                }`}
              >
                Doubles
              </button>
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-1">
            <span className="text-on-surface-variant text-[10px]">Weather:</span>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value as WeatherType)}
              className="w-full px-2 py-1 rounded-lg bg-slate-panel border border-border-crisp text-on-surface capitalize cursor-pointer text-xs"
            >
              <option value="none">None</option>
              <option value="sun">Sun (1.5x Fire)</option>
              <option value="rain">Rain (1.5x Water)</option>
              <option value="sand">Sandstorm</option>
              <option value="snow">Snow</option>
            </select>
          </div>

          {/* Terrain */}
          <div className="space-y-1">
            <span className="text-on-surface-variant text-[10px]">Terrain:</span>
            <select
              value={terrain}
              onChange={(e) => setTerrain(e.target.value as TerrainType)}
              className="w-full px-2 py-1 rounded-lg bg-slate-panel border border-border-crisp text-on-surface capitalize cursor-pointer text-xs"
            >
              <option value="none">None</option>
              <option value="electric">Electric (1.3x)</option>
              <option value="grassy">Grassy (1.3x)</option>
              <option value="psychic">Psychic (1.3x)</option>
              <option value="misty">Misty (0.5x Drag)</option>
            </select>
          </div>

          {/* Screens */}
          <div className="space-y-1">
            <span className="text-on-surface-variant text-[10px]">Screens:</span>
            <button
              onClick={() => {
                if (moveCategory === "Special") setIsLightScreen(!isLightScreen);
                else setIsReflect(!isReflect);
              }}
              className={`w-full py-1 rounded-lg border cursor-pointer ${
                (moveCategory === "Special" ? isLightScreen : isReflect)
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-panel text-on-surface-variant border-border-crisp"
              }`}
            >
              {moveCategory === "Special" ? "Light Screen" : "Reflect"}: {(moveCategory === "Special" ? isLightScreen : isReflect) ? "ON" : "OFF"}
            </button>
          </div>

          {/* Stealth Rock */}
          <div className="space-y-1">
            <span className="text-on-surface-variant text-[10px]">Stealth Rock:</span>
            <button
              onClick={() => setIsStealthRock(!isStealthRock)}
              className={`w-full py-1 rounded-lg border cursor-pointer ${
                isStealthRock
                  ? "bg-secondary/20 text-secondary border-secondary/40 font-bold"
                  : "bg-slate-panel text-on-surface-variant border-border-crisp"
              }`}
            >
              Stealth Rock: {isStealthRock ? "ON" : "OFF"}
            </button>
          </div>

          {/* Critical Hit */}
          <div className="space-y-1">
            <span className="text-on-surface-variant text-[10px]">Critical Hit:</span>
            <button
              onClick={() => setIsCritical(!isCritical)}
              className={`w-full py-1 rounded-lg border cursor-pointer ${
                isCritical
                  ? "bg-red-500/20 text-red-400 border-red-500/40 font-bold"
                  : "bg-slate-panel text-on-surface-variant border-border-crisp"
              }`}
            >
              Critical: {isCritical ? "YES (1.5x)" : "NO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

