"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from "react";
import { TeamMember } from "@/app/utils/teamBuilder/types";
import {
  computeBulkMatrix,
  BENCHMARK_PHYS_MEDIAN,
  BENCHMARK_SPEC_MEDIAN,
} from "@/app/utils/teamBuilder/bulkMatrix";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";
import { ShieldAlert, Activity } from "lucide-react";

interface EffectiveBulkMatrixProps {
  members: TeamMember[];
  pokedexData: any[];
  onSelectMember?: (id: string) => void;
}

export default function EffectiveBulkMatrix({
  members,
  pokedexData,
  onSelectMember,
}: EffectiveBulkMatrixProps) {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  // Dex lookup map
  const dexMap = useMemo(() => {
    const map = new Map<number, any>();
    for (const p of pokedexData) {
      map.set(p.id, p);
    }
    return map;
  }, [pokedexData]);

  const report = useMemo(() => {
    return computeBulkMatrix(members, dexMap);
  }, [members, dexMap]);

  // Scatter Chart Dimensions
  const chartWidth = 520;
  const chartHeight = 360;
  const padding = { top: 35, right: 35, bottom: 45, left: 55 };

  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Scale map function
  const minBulk = report.minScale;
  const maxBulk = report.maxScale;

  const getX = (val: number) => {
    const clamped = Math.max(minBulk, Math.min(maxBulk, val));
    return padding.left + ((clamped - minBulk) / (maxBulk - minBulk)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minBulk, Math.min(maxBulk, val));
    // Invert Y axis so higher special bulk is higher up
    return (
      padding.top +
      plotHeight -
      ((clamped - minBulk) / (maxBulk - minBulk)) * plotHeight
    );
  };

  const medianX = getX(BENCHMARK_PHYS_MEDIAN);
  const medianY = getY(BENCHMARK_SPEC_MEDIAN);

  if (members.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-charcoal-surface border border-border-crisp text-center space-y-3 shadow-xs">
        <Activity className="w-8 h-8 text-primary mx-auto opacity-70" />
        <h3 className="text-sm font-bold font-mono text-on-surface">
          Effective Bulk Distribution Matrix
        </h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          Add Pokémon to your team to plot physical vs special defensive bulk ($HP \times Def$ vs $HP \times SpD$) across 4 strategic quadrants.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-charcoal-surface border border-border-crisp space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-crisp pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-primary uppercase">
              Cartesian Quadrant // 耐久分散行列
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                report.biasRating === "Balanced Bulk"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : report.biasRating.includes("Moderate")
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {report.biasRating}
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mt-0.5">
            Effective Bulk Distribution Matrix
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Plots logarithmic <code className="text-primary">HP × Def</code> (Physical Bulk) vs. <code className="text-secondary">HP × SpD</code> (Special Bulk) factoring items (Eviolite/Assault Vest).
          </p>
        </div>

        {/* Bulk Symmetry Gauge */}
        <div className="p-3 rounded-xl bg-slate-panel border border-border-crisp flex flex-col gap-1.5 min-w-[200px]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-400 font-bold">Phys: {report.physRatioPercent}%</span>
            <span className="text-cyan-400 font-bold">Spec: {report.specRatioPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-charcoal-surface overflow-hidden flex">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${report.physRatioPercent}%` }}
            />
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${report.specRatioPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Asymmetry Warning if heavy skew */}
      {report.biasWarning && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-bold font-mono">Bulk Deficit Detected:</span> {report.biasWarning}
          </div>
        </div>
      )}

      {/* Main Grid: Scatter Plot Canvas & Quadrant Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 7 cols: SVG Scatter Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-panel/20 border border-border-crisp relative">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full max-w-[500px] h-auto overflow-visible select-none"
          >
            {/* Quadrant Background Shading */}
            {/* Top-Right: Mixed Tank */}
            <rect
              x={medianX}
              y={padding.top}
              width={plotWidth - (medianX - padding.left)}
              height={medianY - padding.top}
              fill="rgba(16, 185, 129, 0.04)"
            />
            {/* Top-Left: Special Sponge */}
            <rect
              x={padding.left}
              y={padding.top}
              width={medianX - padding.left}
              height={medianY - padding.top}
              fill="rgba(6, 182, 212, 0.04)"
            />
            {/* Bottom-Right: Physical Wall */}
            <rect
              x={medianX}
              y={medianY}
              width={plotWidth - (medianX - padding.left)}
              height={plotHeight - (medianY - padding.top)}
              fill="rgba(245, 158, 11, 0.04)"
            />
            {/* Bottom-Left: Glass Cannon */}
            <rect
              x={padding.left}
              y={medianY}
              width={medianX - padding.left}
              height={plotHeight - (medianY - padding.top)}
              fill="rgba(239, 68, 68, 0.04)"
            />

            {/* Benchmark Median Crosshairs */}
            <line
              x1={medianX}
              y1={padding.top}
              x2={medianX}
              y2={padding.top + plotHeight}
              stroke="currentColor"
              className="text-border-crisp"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={medianY}
              x2={padding.left + plotWidth}
              y2={medianY}
              stroke="currentColor"
              className="text-border-crisp"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Quadrant Watermark Labels */}
            <text
              x={padding.left + plotWidth - 8}
              y={padding.top + 16}
              textAnchor="end"
              className="text-[9px] font-mono font-bold fill-emerald-400/60 uppercase tracking-wider pointer-events-none"
            >
              Mixed Tanks (I)
            </text>
            <text
              x={padding.left + 8}
              y={padding.top + 16}
              textAnchor="start"
              className="text-[9px] font-mono font-bold fill-cyan-400/60 uppercase tracking-wider pointer-events-none"
            >
              Special Sponges (II)
            </text>
            <text
              x={padding.left + 8}
              y={padding.top + plotHeight - 8}
              textAnchor="start"
              className="text-[9px] font-mono font-bold fill-red-400/60 uppercase tracking-wider pointer-events-none"
            >
              Glass Cannons (III)
            </text>
            <text
              x={padding.left + plotWidth - 8}
              y={padding.top + plotHeight - 8}
              textAnchor="end"
              className="text-[9px] font-mono font-bold fill-amber-400/60 uppercase tracking-wider pointer-events-none"
            >
              Physical Walls (IV)
            </text>

            {/* Outer Axes */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
              stroke="currentColor"
              className="text-border-crisp"
              strokeWidth="1.5"
            />
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke="currentColor"
              className="text-border-crisp"
              strokeWidth="1.5"
            />

            {/* Axis Titles */}
            <text
              x={padding.left + plotWidth / 2}
              y={chartHeight - 12}
              textAnchor="middle"
              className="text-[10px] font-mono font-bold fill-on-surface-variant uppercase tracking-wider"
            >
              Physical Bulk (HP × Def) →
            </text>
            <text
              x={-padding.top - plotHeight / 2}
              y={18}
              transform="rotate(-90)"
              textAnchor="middle"
              className="text-[10px] font-mono font-bold fill-on-surface-variant uppercase tracking-wider"
            >
              Special Bulk (HP × SpD) →
            </text>

            {/* Data Points */}
            {report.points.map((pt) => {
              const x = getX(pt.physBulk);
              const y = getY(pt.specBulk);
              const isHovered = hoveredPointId === pt.memberId;
              const typeColor = TYPE_CONFIGS[pt.primaryType.toLowerCase()]?.colorHex || "#38bdf8";

              // Point radius scaled by Speed (12px to 22px)
              const minSpeed = 30;
              const maxSpeed = 220;
              const radius = 13 + ((Math.min(maxSpeed, Math.max(minSpeed, pt.actualSpe)) - minSpeed) / (maxSpeed - minSpeed)) * 8;

              return (
                <g
                  key={pt.memberId}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPointId(pt.memberId)}
                  onMouseLeave={() => setHoveredPointId(null)}
                  onClick={() => onSelectMember?.(pt.memberId)}
                >
                  {/* Outer Pulsing Aura on Hover */}
                  {isHovered && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke={typeColor}
                      strokeWidth="2"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Main Circle */}
                  <circle
                    r={radius}
                    fill="#18181b"
                    stroke={typeColor}
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all shadow-md"
                  />

                  {/* Member Sprite */}
                  <image
                    href={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${members.find((m) => m.id === pt.memberId)?.pokemonId || 1}.png`}
                    x={-radius + 2}
                    y={-radius + 2}
                    width={(radius - 2) * 2}
                    height={(radius - 2) * 2}
                    preserveAspectRatio="xMidYMid meet"
                  />

                  {/* Label */}
                  <text
                    y={radius + 12}
                    textAnchor="middle"
                    className="text-[9px] font-mono font-bold fill-on-surface"
                  >
                    {pt.speciesName}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-on-surface-variant mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-primary inline-block" />
              Radius Sized by Speed Tier
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Q-I: Mixed Tank
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              Q-II: Special Sponge
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Q-IV: Physical Wall
            </span>
          </div>
        </div>

        {/* Right 5 cols: Specimen Bulk Scorecards */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {report.points.map((pt) => {
            const isHovered = hoveredPointId === pt.memberId;

            return (
              <div
                key={pt.memberId}
                onMouseEnter={() => setHoveredPointId(pt.memberId)}
                onMouseLeave={() => setHoveredPointId(null)}
                onClick={() => onSelectMember?.(pt.memberId)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? "bg-slate-panel border-primary shadow-xs"
                    : "bg-slate-panel/40 hover:bg-slate-panel border-border-crisp"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">
                      {pt.speciesName}
                    </span>
                    {pt.hasAssaultVest && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        AV 1.5×
                      </span>
                    )}
                    {pt.hasEviolite && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Eviolite 1.5×
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${pt.quadrantColor}`}
                  >
                    {pt.quadrantLabel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-on-surface-variant">
                  <div>
                    <span className="block text-[9px]">Phys Bulk:</span>
                    <strong className="text-amber-400 font-bold">
                      {pt.physBulk.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[9px]">Spec Bulk:</span>
                    <strong className="text-cyan-400 font-bold">
                      {pt.specBulk.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[9px]">Effective Spe:</span>
                    <strong className="text-primary font-bold">
                      {pt.actualSpe}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
