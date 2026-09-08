"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import POKEDEX_DATA from "@/app/data/pokedex-data.json";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import { TYPE_CONFIGS, formatPokedexNumber } from "@/app/utils/pokemonDataHelpers";
import { CheckCircle2, ArrowRight, Trash2 } from "lucide-react";

const MASTER_POKEMON_CATALOG = POKEDEX_DATA as FlatVarietyWithTypes[];

export default function CaughtTab() {
  const { caught, toggleCaught } = useAuth();

  // Resolve the 5 most recent caught Pokémon
  const recentCaught = useMemo(() => {
    const list = [...caught].reverse().slice(0, 5);
    return list
      .map((c) => {
        const lower = String(c).toLowerCase();
        const num = Number(c);
        return MASTER_POKEMON_CATALOG.find(
          (p) => p.name.toLowerCase() === lower || (!isNaN(num) && p.id === num)
        );
      })
      .filter((p): p is FlatVarietyWithTypes => p !== undefined);
  }, [caught]);

  const progressPercent = ((caught.length / 1025) * 100).toFixed(1);

  return (
    <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-crisp mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
              Field Registry (Caught)
            </h2>
            <p className="font-caption-label text-[11px] text-on-surface-variant">
              {caught.length} / 1025 CAUGHT ({progressPercent}% OF NATIONAL DEX)
            </p>
          </div>
        </div>

        <Link
          href="/caught"
          className="inline-flex items-center gap-1 text-xs font-caption-label font-bold text-secondary hover:underline uppercase tracking-wider"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List */}
      {recentCaught.length === 0 ? (
        <div className="py-8 text-center text-xs sm:text-sm text-on-surface-variant">
          No caught Pokémon logged yet.{" "}
          <Link href="/pokedex" className="text-secondary underline font-semibold">
            Explore Pokédex
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentCaught.map((pokemon) => {
            const primaryType = pokemon.types[0]?.toLowerCase() || "normal";
            const cfg = TYPE_CONFIGS[primaryType] || TYPE_CONFIGS.normal;

            return (
              <div
                key={pokemon.id}
                className="group relative flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-border-crisp hover:border-secondary transition-colors shadow-xs"
              >
                <Link
                  href={`/pokemon/${pokemon.name.toLowerCase()}`}
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: cfg.softBg,
                    borderColor: cfg.borderHex,
                  }}
                >
                  <img
                    src={pokemon.sprite || "/detective-pikachu.jpg"}
                    alt={pokemon.name}
                    className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-index-mono text-[11px] font-bold text-secondary">
                      {formatPokedexNumber(pokemon.id)}
                    </span>
                  </div>
                  <Link
                    href={`/pokemon/${pokemon.name.toLowerCase()}`}
                    className="font-headline-sm text-sm font-bold capitalize text-on-surface hover:text-secondary truncate block"
                  >
                    {pokemon.name.replace(/-/g, " ")}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    {pokemon.types.map((t) => {
                      const tcfg = TYPE_CONFIGS[t.toLowerCase()] || TYPE_CONFIGS.normal;
                      return (
                        <span
                          key={t}
                          style={{ backgroundColor: tcfg.colorHex }}
                          className={`px-1.5 py-0.2 rounded text-[9px] font-caption-label font-bold uppercase ${tcfg.textClass}`}
                        >
                          {tcfg.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCaught(pokemon.name)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                  title="Unmark caught status"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
