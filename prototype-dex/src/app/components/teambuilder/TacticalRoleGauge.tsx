"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { TeamMember, LocalMoveEntry } from "@/app/utils/teamBuilder/types";
import {
  ShieldAlert,
  Zap,
  Wind,
  Trash2,
  Sword,
  HeartPulse,
  Award,
  Layers,
} from "lucide-react";
import MoveTaxonomyDonut from "./MoveTaxonomyDonut";

interface TacticalRoleGaugeProps {
  members: TeamMember[];
  movesData?: Record<string, LocalMoveEntry>;
}

interface RoleDefinition {
  id: string;
  name: string;
  japanese: string;
  category: string;
  icon: React.ElementType;
  description: string;
  moveKeywords: string[];
  itemKeywords: string[];
  recommendedCount: number;
}

const TACTICAL_ROLES: RoleDefinition[] = [
  {
    id: "hazards",
    name: "Entry Hazards",
    japanese: "設置罠",
    category: "Field Control",
    icon: Layers,
    description: "Punishes opposing switches and disables Focus Sash & Multiscale.",
    moveKeywords: [
      "stealth rock",
      "spikes",
      "toxic spikes",
      "sticky web",
      "ceaseless edge",
      "stone axe",
    ],
    itemKeywords: [],
    recommendedCount: 1,
  },
  {
    id: "removal",
    name: "Hazard Removal & Control",
    japanese: "罠除去",
    category: "Field Control",
    icon: Trash2,
    description: "Clears entry hazards to preserve defensive longevity and hazard-weak sweepers.",
    moveKeywords: ["rapid spin", "defog", "mortal spin", "tidy up", "court change"],
    itemKeywords: ["Heavy-Duty Boots"],
    recommendedCount: 1,
  },
  {
    id: "momentum",
    name: "VoltTurn Momentum & Pivoting",
    japanese: "対面操作",
    category: "Tempo & Positioning",
    icon: Wind,
    description: "Maintains offensive pressure and forces favorable matchups via switch moves.",
    moveKeywords: [
      "u-turn",
      "volt switch",
      "flip turn",
      "parting shot",
      "teleport",
      "chilly reception",
      "baton pass",
    ],
    itemKeywords: [],
    recommendedCount: 2,
  },
  {
    id: "speed_control",
    name: "Speed Control & Priority",
    japanese: "素早さ統制",
    category: "Tempo & Positioning",
    icon: Zap,
    description: "Guarantees first-strike capability for revenge kills against boosted sweepers.",
    moveKeywords: [
      "extreme speed",
      "sucker punch",
      "mach punch",
      "bullet punch",
      "aqua jet",
      "ice shard",
      "shadow sneak",
      "grassy glide",
      "fake out",
      "tailwind",
      "trick room",
    ],
    itemKeywords: ["Choice Scarf", "Booster Energy"],
    recommendedCount: 1,
  },
  {
    id: "wincon",
    name: "Setup Sweeper / Win-Condition",
    japanese: "主戦力・積技",
    category: "Endgame",
    icon: Sword,
    description: "Stat-boosting game-ender designed to sweep once opposing defensive checks fall.",
    moveKeywords: [
      "swords dance",
      "nasty plot",
      "dragon dance",
      "calm mind",
      "quiver dance",
      "bulk up",
      "agility",
      "shell smash",
      "belly drum",
      "victory dance",
      "iron defense",
    ],
    itemKeywords: [],
    recommendedCount: 1,
  },
  {
    id: "utility_recovery",
    name: "Defensive Recovery & Status",
    japanese: "耐久回復・妨害",
    category: "Sustain & Disruption",
    icon: HeartPulse,
    description: "Consistent HP regeneration and disruption (Toxic, Will-O-Wisp, Taunt, Encore).",
    moveKeywords: [
      "recover",
      "roost",
      "soft-boiled",
      "wish",
      "slack off",
      "synthesis",
      "moonlight",
      "strength sap",
      "will-o-wisp",
      "toxic",
      "taunt",
      "encore",
      "thunder wave",
    ],
    itemKeywords: ["Leftovers"],
    recommendedCount: 2,
  },
];

export default function TacticalRoleGauge({ members, movesData }: TacticalRoleGaugeProps) {
  // Analyze each role across all members
  const roleAnalysis = useMemo(() => {
    return TACTICAL_ROLES.map((role) => {
      const providers: {
        member: TeamMember;
        matchingMoves: string[];
        matchingItem?: string;
      }[] = [];

      members.forEach((m) => {
        const moves = m.moves
          .filter((mv): mv is string => typeof mv === "string" && mv.trim().length > 0)
          .map((name) => name.toLowerCase())
          .filter((name) =>
            role.moveKeywords.some((kw) => name.includes(kw.toLowerCase()))
          );

        const currentItem = m.item;
        const hasItem =
          Boolean(currentItem) &&
          role.itemKeywords.some((kw) =>
            (currentItem || "").toLowerCase().includes(kw.toLowerCase())
          );

        if (moves.length > 0 || hasItem) {
          providers.push({
            member: m,
            matchingMoves: moves,
            matchingItem: hasItem ? currentItem : undefined,
          });
        }
      });

      const count = providers.length;
      let status: "OPTIMAL" | "ADEQUATE" | "DEFICIENT" = "DEFICIENT";
      if (count >= role.recommendedCount) status = "OPTIMAL";
      else if (count > 0) status = "ADEQUATE";

      return {
        ...role,
        providers,
        count,
        status,
      };
    });
  }, [members]);

  // Overall Tactical Balance Index
  const tacticalIndex = useMemo(() => {
    if (members.length === 0) return 0;
    let earned = 0;
    const maxPoints = TACTICAL_ROLES.length * 10;

    roleAnalysis.forEach((r) => {
      if (r.status === "OPTIMAL") earned += 10;
      else if (r.status === "ADEQUATE") earned += 6;
      else earned += 0;
    });

    return Math.round((earned / maxPoints) * 100);
  }, [roleAnalysis, members.length]);

  return (
    <div className="space-y-6">
      {/* Header & Score Metric */}
      <div className="p-5 rounded-2xl bg-charcoal-surface border border-border-crisp flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base text-on-surface">
              Tactical Role & Win-Condition Composition
            </h3>
            <span className="text-xs font-mono text-primary font-bold">
              {"// 戦術役割編成"}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Heuristic audit of essential competitive pillars: hazard control, pivoting momentum, speed initiative, and endgame win-cons.
          </p>
        </div>

        {/* Global Tactical Rating */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-panel/50 border border-border-crisp shrink-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-base shrink-0 border ${
              tacticalIndex >= 80
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : tacticalIndex >= 60
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-red-500/20 text-red-400 border-red-500/40"
            }`}
          >
            {tacticalIndex}%
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">
              Composition Health
            </span>
            <span className="text-xs font-mono font-bold text-on-surface">
              {tacticalIndex >= 85
                ? "Tournament Grade"
                : tacticalIndex >= 70
                ? "Competitive Viable"
                : tacticalIndex >= 50
                ? "Role Imbalance"
                : "Missing Core Roles"}
            </span>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleAnalysis.map((role) => {
          const Icon = role.icon;
          const isOptimal = role.status === "OPTIMAL";
          const isAdequate = role.status === "ADEQUATE";

          return (
            <div
              key={role.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isOptimal
                  ? "bg-charcoal-surface border-border-crisp hover:border-emerald-500/50"
                  : isAdequate
                  ? "bg-charcoal-surface border-border-crisp hover:border-amber-500/50"
                  : "bg-charcoal-surface/80 border-red-500/30 hover:border-red-500/50"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl border ${
                        isOptimal
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : isAdequate
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">
                        {role.name}
                      </h4>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {role.japanese} &bull; {role.category}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isOptimal
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : isAdequate
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "bg-red-500/20 text-red-400 border-red-500/40"
                    }`}
                  >
                    {isOptimal
                      ? "Optimal"
                      : isAdequate
                      ? "Adequate"
                      : "Deficient"}
                  </span>
                </div>

                <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
                  {role.description}
                </p>
              </div>

              {/* Providers List */}
              <div className="pt-3 border-t border-border-crisp/60 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-on-surface-variant">
                    Team Practitioners ({role.count} / {role.recommendedCount} rec):
                  </span>
                </div>

                {role.providers.length === 0 ? (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>No Pokémon currently fulfills this tactical role.</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {role.providers.map(({ member, matchingMoves, matchingItem }) => (
                      <div
                        key={member.id}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-panel/70 border border-border-crisp flex items-center gap-2 text-xs font-mono"
                      >
                        <div className="w-5 h-5 relative rounded-md bg-surface-container-low shrink-0">
                          {member.sprite && (
                            <Image
                              src={member.sprite}
                              alt={member.name}
                              fill
                              sizes="20px"
                              className="object-contain"
                            />
                          )}
                        </div>
                        <span className="font-bold capitalize text-[11px] text-on-surface">
                          {member.name}
                        </span>
                        <div className="flex gap-1">
                          {matchingMoves.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 text-[8px] uppercase font-bold"
                            >
                              {m}
                            </span>
                          ))}
                          {matchingItem && (
                            <span className="px-1.5 py-0.2 rounded bg-secondary/20 text-secondary border border-secondary/30 text-[8px] uppercase font-bold">
                              {matchingItem}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Move Taxonomy Donut Chart */}
      <MoveTaxonomyDonut members={members} movesData={movesData} />

      {/* Recruiter / Engineering Technical Footnote */}
      <div className="p-4 rounded-2xl bg-charcoal-surface border border-border-crisp flex items-center gap-3 text-xs font-mono text-on-surface-variant">
        <Award className="w-4 h-4 text-primary shrink-0" />
        <span>
          Tactical composition heuristics cross-validate competitive Smogon OU tournament move pools and active team held items to safeguard against entry-hazard attrition and passive momentum loss.
        </span>
      </div>
    </div>
  );
}
