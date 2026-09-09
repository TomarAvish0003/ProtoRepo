"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from "react";
import { TeamMember } from "@/app/utils/teamBuilder/types";
import { AlertCircle, PieChart } from "lucide-react";

interface MoveTaxonomyDonutProps {
  members: TeamMember[];
  movesData?: Record<string, any>;
}

interface TaxonomySlice {
  id: string;
  label: string;
  category: "Physical" | "Special" | "Status";
  count: number;
  percentage: number;
  color: string;
  moves: { moveName: string; user: string }[];
}

export default function MoveTaxonomyDonut({
  members,
  movesData = {},
}: MoveTaxonomyDonutProps) {
  const [hoveredSlice, setHoveredSlice] = useState<TaxonomySlice | null>(null);

  // Parse all moves across team
  const taxonomyData = useMemo(() => {
    let totalMoves = 0;
    let physCount = 0;
    let specCount = 0;
    let statusCount = 0;

    const slices: Record<string, TaxonomySlice> = {
      stab_phys: { id: "stab_phys", label: "STAB Physical Attack", category: "Physical", count: 0, percentage: 0, color: "#f43f5e", moves: [] },
      cov_phys: { id: "cov_phys", label: "Coverage Physical Attack", category: "Physical", count: 0, percentage: 0, color: "#fb7185", moves: [] },
      stab_spec: { id: "stab_spec", label: "STAB Special Attack", category: "Special", count: 0, percentage: 0, color: "#8b5cf6", moves: [] },
      cov_spec: { id: "cov_spec", label: "Coverage Special Attack", category: "Special", count: 0, percentage: 0, color: "#a78bfa", moves: [] },
      momentum: { id: "momentum", label: "Tactical Pivot Momentum", category: "Status", count: 0, percentage: 0, color: "#38bdf8", moves: [] },
      setup: { id: "setup", label: "Setup & Win-Condition", category: "Status", count: 0, percentage: 0, color: "#f59e0b", moves: [] },
      hazards: { id: "hazards", label: "Hazard Ops (Set / Clear)", category: "Status", count: 0, percentage: 0, color: "#10b981", moves: [] },
      disruption: { id: "disruption", label: "Recovery & Disruption", category: "Status", count: 0, percentage: 0, color: "#06b6d4", moves: [] },
    };

    const momentumMoves = ["uturn", "voltswitch", "flipturn", "partingshot", "chillyreception", "teleport"];
    const setupMoves = ["swordsdance", "dragondance", "nastyplot", "calmmind", "bulkup", "bellydrum", "quiverdance", "shiftgear", "curse", "agility"];
    const hazardMoves = ["stealthrock", "spikes", "toxicspikes", "stickyweb", "rapidspin", "defog", "mortalspin", "tidyup", "ceaselessedge", "stoneaxe"];

    for (const m of members) {
      const userTypes = m.types.map((t) => t.toLowerCase());

      for (const mv of m.moves) {
        if (!mv || mv.trim() === "" || mv === "Tackle") continue;
        totalMoves++;

        const normMv = mv.toLowerCase().replace(/[^a-z0-9]/g, "");
        const rawKey = mv.toLowerCase().trim().replace(/[\s_]/g, "-");
        const raw = movesData[rawKey] || movesData[rawKey.replace(/-/g, " ")];

        const cat = (raw?.category || "Physical") as "Physical" | "Special" | "Status";
        const mvType = (raw?.type || "Normal").toLowerCase();
        const isStab = userTypes.includes(mvType);

        if (cat === "Physical") {
          physCount++;
          if (momentumMoves.includes(normMv)) {
            slices.momentum.count++;
            slices.momentum.moves.push({ moveName: mv, user: m.speciesName });
          } else if (isStab) {
            slices.stab_phys.count++;
            slices.stab_phys.moves.push({ moveName: mv, user: m.speciesName });
          } else {
            slices.cov_phys.count++;
            slices.cov_phys.moves.push({ moveName: mv, user: m.speciesName });
          }
        } else if (cat === "Special") {
          specCount++;
          if (momentumMoves.includes(normMv)) {
            slices.momentum.count++;
            slices.momentum.moves.push({ moveName: mv, user: m.speciesName });
          } else if (isStab) {
            slices.stab_spec.count++;
            slices.stab_spec.moves.push({ moveName: mv, user: m.speciesName });
          } else {
            slices.cov_spec.count++;
            slices.cov_spec.moves.push({ moveName: mv, user: m.speciesName });
          }
        } else {
          statusCount++;
          if (momentumMoves.includes(normMv)) {
            slices.momentum.count++;
            slices.momentum.moves.push({ moveName: mv, user: m.speciesName });
          } else if (setupMoves.includes(normMv)) {
            slices.setup.count++;
            slices.setup.moves.push({ moveName: mv, user: m.speciesName });
          } else if (hazardMoves.includes(normMv)) {
            slices.hazards.count++;
            slices.hazards.moves.push({ moveName: mv, user: m.speciesName });
          } else {
            slices.disruption.count++;
            slices.disruption.moves.push({ moveName: mv, user: m.speciesName });
          }
        }
      }
    }

    // Compute percentages
    const activeSlices = Object.values(slices).filter((s) => s.count > 0);
    for (const s of activeSlices) {
      s.percentage = totalMoves > 0 ? Math.round((s.count / totalMoves) * 100) : 0;
    }

    return {
      totalMoves,
      physCount,
      specCount,
      statusCount,
      physPct: totalMoves > 0 ? Math.round((physCount / totalMoves) * 100) : 0,
      specPct: totalMoves > 0 ? Math.round((specCount / totalMoves) * 100) : 0,
      statusPct: totalMoves > 0 ? Math.round((statusCount / totalMoves) * 100) : 0,
      slices: activeSlices,
    };
  }, [members, movesData]);

  // Diagnostics
  const warnings: string[] = [];
  if (taxonomyData.totalMoves >= 6) {
    if (taxonomyData.specCount === 0) {
      warnings.push("Critical Blindspot: 0 Special Attacks equipped. Heavily walled by pure physical tanks like Dondozo / Skarmory.");
    }
    if (taxonomyData.physCount === 0) {
      warnings.push("Critical Blindspot: 0 Physical Attacks equipped. Vulnerable to special sponges like Blissey / Clodsire.");
    }
    const momentumCount = taxonomyData.slices.find((s) => s.id === "momentum")?.count || 0;
    if (momentumCount === 0) {
      warnings.push("Tactical Gap: 0 Pivot Moves (U-turn / Volt Switch). Difficult to maintain safe board tempo.");
    }
  }

  // SVG Donut Slices Math
  const center = 110;
  const rInInner = 30;
  const rOutInner = 55;
  const rInOuter = 60;
  const rOutOuter = 95;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, rIn: number, rOut: number, startAngle: number, endAngle: number) => {
    const startInner = polarToCartesian(cx, cy, rIn, endAngle);
    const endInner = polarToCartesian(cx, cy, rIn, startAngle);
    const startOuter = polarToCartesian(cx, cy, rOut, startAngle);
    const endOuter = polarToCartesian(cx, cy, rOut, endAngle);

    const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${rOut} ${rOut} 0 ${arcSweep} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${rIn} ${rIn} 0 ${arcSweep} 0 ${endInner.x} ${endInner.y}`,
      "Z",
    ].join(" ");
  };

  if (taxonomyData.totalMoves === 0) return null;

  // Build inner ring arcs (Physical, Special, Status)
  const innerSegments = [
    { label: "Physical", count: taxonomyData.physCount, pct: taxonomyData.physPct, color: "#f43f5e" },
    { label: "Special", count: taxonomyData.specCount, pct: taxonomyData.specPct, color: "#8b5cf6" },
    { label: "Status", count: taxonomyData.statusCount, pct: taxonomyData.statusPct, color: "#06b6d4" },
  ].filter((s) => s.count > 0);

  let currentAngleInner = 0;
  const innerArcs = innerSegments.map((seg) => {
    const angleSpan = (seg.count / taxonomyData.totalMoves) * 360;
    const startAngle = currentAngleInner;
    const endAngle = currentAngleInner + angleSpan;
    currentAngleInner = endAngle;
    return {
      ...seg,
      path: describeArc(center, center, rInInner, rOutInner, startAngle, endAngle - 1.5),
    };
  });

  // Build outer ring arcs
  let currentAngleOuter = 0;
  const outerArcs = taxonomyData.slices.map((slice) => {
    const angleSpan = (slice.count / taxonomyData.totalMoves) * 360;
    const startAngle = currentAngleOuter;
    const endAngle = currentAngleOuter + angleSpan;
    currentAngleOuter = endAngle;
    return {
      slice,
      path: describeArc(center, center, rInOuter, rOutOuter, startAngle, endAngle - 1.5),
    };
  });

  return (
    <div className="p-4 rounded-xl bg-slate-panel/30 border border-border-crisp space-y-3">
      <div className="flex items-center justify-between border-b border-border-crisp/60 pb-2">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold text-on-surface">
            Move Taxonomy & Category Share
          </span>
          <span className="text-[10px] font-mono text-on-surface-variant">
            ({taxonomyData.totalMoves} Equipped Moves)
          </span>
        </div>

        {/* Category Split Badges */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-rose-400 font-bold">Phys: {taxonomyData.physPct}%</span>
          <span className="text-purple-400 font-bold">Spec: {taxonomyData.specPct}%</span>
          <span className="text-cyan-400 font-bold">Status: {taxonomyData.statusPct}%</span>
        </div>
      </div>

      {/* Warnings if any */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-2"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Canvas & Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Donut Canvas */}
        <div className="sm:col-span-6 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 220 220" className="w-[180px] h-[180px] select-none">
            {/* Inner Ring (Category) */}
            {innerArcs.map((arc, i) => (
              <path
                key={`inner-${i}`}
                d={arc.path}
                fill={arc.color}
                opacity="0.8"
                className="transition-opacity hover:opacity-100"
              />
            ))}

            {/* Outer Ring (Taxonomy) */}
            {outerArcs.map((arc, i) => {
              const isHovered = hoveredSlice?.id === arc.slice.id;

              return (
                <path
                  key={`outer-${i}`}
                  d={arc.path}
                  fill={arc.slice.color}
                  opacity={isHovered ? "1" : hoveredSlice ? "0.4" : "0.85"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-100"
                  onMouseEnter={() => setHoveredSlice(arc.slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}

            {/* Center Hole Text */}
            <circle cx={center} cy={center} r={rInInner - 3} fill="#18181b" />
            <text
              x={center}
              y={center - 3}
              textAnchor="middle"
              className="text-[11px] font-mono font-bold fill-on-surface"
            >
              {hoveredSlice ? `${hoveredSlice.percentage}%` : `${taxonomyData.totalMoves}`}
            </text>
            <text
              x={center}
              y={center + 10}
              textAnchor="middle"
              className="text-[8px] font-mono fill-on-surface-variant uppercase"
            >
              {hoveredSlice ? "Share" : "Moves"}
            </text>
          </svg>
        </div>

        {/* Right 6 cols: Slice Legend & Move Drilldown */}
        <div className="sm:col-span-6 space-y-1.5 text-[10px] font-mono max-h-[190px] overflow-y-auto pr-1">
          {taxonomyData.slices.map((slice) => {
            const isHovered = hoveredSlice?.id === slice.id;

            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isHovered
                    ? "bg-slate-panel border-primary shadow-xs"
                    : "bg-slate-panel/40 hover:bg-slate-panel border-border-crisp"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="font-semibold text-on-surface truncate">
                      {slice.label}
                    </span>
                  </div>
                  <span className="font-bold text-on-surface shrink-0">
                    {slice.count} ({slice.percentage}%)
                  </span>
                </div>

                {isHovered && slice.moves.length > 0 && (
                  <div className="text-[9px] text-on-surface-variant mt-1 pl-3 border-l border-primary/40 space-y-0.5">
                    {slice.moves.map((m, mIdx) => (
                      <div key={mIdx} className="truncate">
                        <strong className="text-on-surface">{m.moveName}</strong> on {m.user}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
