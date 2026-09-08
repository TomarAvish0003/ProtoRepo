"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import PokemonCard from "@/app/components/PokemonCard";
import POKEDEX_DATA from "@/app/data/pokedex-data.json";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import { CheckCircle2, Search, ArrowLeft, Sparkles, LogIn, Trophy } from "lucide-react";

const MASTER_POKEMON_CATALOG = POKEDEX_DATA as FlatVarietyWithTypes[];
const TOTAL_DEX = 1025;

export default function CaughtPage() {
  const { user, caught, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");

  // Resolve caught items from the catalog
  const caughtPokemonList = useMemo(() => {
    return caught
      .map((c) => {
        const lower = String(c).toLowerCase();
        const num = Number(c);
        return MASTER_POKEMON_CATALOG.find(
          (p) => p.name.toLowerCase() === lower || (!isNaN(num) && p.id === num)
        );
      })
      .filter((p): p is FlatVarietyWithTypes => p !== undefined);
  }, [caught]);

  // Filter with search
  const filteredList = useMemo(() => {
    if (!search.trim()) return caughtPokemonList;
    const q = search.toLowerCase().trim();
    return caughtPokemonList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    );
  }, [caughtPokemonList, search]);

  const completionPercentage = ((caughtPokemonList.length / TOTAL_DEX) * 100).toFixed(1);

  return (
    <main className="min-h-screen bg-background text-on-surface px-4 sm:px-6 lg:px-8 pt-24 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-crisp">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/pokedex"
                className="inline-flex items-center gap-1 text-[12px] font-caption-label font-bold text-primary hover:underline uppercase"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to National Dex</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-headline-sm text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                  Caught Pokémon Registry
                </h1>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
                  {user ? (
                    <span>
                      Field research linked to <strong className="text-secondary">@{user.username}</strong>&apos;s cloud Pokédex
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <span>Guest Mode (Stored locally in browser).</span>
                      <Link href="/login" className="text-secondary underline font-semibold">
                        Sign in to sync across devices
                      </Link>
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Dex completion metric */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-charcoal-surface border border-border-crisp shadow-xs">
              <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <div>
                <div className="font-index-mono text-xs font-bold text-on-surface">
                  {caughtPokemonList.length} / {TOTAL_DEX} ({completionPercentage}%)
                </div>
                <div className="w-32 bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-secondary h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, Number(completionPercentage)))}%` }}
                  />
                </div>
              </div>
            </div>

            {!user && (
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary hover:opacity-90 text-white font-caption-label text-xs font-bold transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Save to Cloud</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {caughtPokemonList.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter caught Pokémon..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-charcoal-surface border border-border-crisp text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
        )}

        {/* Loading state */}
        {authLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-charcoal-surface border border-border-crisp animate-pulse"
              />
            ))}
          </div>
        ) : caughtPokemonList.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border-crisp bg-charcoal-surface shadow-xs dark:shadow-xl">
            <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-headline-sm text-xl font-bold mb-1.5 text-on-surface">No Caught Pokémon Logged</h2>
            <p className="max-w-md text-sm text-on-surface-variant mb-6">
              You haven&apos;t marked any Pokémon as caught yet. Browse the National Dex and click &ldquo;LOG CATCH&rdquo; on any Pokémon you have caught.
            </p>
            <Link
              href="/pokedex"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white font-caption-label text-xs uppercase font-bold tracking-wider shadow-xs transition-all snappy-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore National Dex</span>
            </Link>
          </div>
        ) : filteredList.length === 0 ? (
          /* Filtered empty state */
          <div className="py-16 text-center text-sm text-on-surface-variant">
            No caught Pokémon matching &ldquo;<strong className="text-on-surface">{search}</strong>&rdquo;.
          </div>
        ) : (
          /* Pokémon Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredList.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                id={pokemon.id}
                name={pokemon.name}
                sprite={pokemon.sprite}
                types={pokemon.types}
                stats={pokemon.stats}
                height={pokemon.height}
                weight={pokemon.weight}
                isCaught={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
