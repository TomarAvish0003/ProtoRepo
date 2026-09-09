"use client";

import React, { useState } from "react";
import Image from "next/image";
import { DefenseMatrixResult, TeamMember } from "@/app/utils/teamBuilder/types";
import { ALL_POKEMON_TYPES } from "@/app/utils/teamBuilder/types";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";
import { ShieldAlert, Info } from "lucide-react";

interface DefenseMatrixGridProps {
  result: DefenseMatrixResult;
  members: TeamMember[];
  onSelectMember: (id: string) => void;
}

export default function DefenseMatrixGrid({
  result,
  members,
  onSelectMember,
}: DefenseMatrixGridProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const getMultiplierStyle = (mult: number) => {
    if (mult === 0) {
      return "bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-500/40 shadow-[0_0_8px_rgba(0,229,255,0.2)]";
    }
    if (mult === 0.25) {
      return "bg-emerald-600/35 text-emerald-300 font-bold border border-emerald-500/40";
    }
    if (mult === 0.5) {
      return "bg-emerald-500/20 text-emerald-300 font-medium";
    }
    if (mult === 2.0) {
      return "bg-red-500/20 text-red-300 font-medium";
    }
    if (mult === 4.0) {
      return "bg-red-600/35 text-red-400 font-bold border border-red-500/40 shadow-[0_0_8px_rgba(255,51,85,0.2)]";
    }
    return "text-on-surface-variant/40";
  };

  const formatMultiplierText = (mult: number) => {
    if (mult === 0) return "0×";
    if (mult === 0.25) return "¼×";
    if (mult === 0.5) return "½×";
    if (mult === 1.0) return "—";
    if (mult === 2.0) return "2×";
    if (mult === 4.0) return "4×";
    return `${mult}×`;
  };

  return (
    <div className="space-y-4">
      {/* Critical Weakness Alert Banner */}
      {result.criticalWeaknesses.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <h4 className="font-semibold text-red-400 flex items-center gap-2">
              Critical Defensive Vulnerabilities Detected
            </h4>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              The following types deal super-effective damage to 3 or more team members with zero
              immunities. Consider adjusting your typings, Tera types, or abilities (e.g., Levitate, Water Absorb).
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {result.criticalWeaknesses.map((cw) => {
                const conf = TYPE_CONFIGS[cw.type];
                return (
                  <span
                    key={cw.type}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: conf?.colorHex || "#666" }}
                  >
                    <span>{conf?.kanji}</span>
                    <span>{cw.type}</span>
                    <span className="bg-black/40 px-1.5 py-0.2 rounded text-[10px]">
                      {cw.count} Weak
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 18 x 6 Matrix Table Container */}
      <div className="bg-charcoal-surface border border-border-crisp rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-border-crisp flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-panel/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-primary uppercase">
                Defense Matrix // 防御行列
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                ℝ¹⁸ˣ⁶
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-on-surface mt-0.5">
              Team Type Synergy & Defensive Profile
            </h3>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              0× Immune
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              ¼× & ½× Resist
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
              2× & 4× Weak
            </span>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-charcoal-surface border-b border-border-crisp shadow-xs">
              <tr>
                <th className="p-3 text-left font-mono text-[11px] text-on-surface-variant uppercase tracking-wider w-36 bg-charcoal-surface">
                  Attacking Type
                </th>
                {members.map((m) => (
                  <th
                    key={m.id}
                    onClick={() => onSelectMember(m.id)}
                    className="p-2.5 min-w-[90px] cursor-pointer transition-colors hover:bg-slate-panel/60 bg-charcoal-surface"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 relative rounded-lg bg-surface-container-low border border-border-crisp p-0.5">
                        {m.sprite && (
                          <Image
                            src={m.sprite}
                            alt={m.name}
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        )}
                      </div>
                      <span className="font-semibold text-[11px] text-on-surface truncate max-w-[85px]">
                        {m.speciesName}
                      </span>
                      {m.teraType && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-secondary/15 text-secondary font-mono">
                          Tera: {m.teraType}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {/* Empty member slots */}
                {Array.from({ length: Math.max(0, 6 - members.length) }).map((_, i) => (
                  <th
                    key={`empty_${i}`}
                    className="p-2.5 min-w-[90px] text-on-surface-variant/30 font-mono text-[10px] bg-charcoal-surface"
                  >
                    Slot {members.length + i + 1}
                  </th>
                ))}
                <th className="p-3 font-mono text-[11px] text-red-400 uppercase tracking-wider w-16 bg-charcoal-surface">
                  Weak
                </th>
                <th className="p-3 font-mono text-[11px] text-emerald-400 uppercase tracking-wider w-16 bg-charcoal-surface">
                  Resist
                </th>
                <th className="p-3 font-mono text-[11px] text-cyan-400 uppercase tracking-wider w-16 bg-charcoal-surface">
                  Immune
                </th>
                <th className="p-3 font-mono text-[11px] text-on-surface uppercase tracking-wider w-16 bg-charcoal-surface">
                  Net
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-crisp/60">
              {ALL_POKEMON_TYPES.map((type, rowIdx) => {
                const conf = TYPE_CONFIGS[type];
                const weakCount = result.weaknessCounts[rowIdx] || 0;
                const resistCount = result.resistanceCounts[rowIdx] || 0;
                const immuneCount = result.immunityCounts[rowIdx] || 0;
                const netScore = result.netScores[rowIdx] || 0;

                return (
                  <tr
                    key={type}
                    className={`transition-colors hover:bg-slate-panel/40 ${
                      weakCount >= 3 && immuneCount === 0 ? "bg-red-500/5" : ""
                    }`}
                  >
                    {/* Type Header Cell */}
                    <td className="p-2.5 text-left font-semibold sticky left-0 z-10 bg-charcoal-surface/95 backdrop-blur-xs border-r border-border-crisp">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: conf?.colorHex || "#666" }}
                        />
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-xs"
                          style={{ backgroundColor: conf?.colorHex || "#666" }}
                        >
                          {conf?.kanji || type.slice(0, 2)}
                        </span>
                        <span className="capitalize text-on-surface text-xs font-mono">
                          {conf?.label || type}
                        </span>
                      </div>
                    </td>

                    {/* Member Multiplier Cells */}
                    {members.map((m, colIdx) => {
                      const cellDetail = result.details[rowIdx]?.[colIdx];
                      const mult = cellDetail?.multiplier ?? 1.0;
                      const hasReason = Boolean(cellDetail?.immunityReason);

                      return (
                        <td
                          key={m.id}
                          className="p-2 text-center relative group"
                          onMouseEnter={() =>
                            hasReason ? setActiveTooltip(`${rowIdx}_${colIdx}`) : null
                          }
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <div
                            className={`inline-flex items-center justify-center min-w-[42px] py-1 px-1.5 rounded-lg text-xs font-mono transition-transform group-hover:scale-105 ${getMultiplierStyle(
                              mult
                            )}`}
                          >
                            <span>{formatMultiplierText(mult)}</span>
                            {hasReason && (
                              <Info className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                            )}
                          </div>

                          {/* Hover Tooltip */}
                          {hasReason && activeTooltip === `${rowIdx}_${colIdx}` && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-30 px-2.5 py-1 rounded-md bg-black/90 text-white text-[11px] whitespace-nowrap shadow-lg pointer-events-none font-mono">
                              {cellDetail?.immunityReason}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Empty Member Cells */}
                    {Array.from({ length: Math.max(0, 6 - members.length) }).map((_, i) => (
                      <td key={`cell_empty_${i}`} className="p-2 text-on-surface-variant/20 font-mono">
                        —
                      </td>
                    ))}

                    {/* Summary Columns */}
                    <td className="p-2 font-mono font-semibold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded ${
                          weakCount >= 3
                            ? "bg-red-500/25 text-red-400 font-bold"
                            : weakCount > 0
                            ? "text-red-400"
                            : "text-on-surface-variant/30"
                        }`}
                      >
                        {weakCount}
                      </span>
                    </td>
                    <td className="p-2 font-mono font-semibold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded ${
                          resistCount > 0 ? "text-emerald-400" : "text-on-surface-variant/30"
                        }`}
                      >
                        {resistCount}
                      </span>
                    </td>
                    <td className="p-2 font-mono font-semibold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded ${
                          immuneCount > 0 ? "text-cyan-300 font-bold" : "text-on-surface-variant/30"
                        }`}
                      >
                        {immuneCount}
                      </span>
                    </td>
                    <td className="p-2 font-mono font-bold">
                      <span
                        className={
                          netScore > 0
                            ? "text-emerald-400"
                            : netScore < 0
                            ? "text-red-400"
                            : "text-on-surface-variant/40"
                        }
                      >
                        {netScore > 0 ? `+${netScore}` : netScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
