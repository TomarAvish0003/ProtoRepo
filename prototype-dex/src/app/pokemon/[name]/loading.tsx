import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PokemonDetailLoading() {
  return (
    <main className="min-h-screen bg-background text-on-surface anime-grid-bg transition-colors duration-200 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Telemetry Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-crisp/60 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/pokedex"
              className="inline-flex items-center gap-1 text-[11px] font-caption-label font-bold text-primary hover:underline uppercase tracking-wider bg-surface-container-low px-2.5 py-1 rounded-md border border-border-crisp"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Pokédex Index</span>
            </Link>
            <div className="h-4 w-px bg-border-crisp" />
            <div className="flex items-center gap-2 text-secondary font-index-mono text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="font-bold tracking-wider animate-pulse">
                データ同期中 // SYNCHRONIZING DOSSIER DATA...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-6 w-24 rounded bg-surface-container-low border border-border-crisp animate-pulse" />
            <div className="h-6 w-16 rounded bg-surface-container-low border border-border-crisp animate-pulse" />
          </div>
        </div>

        {/* Main 2-Column Editorial Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Visual Specimen Chamber */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Main Specimen Chamber Box */}
            <div className="relative rounded-2xl bg-charcoal-surface border border-border-crisp p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden shadow-sm">
              {/* Radial glow backdrop */}
              <div className="w-64 h-64 rounded-full bg-primary/5 blur-3xl absolute -top-10 -left-10 pointer-events-none animate-pulse" />
              <div className="w-64 h-64 rounded-full bg-secondary/5 blur-3xl absolute -bottom-10 -right-10 pointer-events-none animate-pulse" />

              {/* Specimen Badge Bar */}
              <div className="w-full flex items-center justify-between mb-4 relative z-10">
                <div className="h-5 w-20 rounded-md bg-surface-container-low animate-pulse" />
                <div className="h-5 w-16 rounded-md bg-surface-container-low animate-pulse" />
              </div>

              {/* Central Pokémon Artwork Well */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 rounded-2xl bg-surface-container-low/60 border border-border-crisp/60 flex flex-col items-center justify-center overflow-hidden">
                <div className="w-36 h-36 rounded-full bg-surface-container-high/40 animate-ping opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-surface-container animate-pulse flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
                  </div>
                </div>
              </div>

              {/* Audio Cry & Shiny Toggle Bar */}
              <div className="w-full flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border-crisp/60 relative z-10">
                <div className="h-8 w-28 rounded-lg bg-surface-container-low animate-pulse" />
                <div className="h-8 w-28 rounded-lg bg-surface-container-low animate-pulse" />
              </div>
            </div>

            {/* Physical Attributes Card */}
            <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-5 shadow-sm">
              <div className="h-4 w-32 rounded bg-surface-container-low animate-pulse mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-container-low border border-border-crisp/50">
                    <div className="h-3 w-12 rounded bg-surface-container-high/60 animate-pulse mb-2" />
                    <div className="h-5 w-16 rounded bg-surface-container-high animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Type Defensive Effectiveness Skeleton */}
            <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-5 shadow-sm">
              <div className="h-4 w-40 rounded bg-surface-container-low animate-pulse mb-3" />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="h-10 rounded-lg bg-surface-container-low border border-border-crisp/50 animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Telemetry, Stats & Tab Content */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Title & Classification Banner */}
            <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-14 rounded bg-primary/20 animate-pulse" />
                    <div className="h-5 w-20 rounded bg-secondary/20 animate-pulse" />
                  </div>
                  <div className="h-9 w-64 rounded-lg bg-surface-container-high animate-pulse mb-2" />
                  <div className="h-4 w-44 rounded bg-surface-container-low animate-pulse" />
                </div>
                <div className="h-12 w-28 rounded-xl bg-surface-container-low border border-border-crisp animate-pulse" />
              </div>

              {/* Flavor Text Lore Quote Skeleton */}
              <div className="mt-6 p-4 rounded-xl bg-surface-container-low/80 border border-border-crisp/80">
                <div className="h-4 w-full rounded bg-surface-container-high/60 animate-pulse mb-2" />
                <div className="h-4 w-4/5 rounded bg-surface-container-high/60 animate-pulse" />
              </div>
            </div>

            {/* Base Combat Stats Pentagon / Stat Bars Skeleton */}
            <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border-crisp/60 mb-5">
                <div className="h-4 w-36 rounded bg-surface-container-low animate-pulse" />
                <div className="h-4 w-28 rounded bg-surface-container-low animate-pulse" />
              </div>
              <div className="flex flex-col gap-3.5">
                {["HP", "ATK", "DEF", "SPA", "SPD", "SPE"].map((label) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="font-caption-label text-[11px] font-bold text-on-surface-variant w-14">
                      {label}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-surface-container-low overflow-hidden">
                      <div className="h-full w-2/5 rounded-full bg-surface-container-high animate-pulse" />
                    </div>
                    <div className="h-4 w-8 rounded bg-surface-container-low animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Navigation & Panel Skeleton */}
            <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-6 shadow-sm">
              {/* Tab Header Bar */}
              <div className="flex items-center gap-2 pb-4 border-b border-border-crisp/60 mb-6 overflow-x-auto">
                {["Overview", "Moveset", "Abilities", "Evolution Line", "Game Lore"].map((tab) => (
                  <div
                    key={tab}
                    className="h-9 px-4 rounded-lg bg-surface-container-low border border-border-crisp/50 animate-pulse flex-shrink-0"
                  />
                ))}
              </div>

              {/* Tab Body Placeholder */}
              <div className="flex flex-col gap-3">
                <div className="h-16 rounded-xl bg-surface-container-low border border-border-crisp/50 animate-pulse" />
                <div className="h-16 rounded-xl bg-surface-container-low border border-border-crisp/50 animate-pulse" />
                <div className="h-16 rounded-xl bg-surface-container-low border border-border-crisp/50 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
