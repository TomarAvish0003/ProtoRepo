"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import PokemonCard from "@/app/components/PokemonCard";
import POKEDEX_DATA from "@/app/data/pokedex-data.json";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import { Bookmark, Search, ArrowLeft, Sparkles, LogIn } from "lucide-react";

const MASTER_POKEMON_CATALOG = POKEDEX_DATA as FlatVarietyWithTypes[];

export default function FavoritesPage() {
  const { user, favorites, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");

  // Resolve favorite items from the catalog
  const favoritePokemonList = useMemo(() => {
    return favorites
      .map((fav) => {
        const lower = String(fav).toLowerCase();
        const num = Number(fav);
        return MASTER_POKEMON_CATALOG.find(
          (p) => p.name.toLowerCase() === lower || (!isNaN(num) && p.id === num)
        );
      })
      .filter((p): p is FlatVarietyWithTypes => p !== undefined);
  }, [favorites]);

  // Filter with search
  const filteredList = useMemo(() => {
    if (!search.trim()) return favoritePokemonList;
    const q = search.toLowerCase().trim();
    return favoritePokemonList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    );
  }, [favoritePokemonList, search]);

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
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <Bookmark className="w-5 h-5 fill-amber-500 dark:fill-amber-400" />
              </div>
              <div>
                <h1 className="font-headline-sm text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                  Archival Favorites
                </h1>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
                  {user ? (
                    <span>
                      Synced to <strong className="text-primary">@{user.username}</strong>&apos;s cloud Pokédex
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

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-charcoal-surface border border-border-crisp font-index-mono text-xs font-bold text-on-surface shadow-xs">
              {favoritePokemonList.length} POKÉMON
            </span>

            {!user && (
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:opacity-90 text-white font-caption-label text-xs font-bold transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Save to Cloud</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {favoritePokemonList.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter bookmarked Pokémon..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-charcoal-surface border border-border-crisp text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
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
        ) : favoritePokemonList.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border-crisp bg-charcoal-surface shadow-xs dark:shadow-xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-4">
              <Bookmark className="w-8 h-8" />
            </div>
            <h2 className="font-headline-sm text-xl font-bold mb-1.5 text-on-surface">No Bookmarked Pokémon</h2>
            <p className="max-w-md text-sm text-on-surface-variant mb-6">
              You haven&apos;t added any Pokémon to your favorites yet. Browse the National Pokédex and click the bookmark icon on any Pokémon card or dossier.
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
            No bookmarked Pokémon matching &ldquo;<strong className="text-on-surface">{search}</strong>&rdquo;.
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
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
