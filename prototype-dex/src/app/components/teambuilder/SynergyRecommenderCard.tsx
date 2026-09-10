"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { TeamMember, PokemonFormat } from "@/app/utils/teamBuilder/types";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import { recommendTeammates, SynergyRecommendation } from "@/app/utils/teamBuilder/synergyRecommender";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";
import { Sparkles, Plus } from "lucide-react";

interface SynergyRecommenderCardProps {
  members: TeamMember[];
  format: PokemonFormat;
  pokedexData: FlatVarietyWithTypes[];
  onAddPokemon: (entry: FlatVarietyWithTypes) => void;
}

export default function SynergyRecommenderCard({
  members,
  format,
  pokedexData,
  onAddPokemon,
}: SynergyRecommenderCardProps) {
  // Compute top 3 recommendations
  const recommendations: SynergyRecommendation[] = useMemo(() => {
    return recommendTeammates(members, format, pokedexData);
  }, [members, format, pokedexData]);

  if (recommendations.length === 0) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-surface border border-secondary/30 shadow-xs space-y-3 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-24 bg-secondary/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-crisp/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-secondary/15 text-secondary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-on-surface">
                Synergy Auto-Resolver // 相性補完
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-mono font-bold border border-secondary/20">
                Top 3 Teammate Solutions
              </span>
            </div>
            <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">
              Patches active defensive liabilities & missing offensive STAB coverage for your {members.length}/6 squad.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Candidate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((rec) => {
          const dexEntry = pokedexData.find((p) => p.id === rec.pokemonId);

          return (
            <div
              key={rec.pokemonId}
              className="p-3 rounded-xl bg-slate-panel/50 border border-border-crisp hover:border-secondary/50 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-2">
                {/* Header: Sprite, Name, Tier */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-surface border border-border-crisp flex items-center justify-center shrink-0 overflow-hidden relative">
                      <Image
                        src={rec.spriteUrl}
                        alt={rec.speciesName}
                        width={36}
                        height={36}
                        className="object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors">
                        {rec.speciesName}
                      </div>
                      {/* Type Badges */}
                      <div className="flex items-center gap-1 mt-0.5">
                        {rec.types.map((t) => {
                          const conf = TYPE_CONFIGS[t.toLowerCase()];
                          return (
                            <span
                              key={t}
                              className="px-1 py-0.2 rounded text-[8px] font-bold text-white uppercase"
                              style={{ backgroundColor: conf?.colorHex || "#666" }}
                            >
                              {t.slice(0, 3)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-primary/15 text-primary border border-primary/20">
                    [{rec.tier}]
                  </span>
                </div>

                {/* Rationale Bullet */}
                <p className="text-[10px] font-mono text-on-surface-variant leading-relaxed">
                  {rec.summaryRationale}
                </p>
              </div>

              {/* Quick Add Button */}
              <button
                onClick={() => {
                  if (dexEntry) {
                    onAddPokemon(dexEntry);
                  }
                }}
                className="w-full py-1.5 px-2 rounded-lg bg-secondary/15 hover:bg-secondary text-secondary hover:text-black border border-secondary/40 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Quick Add to Squad
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
