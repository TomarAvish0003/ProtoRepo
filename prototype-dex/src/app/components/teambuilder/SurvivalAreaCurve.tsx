"use client";

import React, { useState } from "react";
import { DamageRollResult } from "@/app/utils/teamBuilder/types";
import { Shield, Skull } from "lucide-react";

interface SurvivalAreaCurveProps {
  result: DamageRollResult;
}

export default function SurvivalAreaCurve({ result }: SurvivalAreaCurveProps) {
  const [activeCurveMode, setActiveCurveMode] = useState<"both" | "1hit" | "2hit">("both");
  const [hoveredPoint, setHoveredPoint] = useState<{ damagePct: number; prob: number; label: string } | null>(null);

  const conv = result.convolution;
  if (!conv || conv.distribution1Hit.length === 0) return null;

  // Chart dimensions
  const width = 480;
  const height = 150;
  const pad = { top: 20, right: 25, bottom: 30, left: 35 };

  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  // X scale: 0% to 140% damage
  const minX = 0;
  const maxX = Math.max(130, result.maxPercent * 2.1);

  const getX = (pct: number) => {
    const clamped = Math.max(minX, Math.min(maxX, pct));
    return pad.left + ((clamped - minX) / (maxX - minX)) * plotW;
  };

  // Y scale: max probability density
  const maxProb = Math.max(
    ...conv.distribution1Hit.map((d) => d.probability),
    ...conv.distribution2Hit.map((d) => d.probability),
    0.15
  );

  const getY = (prob: number) => {
    const clamped = Math.max(0, Math.min(maxProb, prob));
    return pad.top + plotH - (clamped / maxProb) * plotH;
  };

  const x100 = getX(100);

  // Generate SVG area paths
  // 1-Hit Curve
  const points1Hit = conv.distribution1Hit.map((d) => ({
    x: getX(d.damagePct),
    y: getY(d.probability),
    data: d,
  }));
  const path1Hit = points1Hit.length > 0
    ? `M ${points1Hit[0].x} ${pad.top + plotH} ` +
      points1Hit.map((p) => `L ${p.x} ${p.y}`).join(" ") +
      ` L ${points1Hit[points1Hit.length - 1].x} ${pad.top + plotH} Z`
    : "";

  // 2-Hit Convolution Curve
  const points2Hit = conv.distribution2Hit.map((d) => ({
    x: getX(d.damagePct),
    y: getY(d.probability),
    data: d,
  }));
  const path2Hit = points2Hit.length > 0
    ? `M ${points2Hit[0].x} ${pad.top + plotH} ` +
      points2Hit.map((p) => `L ${p.x} ${p.y}`).join(" ") +
      ` L ${points2Hit[points2Hit.length - 1].x} ${pad.top + plotH} Z`
    : "";

  return (
    <div className="p-4 rounded-xl bg-slate-panel/30 border border-border-crisp space-y-3">
      {/* Top Header & Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-crisp/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider text-secondary uppercase font-bold">
            Discrete Survival Probability Curve
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-mono font-bold">
            256-Cell Convolution
          </span>
        </div>

        {/* 1HKO / 2HKO Chances */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className={`px-2 py-0.5 rounded font-bold ${conv.oneHitKoPercent > 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            1HKO: {conv.oneHitKoPercent}%
          </span>
          <span className={`px-2 py-0.5 rounded font-bold ${conv.twoHitKoPercent > 0 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            2HKO: {conv.twoHitKoPercent}%
          </span>

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-charcoal-surface border border-border-crisp p-0.5">
            <button
              onClick={() => setActiveCurveMode("both")}
              className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer ${
                activeCurveMode === "both" ? "bg-primary text-white font-bold" : "text-on-surface-variant"
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setActiveCurveMode("1hit")}
              className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer ${
                activeCurveMode === "1hit" ? "bg-primary text-white font-bold" : "text-on-surface-variant"
              }`}
            >
              1-Hit
            </button>
            <button
              onClick={() => setActiveCurveMode("2hit")}
              className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer ${
                activeCurveMode === "2hit" ? "bg-primary text-white font-bold" : "text-on-surface-variant"
              }`}
            >
              2-Hit
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[460px] h-auto overflow-visible select-none"
        >
          {/* Shading Bands */}
          {/* Green Zone: 0% to 100% */}
          <rect
            x={pad.left}
            y={pad.top}
            width={x100 - pad.left}
            height={plotH}
            fill="rgba(16, 185, 129, 0.05)"
          />
          {/* Red Zone: >= 100% (Fatal KO) */}
          <rect
            x={x100}
            y={pad.top}
            width={pad.left + plotW - x100}
            height={plotH}
            fill="rgba(239, 68, 68, 0.08)"
          />

          {/* 100% Fatal Barrier Line */}
          <line
            x1={x100}
            y1={pad.top}
            x2={x100}
            y2={pad.top + plotH}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x={x100 + 4}
            y={pad.top + 10}
            className="text-[8px] font-mono font-bold fill-red-400 pointer-events-none"
          >
            100% KO Barrier
          </text>

          {/* Grid lines */}
          <line
            x1={pad.left}
            y1={pad.top + plotH}
            x2={pad.left + plotW}
            y2={pad.top + plotH}
            stroke="currentColor"
            className="text-border-crisp"
            strokeWidth="1"
          />

          {/* 2-Hit Convolution Area (Amber/Cyan) */}
          {(activeCurveMode === "both" || activeCurveMode === "2hit") && path2Hit && (
            <path
              d={path2Hit}
              fill="url(#convGrad2)"
              stroke="#06b6d4"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          )}

          {/* 1-Hit Area (Primary Red/Violet) */}
          {(activeCurveMode === "both" || activeCurveMode === "1hit") && path1Hit && (
            <path
              d={path1Hit}
              fill="url(#convGrad1)"
              stroke="#ec4899"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          )}

          {/* X-axis Ticks */}
          {[25, 50, 75, 100, 125].map((tick) => {
            const x = getX(tick);
            if (x > pad.left + plotW) return null;
            return (
              <g key={tick} transform={`translate(${x}, ${pad.top + plotH})`}>
                <line y2="4" stroke="currentColor" className="text-border-crisp" />
                <text
                  y="12"
                  textAnchor="middle"
                  className="text-[8px] font-mono fill-on-surface-variant"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Hover interactive points */}
          {(activeCurveMode === "both" || activeCurveMode === "2hit") &&
            points2Hit.map((pt, i) => (
              <circle
                key={`p2-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.damagePct === pt.data.damagePct ? 4 : 2}
                className="fill-cyan-400 cursor-pointer hover:r-4 transition-all"
                onMouseEnter={() =>
                  setHoveredPoint({
                    damagePct: pt.data.damagePct,
                    prob: Math.round(pt.data.probability * 1000) / 10,
                    label: "2-Hit Total",
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

          <defs>
            <linearGradient id="convGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="convGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-1 right-3 px-2 py-1 rounded bg-black/85 border border-border-crisp text-white font-mono text-[9px] shadow-lg pointer-events-none">
            <span className="text-secondary font-bold">{hoveredPoint.label}:</span>{" "}
            {hoveredPoint.damagePct}% Dmg (Probability: {hoveredPoint.prob}%)
          </div>
        )}
      </div>

      {/* Legend & Factor Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-on-surface-variant pt-1 border-t border-border-crisp/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-pink-500 inline-block" />
            1-Hit PMF
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-cyan-400 inline-block" />
            2-Hit Discrete Convolution
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3 h-3 inline" /> Survive Zone
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <Skull className="w-3 h-3 inline" /> KO Zone
          </span>
        </div>

        {/* Hazard / Recovery factors */}
        <div className="flex items-center gap-1.5">
          {conv.hazardChip > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-bold">
              +{conv.hazardChip} Hazard Chip
            </span>
          )}
          {conv.passiveRecovery > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
              -{conv.passiveRecovery} Recovery
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
