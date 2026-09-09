"use client";

import React from "react";
import { CoverageReport } from "@/app/utils/teamBuilder/types";
import { ALL_POKEMON_TYPES } from "@/app/utils/teamBuilder/types";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";
import { Swords, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

interface OffensiveCoverageGraphProps {
  report: CoverageReport;
}

export default function OffensiveCoverageGraph({
  report,
}: OffensiveCoverageGraphProps) {
  const coveragePercent = Math.round((report.coveredTypes.length / 18) * 100);

  // Group edges by defending type to show which moves hit what
  const hitsByDefendingType: Record<string, string[]> = {};
  for (const edge of report.edges) {
    if (!hitsByDefendingType[edge.defendingType]) {
      hitsByDefendingType[edge.defendingType] = [];
    }
    const label = `${edge.move} (${edge.moveType.toUpperCase()})`;
    if (!hitsByDefendingType[edge.defendingType].includes(label)) {
      hitsByDefendingType[edge.defendingType].push(label);
    }
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Coverage Meter */}
      <div className="p-5 rounded-2xl bg-charcoal-surface border border-border-crisp shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-primary uppercase">
                Bipartite Coverage // 攻撃範囲
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-mono font-semibold">
                Graph U &rarr; V
              </span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mt-0.5">
              Super-Effective Offensive Coverage
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Evaluates all {report.totalAttackingMoves} damaging moves across your team against all 18 defensive types.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-panel/50 px-4 py-3 rounded-xl border border-border-crisp shrink-0">
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-on-surface">
                {report.coveredTypes.length}
                <span className="text-sm font-normal text-on-surface-variant"> / 18</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-secondary font-bold">
                {coveragePercent}% Covered
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-panel flex items-center justify-center relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-border-crisp"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-secondary transition-all duration-700"
                  strokeDasharray={`${coveragePercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <Swords className="w-4 h-4 text-secondary absolute" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-panel overflow-hidden mt-4">
          <div
            className="h-full bg-linear-to-r from-secondary to-primary transition-all duration-500 rounded-full"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
      </div>

      {/* Greedy Set Cover Recommendation Banner */}
      {report.recommendations.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-secondary/10 via-primary/5 to-transparent border border-secondary/30 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-secondary/20 text-secondary shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                  Greedy Set Cover Heuristic Recommendations
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/20 text-secondary font-bold">
                  Optimal Move Synergies
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Our set-cover algorithm computed the highest-impact move types to eliminate your remaining{" "}
                <strong className="text-on-surface font-semibold">{report.uncoveredTypes.length} uncovered types</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {report.recommendations.map((rec, idx) => {
                  const conf = TYPE_CONFIGS[rec.type];
                  return (
                    <div
                      key={rec.type}
                      className="p-3 rounded-xl bg-charcoal-surface/80 border border-border-crisp flex flex-col gap-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-on-surface-variant font-medium">
                          Priority #{idx + 1} Addition
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                          style={{ backgroundColor: conf?.colorHex || "#666" }}
                        >
                          {conf?.kanji} {rec.type}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-on-surface">
                        Resolves{" "}
                        <strong className="text-emerald-400 font-bold">
                          {rec.coveredTargets.length} target{rec.coveredTargets.length > 1 ? "s" : ""}:
                        </strong>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rec.coveredTargets.map((target) => (
                          <span
                            key={target}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-panel text-on-surface-variant capitalize border border-border-crisp"
                          >
                            {target}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 18 Defending Types Grid */}
      <div className="bg-charcoal-surface border border-border-crisp rounded-2xl p-5 shadow-xs">
        <h4 className="font-bold text-on-surface text-sm mb-3 flex items-center justify-between">
          <span>Defending Types Target Matrix</span>
          <span className="text-xs font-normal text-on-surface-variant font-mono">
            {report.coveredTypes.length} Hit / {report.uncoveredTypes.length} Unhit
          </span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {ALL_POKEMON_TYPES.map((type) => {
            const conf = TYPE_CONFIGS[type];
            const isCovered = report.coveredTypes.includes(type);
            const hittingMoves = hitsByDefendingType[type] || [];

            return (
              <div
                key={type}
                className={`p-3 rounded-xl border flex flex-col justify-between min-h-[90px] transition-all group ${
                  isCovered
                    ? "bg-slate-panel/40 border-border-crisp hover:border-emerald-500/50"
                    : "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: conf?.colorHex || "#666" }}
                  >
                    {conf?.kanji} {type}
                  </span>
                  {isCovered ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                </div>

                <div className="mt-2 text-[10px] font-mono">
                  {isCovered ? (
                    <div>
                      <span className="text-emerald-400 font-bold">
                        {hittingMoves.length} Move{hittingMoves.length > 1 ? "s" : ""}
                      </span>
                      <p className="text-on-surface-variant truncate mt-0.5" title={hittingMoves.join(", ")}>
                        {hittingMoves[0]?.split("(")[0]}
                        {hittingMoves.length > 1 && ` +${hittingMoves.length - 1}`}
                      </p>
                    </div>
                  ) : (
                    <span className="text-red-400 font-bold uppercase tracking-wider">
                      Not Covered
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
