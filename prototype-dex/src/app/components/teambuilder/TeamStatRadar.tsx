"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo } from "react";
import { TeamMember, StatSpread } from "@/app/utils/teamBuilder/types";
import { calculateAllStats } from "@/app/utils/teamBuilder/damageCalcEngine";
import { evaluateTeamArchetype } from "@/app/utils/teamBuilder/roleClassifier";

interface TeamStatRadarProps {
  members: TeamMember[];
  selectedMember: TeamMember | null;
  pokedexData: any[];
}

const STAT_KEYS: (keyof StatSpread)[] = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS: Record<keyof StatSpread, { label: string; kanji: string }> = {
  hp: { label: "HP", kanji: "体力" },
  atk: { label: "Attack", kanji: "攻撃" },
  def: { label: "Defense", kanji: "防御" },
  spa: { label: "Sp. Atk", kanji: "特攻" },
  spd: { label: "Sp. Def", kanji: "特防" },
  spe: { label: "Speed", kanji: "素早" },
};

export default function TeamStatRadar({
  members,
  selectedMember,
  pokedexData,
}: TeamStatRadarProps) {
  const dexMap = useMemo(() => {
    const map = new Map<number, any>();
    for (const p of pokedexData) {
      map.set(p.id, p);
    }
    return map;
  }, [pokedexData]);

  // Compute calculated stats for all members
  const memberStatsList: { member: TeamMember; stats: StatSpread }[] = useMemo(() => {
    return members.map((m) => {
      const dexEntry = dexMap.get(m.pokemonId);
      const baseStats: StatSpread = dexEntry?.stats || {
        hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80,
      };
      const stats = calculateAllStats(
        baseStats,
        m.ivs,
        m.evs,
        m.nature,
        m.level,
        m.speciesName
      );
      return { member: m, stats };
    });
  }, [members, dexMap]);

  // Compute Team Average Stats
  const teamAverage: StatSpread = useMemo(() => {
    if (memberStatsList.length === 0) {
      return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    }
    const sum: StatSpread = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    for (const item of memberStatsList) {
      for (const key of STAT_KEYS) {
        sum[key] += item.stats[key];
      }
    }
    return {
      hp: Math.round(sum.hp / memberStatsList.length),
      atk: Math.round(sum.atk / memberStatsList.length),
      def: Math.round(sum.def / memberStatsList.length),
      spa: Math.round(sum.spa / memberStatsList.length),
      spd: Math.round(sum.spd / memberStatsList.length),
      spe: Math.round(sum.spe / memberStatsList.length),
    };
  }, [memberStatsList]);

  // Selected member stats
  const activeStats: StatSpread | null = useMemo(() => {
    if (!selectedMember) return null;
    const item = memberStatsList.find((x) => x.member.id === selectedMember.id);
    return item ? item.stats : null;
  }, [selectedMember, memberStatsList]);

  // Strategic Archetype Classification using dynamic role distributions and holistic team metrics
  const archetype = useMemo(() => {
    return evaluateTeamArchetype(members, dexMap);
  }, [members, dexMap]);

  // Hexagonal Radar Math
  // Center (150, 150), radius 100
  const center = 150;
  const maxRadius = 105;
  const maxStatVal = 220; // 220 stat cap for normalization

  const getCoordinates = (statIndex: number, value: number) => {
    const angle = (Math.PI / 3) * statIndex - Math.PI / 2;
    const r = (Math.min(maxStatVal, Math.max(10, value)) / maxStatVal) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points
  const teamPoints = STAT_KEYS.map((key, i) => {
    const { x, y } = getCoordinates(i, teamAverage[key]);
    return `${x},${y}`;
  }).join(" ");

  const activePoints = activeStats
    ? STAT_KEYS.map((key, i) => {
        const { x, y } = getCoordinates(i, activeStats[key]);
        return `${x},${y}`;
      }).join(" ")
    : null;

  return (
    <div className="space-y-5">
      {/* Header & Archetype Verdict */}
      <div className="p-5 rounded-2xl bg-charcoal-surface border border-border-crisp shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-primary uppercase">
                Stat Radar // 能力均衡
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                Dual Polygons
              </span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mt-0.5">
              Team Stat Balance & Role Envelope
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Overlays your team&apos;s aggregate average stat profile against the currently selected Pokémon.
            </p>
          </div>

          {archetype.badgeClass && (
            <div className={`px-3 py-2 rounded-xl border text-xs font-mono flex flex-col gap-0.5 ${archetype.badgeClass}`}>
              <div className="font-bold text-[11px] uppercase tracking-wider">
                Archetype: {archetype.title}
              </div>
              <div className="text-[10px] text-on-surface-variant max-w-[280px]">
                {archetype.desc}
              </div>
            </div>
          )}
        </div>

        {/* SVG Radar Visualization & Stats Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6">
          {/* Radar Chart Canvas */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-panel/20 rounded-2xl border border-border-crisp">
            <svg width="300" height="300" className="overflow-visible">
              {/* Concentric Hexagons */}
              {[0.25, 0.5, 0.75, 1.0].map((level) => {
                const hexPoints = STAT_KEYS.map((_, i) => {
                  const angle = (Math.PI / 3) * i - Math.PI / 2;
                  const r = level * maxRadius;
                  return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                }).join(" ");
                return (
                  <polygon
                    key={level}
                    points={hexPoints}
                    fill="none"
                    stroke="currentColor"
                    className="text-border-crisp/60"
                    strokeWidth="1"
                    strokeDasharray={level < 1 ? "3 3" : undefined}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {STAT_KEYS.map((_, i) => {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const x = center + maxRadius * Math.cos(angle);
                const y = center + maxRadius * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    className="text-border-crisp"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Polygon 1: Team Aggregate Average */}
              <polygon
                points={teamPoints}
                fill="rgba(0, 229, 255, 0.15)"
                stroke="#00E5FF"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="transition-all duration-500"
              />

              {/* Polygon 2: Active Member Envelope */}
              {activePoints && (
                <polygon
                  points={activePoints}
                  fill="rgba(255, 51, 85, 0.25)"
                  stroke="#FF3355"
                  strokeWidth="2.5"
                  className="transition-all duration-500"
                />
              )}

              {/* Stat Labels around spokes */}
              {STAT_KEYS.map((key, i) => {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const labelRadius = maxRadius + 24;
                const lx = center + labelRadius * Math.cos(angle);
                const ly = center + labelRadius * Math.sin(angle);
                const info = STAT_LABELS[key];

                return (
                  <text
                    key={key}
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-mono fill-on-surface font-semibold uppercase"
                  >
                    {info.label}
                  </text>
                );
              })}
            </svg>

            {/* Radar Legend */}
            <div className="flex items-center gap-6 mt-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-secondary inline-block" />
                <span className="text-secondary font-semibold">Team Average</span>
              </div>
              {selectedMember && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-primary inline-block" />
                  <span className="text-primary font-bold">{selectedMember.speciesName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stat Comparison Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-on-surface flex items-center justify-between">
              <span>Metric Dissection</span>
              <span className="text-xs font-mono text-on-surface-variant font-normal">
                Normalized to Lv. 100
              </span>
            </h4>

            <div className="space-y-2">
              {STAT_KEYS.map((key) => {
                const info = STAT_LABELS[key];
                const teamVal = teamAverage[key];
                const activeVal = activeStats ? activeStats[key] : null;

                return (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-slate-panel/40 border border-border-crisp flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 w-28">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-low text-on-surface-variant">
                        {info.kanji}
                      </span>
                      <span className="font-bold text-on-surface">{info.label}</span>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end">
                      <div className="text-right">
                        <span className="text-on-surface-variant text-[10px] block">
                          Team Avg
                        </span>
                        <span className="font-bold text-secondary">{teamVal}</span>
                      </div>

                      {activeVal !== null && (
                        <div className="text-right pl-3 border-l border-border-crisp">
                          <span className="text-on-surface-variant text-[10px] block">
                            Active
                          </span>
                          <span className="font-bold text-primary">{activeVal}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

