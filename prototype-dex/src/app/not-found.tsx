import React from "react";
import Link from "next/link";
import { Search, Home, Database, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 text-on-surface">
      <div className="w-full max-w-xl bg-charcoal-surface border border-border-crisp rounded-2xl p-6 sm:p-10 flex flex-col items-center text-center shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Subtle Cyber Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-2xl pointer-events-none" />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-mono font-bold tracking-wider uppercase mb-4">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>ERROR 404 // ARCHIVE MISSING</span>
        </div>

        {/* 404 Header */}
        <h1 className="font-index-mono text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-amber-500 tracking-tight">
          404
        </h1>

        <h2 className="font-headline-sm text-xl sm:text-2xl font-bold text-on-surface mt-2 tracking-tight">
          Specimen Data Not Found
        </h2>
        <p className="font-subhead-kana text-xs sm:text-sm text-on-surface-variant/80 mt-1">
          指定されたポケモンまたはアーカイブデータは存在しないか、移動されました。
        </p>

        <p className="font-body-sm text-sm text-on-surface-variant max-w-md mt-4">
          The requested dossier could not be located in the National Pokédex database. Please verify the specimen identifier or use the search terminal below.
        </p>

        {/* Quick Search Redirect */}
        <form
          action="/pokedex"
          method="GET"
          className="w-full max-w-md mt-6 flex items-center gap-2 bg-surface-container-low border border-border-crisp rounded-xl p-1.5 focus-within:border-primary transition-colors"
        >
          <Search className="w-4 h-4 text-on-surface-variant ml-2 shrink-0" />
          <input
            type="text"
            name="q"
            placeholder="Search specimen by name or #id (e.g. 0006 or Charizard)..."
            className="flex-1 bg-transparent border-none outline-none font-body-sm text-sm text-on-surface placeholder:text-on-surface-variant/50 px-2"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-caption-label text-xs font-bold transition-all shadow-xs shrink-0"
          >
            Search
          </button>
        </form>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <Link
            href="/pokedex"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 font-caption-label text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg"
          >
            <Database className="w-4 h-4" />
            <span>Open Pokédex</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-border-crisp text-on-surface font-caption-label text-xs font-bold tracking-wider uppercase transition-all"
          >
            <Home className="w-4 h-4 text-on-surface-variant" />
            <span>Home Terminal</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
