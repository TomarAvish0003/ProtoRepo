"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { TeamMember, SpeedBenchmark } from "@/app/utils/teamBuilder/types";
import { calcActualStat, getNatureMultiplier } from "@/app/utils/teamBuilder/damageCalcEngine";
import { Wind, RefreshCw, AlertCircle, Plus, Minus } from "lucide-react";

interface SpeedTierRulerProps {
  members: TeamMember[];
  pokedexData: any[];
  onSelectMember: (id: string) => void;
  onUpdateMember?: (id: string, updater: (m: TeamMember) => TeamMember) => void;
}

const META_BENCHMARKS: SpeedBenchmark[] = [
  { label: "Booster Iron Valiant", sublabel: "+1 Spe (307)", speed: 307, colorClass: "border-cyan-400 text-cyan-400 bg-cyan-500/10" },
  { label: "Max Spe Dragapult", sublabel: "Jolly 252 (213)", speed: 213, colorClass: "border-purple-400 text-purple-400 bg-purple-500/10" },
  { label: "Max Spe Meowscarada", sublabel: "Jolly 252 (192)", speed: 192, colorClass: "border-emerald-400 text-emerald-400 bg-emerald-500/10" },
  { label: "Max Spe Base 100", sublabel: "Timid 252 (167)", speed: 167, colorClass: "border-amber-400 text-amber-400 bg-amber-500/10" },
  { label: "Max Spe Gholdengo", sublabel: "Timid 252 (149)", speed: 149, colorClass: "border-yellow-400 text-yellow-400 bg-yellow-500/10" },
  { label: "Max Spe Great Tusk", sublabel: "Jolly 252 (152)", speed: 152, colorClass: "border-orange-400 text-orange-400 bg-orange-500/10" },
  { label: "Neutral Kingambit", sublabel: "44 Spe (76)", speed: 76, colorClass: "border-blue-400 text-blue-400 bg-blue-500/10" },
  { label: "Min Spe Torkoal", sublabel: "0 IV Quiet (38)", speed: 38, colorClass: "border-red-400 text-red-400 bg-red-500/10" },
];

export default function SpeedTierRuler({
  members,
  pokedexData,
  onSelectMember,
  onUpdateMember,
}: SpeedTierRulerProps) {
  const [hasTailwind, setHasTailwind] = useState(false);
  const [isTrickRoom, setIsTrickRoom] = useState(false);
  const [scarfToggles, setScarfToggles] = useState<Record<string, boolean>>({});
  const [paralysisToggles, setParalysisToggles] = useState<Record<string, boolean>>({});
  const [speedStages, setSpeedStages] = useState<Record<string, number>>({});

  // Lookup map for pokedex data base stats
  const dexMap = useMemo(() => {
    const map = new Map<number, any>();
    for (const p of pokedexData) {
      map.set(p.id, p);
    }
    return map;
  }, [pokedexData]);

  // Stage multiplier table: [-6 ... +6]
  const getStageMultiplier = (stage: number): number => {
    if (stage > 0) return (2 + stage) / 2;
    if (stage < 0) return 2 / (2 + Math.abs(stage));
    return 1;
  };

  // Compute effective speeds for all members
  const teamSpeedEntries = useMemo(() => {
    return members.map((m) => {
      const dexEntry = dexMap.get(m.pokemonId);
      const baseSpeed = dexEntry?.stats?.spe || 80;
      const natureMult = getNatureMultiplier(m.nature, "spe");
      const rawSpeed = calcActualStat(
        baseSpeed,
        m.ivs.spe,
        m.evs.spe,
        m.level,
        natureMult,
        false
      );

      const hasScarf =
        scarfToggles[m.id] ?? (m.item?.toLowerCase().replace(/[\s-_]/g, "") === "choicescarf");
      const hasBooster =
        m.item?.toLowerCase().replace(/[\s-_]/g, "") === "boosterenergy" &&
        (m.ability?.toLowerCase().includes("proto") || m.ability?.toLowerCase().includes("quark"));
      const isParalyzed = !!paralysisToggles[m.id];
      const stage = speedStages[m.id] || 0;

      let effectiveSpeed = rawSpeed;
      if (hasScarf) effectiveSpeed = Math.floor(effectiveSpeed * 1.5);
      if (hasBooster) effectiveSpeed = Math.floor(effectiveSpeed * 1.5);
      if (hasTailwind) effectiveSpeed *= 2;
      if (isParalyzed) effectiveSpeed = Math.floor(effectiveSpeed * 0.5);

      const stageMult = getStageMultiplier(stage);
      effectiveSpeed = Math.floor(effectiveSpeed * stageMult);

      return {
        memberId: m.id,
        pokemonId: m.pokemonId,
        name: m.speciesName,
        effectiveSpeed,
        baseSpeed,
        ev: m.evs.spe,
        natureModifier: natureMult,
        hasScarf,
        hasBooster,
        isParalyzed,
        stage,
        hasTailwind,
      };
    });
  }, [members, dexMap, scarfToggles, paralysisToggles, speedStages, hasTailwind]);

  // Detect speed ties between teammates and against meta benchmarks
  const speedTies = useMemo(() => {
    const ties = new Map<string, { tiedWith: string; isBenchmark: boolean }[]>();

    for (let i = 0; i < teamSpeedEntries.length; i++) {
      const a = teamSpeedEntries[i];
      const list: { tiedWith: string; isBenchmark: boolean }[] = [];

      // Teammate ties
      for (let j = 0; j < teamSpeedEntries.length; j++) {
        if (i === j) continue;
        const b = teamSpeedEntries[j];
        if (a.effectiveSpeed === b.effectiveSpeed) {
          list.push({ tiedWith: b.name, isBenchmark: false });
        }
      }

      // Benchmark ties
      for (const bm of META_BENCHMARKS) {
        if (a.effectiveSpeed === bm.speed) {
          list.push({ tiedWith: bm.label, isBenchmark: true });
        }
      }

      if (list.length > 0) {
        ties.set(a.memberId, list);
      }
    }

    return ties;
  }, [teamSpeedEntries]);

  // Sort team members: if Trick Room is active, invert ordering (lowest speed moves first!)
  const sortedTeam = useMemo(() => {
    return [...teamSpeedEntries].sort((a, b) => {
      if (isTrickRoom) {
        return a.effectiveSpeed - b.effectiveSpeed;
      }
      return b.effectiveSpeed - a.effectiveSpeed;
    });
  }, [teamSpeedEntries, isTrickRoom]);

  // Calibration bounds
  const maxTeamSpeed =
    teamSpeedEntries.length > 0
      ? Math.max(...teamSpeedEntries.map((e) => e.effectiveSpeed))
      : 100;
  const maxScaleSpeed = Math.max(350, maxTeamSpeed + 30);
  const minScaleSpeed = 20;

  const getPositionPercent = (speed: number) => {
    const clamped = Math.max(minScaleSpeed, Math.min(maxScaleSpeed, speed));
    const pct = ((clamped - minScaleSpeed) / (maxScaleSpeed - minScaleSpeed)) * 100;
    return isTrickRoom ? 100 - pct : pct;
  };

  const handleStageChange = (memberId: string, delta: number) => {
    setSpeedStages((prev) => {
      const current = prev[memberId] || 0;
      const next = Math.max(-6, Math.min(6, current + delta));
      return { ...prev, [memberId]: next };
    });
  };

  const handleSpeedCreep = (memberId: string) => {
    if (!onUpdateMember) return;
    onUpdateMember(memberId, (m) => {
      const currentEv = m.evs.spe || 0;
      if (currentEv >= 252) return m;
      const nextEv = Math.min(252, currentEv + 4);
      return {
        ...m,
        evs: {
          ...m.evs,
          spe: nextEv,
        },
      };
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className={`p-5 rounded-2xl bg-charcoal-surface border transition-all shadow-xs ${
        isTrickRoom ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-border-crisp"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-primary uppercase">
                Action Order Gauge // 行動順序
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isTrickRoom
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-primary/10 text-primary"
              }`}>
                {isTrickRoom ? "Trick Room Inversion Active" : "Linear Speed Timeline"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mt-0.5">
              Interactive Action Order & Speed Tiers
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Visualizes turn order sequence factoring EVs, Scarf, Booster Energy, Tailwind, Paralysis, and In-Battle Stat Stages.
            </p>
          </div>

          {/* Global Battle Condition Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Trick Room Toggle */}
            <button
              onClick={() => setIsTrickRoom(!isTrickRoom)}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isTrickRoom
                  ? "bg-purple-500/25 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  : "bg-slate-panel text-on-surface-variant border-border-crisp hover:text-on-surface"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTrickRoom ? "animate-spin" : ""}`} />
              Trick Room: {isTrickRoom ? "ON (Inverted)" : "OFF"}
            </button>

            {/* Tailwind Toggle */}
            <button
              onClick={() => setHasTailwind(!hasTailwind)}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                hasTailwind
                  ? "bg-cyan-500/25 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "bg-slate-panel text-on-surface-variant border-border-crisp hover:text-on-surface"
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              Tailwind (2×): {hasTailwind ? "ACTIVE" : "OFF"}
            </button>
          </div>
        </div>

        {/* Visual Ruler Timeline */}
        <div className="mt-8 pt-4 pb-12 px-4 relative bg-slate-panel/20 rounded-xl border border-border-crisp">
          {/* Base Ruler Line */}
          <div className="w-full h-1.5 rounded-full bg-border-crisp relative">
            {/* Major Ruler Ticks */}
            {[50, 100, 150, 200, 250, 300, 350].map((tick) => {
              if (tick > maxScaleSpeed) return null;
              const pct = getPositionPercent(tick);
              return (
                <div
                  key={tick}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${pct}%` }}
                >
                  <div className="w-0.5 h-3 bg-on-surface-variant/40" />
                  <span className="text-[10px] font-mono text-on-surface-variant/60 mt-1">
                    {tick}
                  </span>
                </div>
              );
            })}

            {/* Team Member Markers */}
            {teamSpeedEntries.map((m) => {
              const pct = getPositionPercent(m.effectiveSpeed);
              const memberRaw = members.find((x) => x.id === m.memberId);
              const hasTie = speedTies.has(m.memberId);

              return (
                <div
                  key={m.memberId}
                  onClick={() => onSelectMember(m.memberId)}
                  className="absolute -top-7 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
                  style={{ left: `${pct}%` }}
                >
                  {/* Tie warning pulse */}
                  {hasTie && (
                    <div className="absolute -top-1 w-9 h-9 rounded-full border border-amber-400 animate-ping opacity-60 pointer-events-none" />
                  )}

                  {/* Sprite and Tag */}
                  <div className={`w-8 h-8 rounded-full border-2 bg-charcoal-surface shadow-md p-0.5 relative transition-transform group-hover:scale-125 ${
                    hasTie ? "border-amber-400" : isTrickRoom ? "border-purple-400" : "border-primary"
                  }`}>
                    {memberRaw?.sprite && (
                      <Image
                        src={memberRaw.sprite}
                        alt={m.name}
                        fill
                        sizes="32px"
                        className="object-contain p-0.5"
                      />
                    )}
                  </div>
                  <div className={`w-0.5 h-3 ${hasTie ? "bg-amber-400" : isTrickRoom ? "bg-purple-400" : "bg-primary"}`} />
                  <div className={`absolute top-10 px-2 py-0.5 rounded text-white text-[10px] font-mono font-bold whitespace-nowrap shadow-xs flex items-center gap-1 ${
                    hasTie ? "bg-amber-500" : isTrickRoom ? "bg-purple-600" : "bg-primary"
                  }`}>
                    {m.name}: {m.effectiveSpeed}
                    {m.stage !== 0 && (
                      <span className="text-[9px] opacity-90">({m.stage > 0 ? `+${m.stage}` : m.stage})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Speed Hierarchy Roster Table */}
      <div className="bg-charcoal-surface border border-border-crisp rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-on-surface text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>Action Order (Turn Sequence)</span>
            {isTrickRoom && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                Slowest Moves First (Trick Room)
              </span>
            )}
          </span>
          <span className="text-xs font-mono text-on-surface-variant">
            {isTrickRoom ? "Lowest Spe → Highest Spe" : "Fastest → Slowest"}
          </span>
        </h4>

        <div className="space-y-2.5">
          {sortedTeam.map((entry, idx) => {
            const raw = members.find((m) => m.id === entry.memberId);
            const tieInfo = speedTies.get(entry.memberId);

            return (
              <div
                key={entry.memberId}
                className="p-3 rounded-xl bg-slate-panel/30 border border-border-crisp flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-primary/50 transition-colors"
              >
                {/* Left: Rank, Avatar, Name, Badges */}
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-xs text-primary">
                    #{idx + 1}
                  </span>
                  <div className="w-10 h-10 relative rounded-lg bg-surface-container-low border border-border-crisp p-1 shrink-0">
                    {raw?.sprite && (
                      <Image
                        src={raw.sprite}
                        alt={entry.name}
                        fill
                        sizes="40px"
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">
                        {entry.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-container-low text-on-surface-variant border border-border-crisp">
                        Base {entry.baseSpeed}
                      </span>
                      {entry.hasScarf && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Scarf (1.5×)
                        </span>
                      )}
                      {entry.hasBooster && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Booster (1.5×)
                        </span>
                      )}
                      {entry.isParalyzed && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          PAR (0.5×)
                        </span>
                      )}
                      {entry.stage !== 0 && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          entry.stage > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {entry.stage > 0 ? `+${entry.stage}` : entry.stage} Stage
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-on-surface-variant mt-0.5">
                      {entry.ev} Spe EVs • {raw?.nature} nature
                    </div>

                    {/* Speed Tie Warning Badge */}
                    {tieInfo && tieInfo.length > 0 && (
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Speed Tie Conflict (50% coin-flip) with {tieInfo.map((t) => t.tiedWith).join(", ")}
                        </span>
                        {onUpdateMember && entry.ev < 252 && (
                          <button
                            onClick={() => handleSpeedCreep(entry.memberId)}
                            className="px-1.5 py-0.2 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 font-bold transition-all cursor-pointer"
                            title="Add 4 EVs to outspeed by 1 point"
                          >
                            +4 Spe EV (Speed Creep)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Modifiers & Effective Speed */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Stage Stepper (-6 to +6) */}
                  <div className="flex items-center rounded-lg bg-slate-panel border border-border-crisp text-xs font-mono">
                    <button
                      onClick={() => handleStageChange(entry.memberId, -1)}
                      disabled={entry.stage <= -6}
                      className="p-1 hover:bg-slate-panel/80 text-on-surface-variant hover:text-on-surface disabled:opacity-30 cursor-pointer"
                      title="Decrease Speed Stage"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold text-[10px] text-on-surface min-w-[28px] text-center">
                      {entry.stage > 0 ? `+${entry.stage}` : entry.stage}
                    </span>
                    <button
                      onClick={() => handleStageChange(entry.memberId, 1)}
                      disabled={entry.stage >= 6}
                      className="p-1 hover:bg-slate-panel/80 text-on-surface-variant hover:text-on-surface disabled:opacity-30 cursor-pointer"
                      title="Increase Speed Stage"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Scarf Toggle */}
                  <button
                    onClick={() => {
                      setScarfToggles((prev) => ({
                        ...prev,
                        [entry.memberId]: !entry.hasScarf,
                      }));
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                      entry.hasScarf
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        : "bg-slate-panel text-on-surface-variant border-border-crisp hover:text-on-surface"
                    }`}
                  >
                    Scarf: {entry.hasScarf ? "ON" : "OFF"}
                  </button>

                  {/* Paralysis Toggle */}
                  <button
                    onClick={() => {
                      setParalysisToggles((prev) => ({
                        ...prev,
                        [entry.memberId]: !entry.isParalyzed,
                      }));
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                      entry.isParalyzed
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : "bg-slate-panel text-on-surface-variant border-border-crisp hover:text-on-surface"
                    }`}
                  >
                    Paralysis: {entry.isParalyzed ? "ON" : "OFF"}
                  </button>

                  {/* Stat Output */}
                  <div className="text-right font-mono min-w-[70px]">
                    <div className="text-xl font-black text-on-surface">
                      {entry.effectiveSpeed}
                    </div>
                    <div className="text-[10px] text-secondary font-semibold uppercase">
                      Effective Spe
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitive Format Speed Benchmarks */}
      <div className="bg-charcoal-surface border border-border-crisp rounded-2xl p-5 shadow-xs">
        <h4 className="font-bold text-on-surface text-sm mb-3 flex items-center justify-between">
          <span>Competitive Meta Speed Benchmarks</span>
          <span className="text-xs font-mono text-on-surface-variant">Tier References</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {META_BENCHMARKS.map((bm) => (
            <div
              key={bm.label}
              className={`p-2.5 rounded-xl border text-xs font-mono flex flex-col justify-between ${bm.colorClass}`}
            >
              <div>
                <span className="font-bold block text-on-surface text-[11px] truncate">
                  {bm.label}
                </span>
                <span className="text-[10px] opacity-80">{bm.sublabel}</span>
              </div>
              <div className="text-right text-base font-black mt-1">
                {bm.speed} <span className="text-[9px] font-normal">Spe</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
