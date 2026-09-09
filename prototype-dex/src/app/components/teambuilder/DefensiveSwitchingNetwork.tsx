"use client";

import React, { useState, useMemo } from "react";
import { TeamMember } from "@/app/utils/teamBuilder/types";
import { computeSwitchingNetwork, PivotCycle } from "@/app/utils/teamBuilder/switchingNetwork";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";
import { ShieldCheck, AlertTriangle, RefreshCw, Layers } from "lucide-react";

interface DefensiveSwitchingNetworkProps {
  members: TeamMember[];
  onSelectMember?: (id: string) => void;
}

export default function DefensiveSwitchingNetwork({
  members,
  onSelectMember,
}: DefensiveSwitchingNetworkProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<PivotCycle | null>(null);

  const report = useMemo(() => {
    return computeSwitchingNetwork(members);
  }, [members]);

  // Node circular layout math: Center (220, 220), radius 140
  const center = 220;
  const radius = 140;

  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; angle: number }>();
    const n = members.length;
    if (n === 0) return map;

    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      map.set(members[i].id, { x, y, angle });
    }
    return map;
  }, [members]);

  if (members.length < 2) {
    return (
      <div className="p-8 rounded-2xl bg-charcoal-surface border border-border-crisp text-center space-y-3 shadow-xs">
        <Layers className="w-8 h-8 text-primary mx-auto opacity-70" />
        <h3 className="text-sm font-bold font-mono text-on-surface">
          Defensive Switching Network
        </h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          Add at least 2 Pokémon to your squad to map directed pivot cycles, detect mutual defensive pairs, and highlight isolated weaknesses.
        </p>
      </div>
    );
  }

  // Active cycles mapping for quick lookup
  const cycleMemberSet = new Set<string>();
  if (selectedCycle) {
    selectedCycle.memberIds.forEach((id) => cycleMemberSet.add(id));
  }

  return (
    <div className="p-6 rounded-2xl bg-charcoal-surface border border-border-crisp space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-crisp pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-primary uppercase">
              Directed Graph // 防御交替網
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                report.summary.rating === "Elite Core"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : report.summary.rating === "Robust Synergy"
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                  : report.summary.rating === "Moderate Synergy"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {report.summary.rating} ({report.connectivityScore}% Connectivity)
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mt-0.5">
            Defensive Switching Network & Pivot Cycles
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Directed edge <code className="text-primary">u → v</code> means teammate <code className="text-primary">v</code> cleanly absorbs or is immune to weaknesses of <code className="text-primary">u</code>.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-panel border border-border-crisp flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-on-surface font-bold">{report.summary.twoCyclesCount}</span>
            <span className="text-on-surface-variant text-[10px]">2-Cycles</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-panel border border-border-crisp flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-on-surface font-bold">{report.summary.threeCyclesCount}</span>
            <span className="text-on-surface-variant text-[10px]">Triads</span>
          </div>
          {report.summary.isolatedCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-bold">{report.summary.isolatedCount}</span>
              <span className="text-[10px]">Isolated</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Analytical Sidecar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Network Graph */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-panel/20 border border-border-crisp relative">
          <svg
            viewBox="0 0 440 440"
            className="w-full max-w-[420px] h-auto overflow-visible select-none"
          >
            <defs>
              {/* Standard Arrow Marker */}
              <marker
                id="arrowhead-default"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" className="text-border-crisp" />
              </marker>
              {/* Highlighted / Active Arrow Marker */}
              <marker
                id="arrowhead-active"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" className="text-primary" />
              </marker>
              {/* Gold 2-Cycle Arrow Marker */}
              <marker
                id="arrowhead-cycle"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" className="text-amber-400" />
              </marker>
            </defs>

            {/* Central Network Hub Ambient Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius * 0.45}
              fill="none"
              stroke="currentColor"
              className="text-border-crisp/20"
              strokeDasharray="4 4"
            />

            {/* Directed Edges */}
            {report.edges.map((edge, idx) => {
              const fromPos = nodePositions.get(edge.fromId);
              const toPos = nodePositions.get(edge.toId);
              if (!fromPos || !toPos) return null;

              const isHovered =
                hoveredNodeId === edge.fromId || hoveredNodeId === edge.toId;
              const isSelectedCycleEdge =
                selectedCycle?.memberIds.includes(edge.fromId) &&
                selectedCycle?.memberIds.includes(edge.toId);

              // Quadratic bezier curve bending towards center
              const midX = (fromPos.x + toPos.x) / 2;
              const midY = (fromPos.y + toPos.y) / 2;
              // Bend slightly toward center
              const bendFactor = 0.35;
              const ctrlX = midX + (center - midX) * bendFactor;
              const ctrlY = midY + (center - midY) * bendFactor;

              let strokeColor = "text-border-crisp/40";
              let strokeWidth = 1.2;
              let marker = "url(#arrowhead-default)";
              let opacity = 0.4;

              if (isSelectedCycleEdge) {
                strokeColor = "text-amber-400";
                strokeWidth = 2.5;
                marker = "url(#arrowhead-cycle)";
                opacity = 1;
              } else if (isHovered) {
                strokeColor = "text-primary";
                strokeWidth = 2;
                marker = "url(#arrowhead-active)";
                opacity = 0.95;
              } else if (hoveredNodeId || selectedCycle) {
                opacity = 0.15;
              }

              return (
                <path
                  key={`edge-${idx}`}
                  d={`M ${fromPos.x} ${fromPos.y} Q ${ctrlX} ${ctrlY} ${toPos.x} ${toPos.y}`}
                  fill="none"
                  stroke="currentColor"
                  className={`${strokeColor} transition-all duration-300`}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  markerEnd={marker}
                />
              );
            })}

            {/* Vertices / Pokémon Nodes */}
            {members.map((m) => {
              const pos = nodePositions.get(m.id);
              if (!pos) return null;

              const metric = report.nodes.find((n) => n.memberId === m.id);
              const isHovered = hoveredNodeId === m.id;
              const isCycleSelected = cycleMemberSet.has(m.id);
              const isIsolated = metric?.isIsolatedBurden;

              const primaryType = m.types[0]?.toLowerCase() || "normal";
              const typeColor = TYPE_CONFIGS[primaryType]?.colorHex || "#666";

              return (
                <g
                  key={m.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-transform duration-200 group"
                  onMouseEnter={() => setHoveredNodeId(m.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => onSelectMember?.(m.id)}
                >
                  {/* Pulsing Alert Ring for Isolated Burden */}
                  {isIsolated && (
                    <circle
                      r="28"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Highlight Glow Ring */}
                  {(isHovered || isCycleSelected) && (
                    <circle
                      r="26"
                      fill="none"
                      stroke={isCycleSelected ? "#f59e0b" : typeColor}
                      strokeWidth="3"
                      className="transition-all duration-200"
                    />
                  )}

                  {/* Main Node Background */}
                  <circle
                    r="21"
                    fill="#18181b"
                    stroke={isIsolated ? "#ef4444" : typeColor}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all shadow-md"
                  />

                  {/* Pokémon Sprite */}
                  <image
                    href={
                      m.sprite ||
                      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.pokemonId}.png`
                    }
                    x="-18"
                    y="-18"
                    width="36"
                    height="36"
                    preserveAspectRatio="xMidYMid meet"
                  />

                  {/* In-Degree Badge (Upper Right) */}
                  <g transform="translate(14, -14)">
                    <circle
                      r="7.5"
                      className={`${
                        isIsolated ? "fill-red-500" : "fill-primary"
                      }`}
                    />
                    <text
                      textAnchor="middle"
                      dy="2.5"
                      className="text-[8px] font-mono font-bold fill-white pointer-events-none"
                    >
                      {metric?.inDegree || 0}
                    </text>
                  </g>

                  {/* Species Name Label */}
                  <text
                    y="32"
                    textAnchor="middle"
                    className="text-[10px] font-mono font-bold fill-on-surface group-hover:fill-primary transition-colors"
                  >
                    {m.speciesName}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-on-surface-variant mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              Badge: Incoming Pivot Protectors
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Gold Curve: 2-Cycle Partnership
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              Red Glow: Isolated Burden (0 Protectors)
            </span>
          </div>
        </div>

        {/* Right: Tactical Insights Sidecar */}
        <div className="lg:col-span-5 space-y-4">
          {/* Isolated Burden Alert Banner */}
          {report.isolatedBurdens.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-red-400 font-bold font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Isolated Burden Warning: {report.isolatedBurdens.length} Pokémon</span>
              </div>
              <p className="text-on-surface-variant text-[11px]">
                {report.isolatedBurdens.map((b) => b.speciesName).join(", ")} has weaknesses that zero teammates cleanly resist. When forced out, you are vulnerable to hazard chip and momentum bleed.
              </p>
            </div>
          )}

          {/* Pivot Cycles Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-on-surface flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Detected Pivot Cores ({report.cycles.length})
              </span>
              {selectedCycle && (
                <button
                  onClick={() => setSelectedCycle(null)}
                  className="text-[10px] font-mono text-primary hover:underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {report.cycles.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-panel/40 border border-border-crisp text-xs font-mono text-on-surface-variant text-center">
                No closed 2-cycle or 3-cycle pivot loops found yet. Try adding defensive partners (e.g. Steel + Dragon/Fairy).
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {report.cycles.map((cycle, cIdx) => {
                  const isSelected = selectedCycle === cycle;

                  return (
                    <button
                      key={cIdx}
                      onClick={() => setSelectedCycle(isSelected ? null : cycle)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/40 text-on-surface shadow-xs"
                          : "bg-slate-panel/50 hover:bg-slate-panel border-border-crisp text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-on-surface">
                          {cycle.speciesNames.join(" ⇄ ")}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            cycle.cycleType === "2-cycle"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-cyan-500/20 text-cyan-400"
                          }`}
                        >
                          {cycle.cycleType}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed line-clamp-2">
                        {cycle.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Node Degree Summary Card */}
          <div className="p-3 rounded-xl bg-slate-panel/40 border border-border-crisp space-y-2">
            <span className="text-[11px] font-mono font-bold text-on-surface block">
              Pivot Dependency Matrix (In vs. Out)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
              {report.nodes.map((n) => (
                <div
                  key={n.memberId}
                  className={`p-2 rounded-lg border transition-all ${
                    n.isIsolatedBurden
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : n.isDefensiveAnchor
                      ? "bg-primary/10 border-primary/30 text-on-surface"
                      : "bg-charcoal-surface border-border-crisp text-on-surface"
                  }`}
                >
                  <div className="font-bold truncate">{n.speciesName}</div>
                  <div className="text-on-surface-variant flex justify-between mt-0.5">
                    <span>Protectors: <strong className="text-primary">{n.inDegree}</strong></span>
                    <span>Shields: <strong className="text-secondary">{n.outDegree}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
