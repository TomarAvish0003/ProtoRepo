"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import PokemonCard from "@/app/components/PokemonCard";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";
import POKEDEX_DATA from "@/app/data/pokedex-data.json";
import {
  LayoutGrid,
  List as ListIcon,
  X,
  Filter,
  Search,
  Layers,
  SearchX,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const PAGE_SIZE = 48;
const MASTER_POKEMON_CATALOG = POKEDEX_DATA as FlatVarietyWithTypes[];

const GENERATION_RANGES: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 151 },
  2: { start: 152, end: 251 },
  3: { start: 252, end: 386 },
  4: { start: 387, end: 493 },
  5: { start: 494, end: 649 },
  6: { start: 650, end: 721 },
  7: { start: 722, end: 809 },
  8: { start: 810, end: 905 },
  9: { start: 906, end: 1025 },
};

const PRESET_RIBBON = [
  { id: "all", label: "All Pokémon", filterFn: () => true },
  {
    id: "starters",
    label: "Starter Lines",
    filterFn: (p: FlatVarietyWithTypes) =>
      [
        1, 2, 3, 4, 5, 6, 7, 8, 9,
        152, 153, 154, 155, 156, 157, 158, 159, 160,
        252, 253, 254, 255, 256, 257, 258, 259, 260,
        387, 388, 389, 390, 391, 392, 393, 394, 395,
        495, 496, 497, 498, 499, 500, 501, 502, 503,
        650, 651, 652, 653, 654, 655, 656, 657, 658,
        722, 723, 724, 725, 726, 727, 728, 729, 730,
        810, 811, 812, 813, 814, 815, 816, 817, 818,
        906, 907, 908, 909, 910, 911, 912, 913, 914
      ].includes(p.id),
  },
  {
    id: "legend",
    label: "Legendary & Mythical",
    filterFn: (p: FlatVarietyWithTypes) =>
      [
        144, 145, 146, 150, 151,
        243, 244, 245, 249, 250, 251,
        377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
        480, 481, 482, 483, 484, 485, 486, 487, 488, 491, 492, 493, 494,
        643, 644, 646, 649,
        716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800,
        888, 889, 890,
        1007, 1008
      ].includes(p.id),
  },
  {
    id: "caught",
    label: "Pokémon Caught",
    filterFn: (p: FlatVarietyWithTypes, caughtIds?: Set<number>) =>
      caughtIds ? caughtIds.has(p.id) : false,
  },
];

interface GenerationOption {
  gen: number | null; // null = All Pokémon (All 1,025)
  roman: string;
  name: string;
  kanji: string;
  range: string;
  count: number;
}

const GENERATION_OPTIONS: GenerationOption[] = [
  { gen: null, roman: "ALL", name: "All Pokémon", kanji: "全国図鑑", range: "0001–1025", count: 1025 },
  { gen: 1, roman: "GEN I", name: "Kanto", kanji: "カントー", range: "0001–0151", count: 151 },
  { gen: 2, roman: "GEN II", name: "Johto", kanji: "ジョウト", range: "0152–0251", count: 100 },
  { gen: 3, roman: "GEN III", name: "Hoenn", kanji: "ホウエン", range: "0252–0386", count: 135 },
  { gen: 4, roman: "GEN IV", name: "Sinnoh", kanji: "シンオウ", range: "0387–0493", count: 107 },
  { gen: 5, roman: "GEN V", name: "Unova", kanji: "イッシュ", range: "0494–0649", count: 156 },
  { gen: 6, roman: "GEN VI", name: "Kalos", kanji: "カロス", range: "0650–0721", count: 72 },
  { gen: 7, roman: "GEN VII", name: "Alola", kanji: "アローラ", range: "0722–0809", count: 88 },
  { gen: 8, roman: "GEN VIII", name: "Galar", kanji: "ガラル", range: "0810–0905", count: 96 },
  { gen: 9, roman: "GEN IX", name: "Paldea", kanji: "パルデア", range: "0906–1025", count: 120 },
];

function NationalDexContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse region or generation parameter, default to National Dex (null)
  function parseRegionParam(param: string | null): number | null {
    if (!param) return null;
    const lower = param.toLowerCase();
    if (lower === "all" || lower === "national" || lower === "national-dex" || lower === "nat" || lower === "0") return null;
    if (lower === "kanto" || lower === "1") return 1;
    if (lower === "johto" || lower === "2") return 2;
    if (lower === "hoenn" || lower === "3") return 3;
    if (lower === "sinnoh" || lower === "4") return 4;
    if (lower === "unova" || lower === "5") return 5;
    if (lower === "kalos" || lower === "6") return 6;
    if (lower === "alola" || lower === "7") return 7;
    if (lower === "galar" || lower === "8") return 8;
    if (lower === "paldea" || lower === "9") return 9;
    const num = Number(param);
    return isNaN(num) || num < 1 || num > 9 ? null : num;
  }

  const initialGen = parseRegionParam(searchParams.get("gen") || searchParams.get("region"));
  const initialType = searchParams.get("type");
  const initialQ = searchParams.get("q") || "";
  const initialFilter = searchParams.get("filter") || "all";

  const [search, setSearch] = useState(initialQ);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialType ? [initialType.toLowerCase()] : []);
  const [generation, setGeneration] = useState<number | null>(initialGen);
  const [activePreset, setActivePreset] = useState<string>(initialFilter);
  const [sortBy, setSortBy] = useState("id-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { caught: authCaught } = useAuth();

  // Caught Pokémon ids derived reactively from AuthContext
  const caughtIds = useMemo(() => {
    const ids = new Set<number>();
    authCaught.forEach((item) => {
      const num = Number(item);
      if (!isNaN(num)) {
        ids.add(num);
      } else {
        const found = MASTER_POKEMON_CATALOG.find((p) => p.name.toLowerCase() === item.toLowerCase());
        if (found) ids.add(found.id);
      }
    });
    return ids;
  }, [authCaught]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(handler);
  }, [search]);

  // Filter and sort clientside across the complete 1,025 Pokémon catalog
  const filteredPokemons = useMemo(() => {
    return MASTER_POKEMON_CATALOG.filter((p) => {
      // Generation filter
      if (generation !== null) {
        const range = GENERATION_RANGES[generation];
        if (range && (p.id < range.start || p.id > range.end)) {
          return false;
        }
      }

      // Name or ID search
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().replace(/^#/, "").trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId =
          String(p.id) === q ||
          String(p.id).padStart(4, "0") === q ||
          String(p.id).includes(q);
        if (!matchesName && !matchesId) return false;
      }

      // Elemental types filter (matches any selected)
      if (selectedTypes.length > 0) {
        const hasType = p.types.some((t) => selectedTypes.includes(t.toLowerCase()));
        if (!hasType) return false;
      }

      // Preset ribbon filter
      if (activePreset !== "all") {
        const preset = PRESET_RIBBON.find((r) => r.id === activePreset);
        if (preset && !preset.filterFn(p, caughtIds)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "id-desc") return b.id - a.id;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "bst-desc") return (b.stats?.bst || 0) - (a.stats?.bst || 0);
      if (sortBy === "bst-asc") return (a.stats?.bst || 0) - (b.stats?.bst || 0);
      return a.id - b.id; // default id-asc
    });
  }, [generation, debouncedSearch, selectedTypes, activePreset, sortBy, caughtIds]);

  // Progressive rendering slice for ultra-smooth 60fps rendering
  const visiblePokemons = useMemo(() => {
    return filteredPokemons.slice(0, visibleCount);
  }, [filteredPokemons, visibleCount]);

  const hasMore = visibleCount < filteredPokemons.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount((prev) => Math.min(filteredPokemons.length, prev + PAGE_SIZE));
  }, [hasMore, filteredPokemons.length]);

  // Reset pagination limit when any filter or sort changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [generation, debouncedSearch, selectedTypes, activePreset, sortBy]);

  // IntersectionObserver for auto-infinite scrolling
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // Toggle type filter
  const toggleType = (typeKey: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeKey) ? prev.filter((t) => t !== typeKey) : [...prev, typeKey]
    );
  };

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedTypes([]);
    setActivePreset("all");
    setGeneration(null);
  };

  // Current active generation metadata
  const currentGenMeta = GENERATION_OPTIONS.find((g) => g.gen === generation) || GENERATION_OPTIONS[0];

  return (
    <main className="w-full pt-20 bg-background text-on-surface anime-grid-bg min-h-screen">
      <div className="flex flex-col w-full">
        {/* Compact Hero Masthead & Gen 1–9 Quick Selector Strip */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-caption-label text-[10px] uppercase font-bold tracking-wide shadow-xs">
                  INDEX // {currentGenMeta.roman}
                </span>
                <span className="font-subhead-kana text-[12px] text-on-surface-variant">
                  {generation === null ? "全国図鑑 // 1,025匹収録" : `${currentGenMeta.kanji}地方 // № ${currentGenMeta.range}`}
                </span>
              </div>
              <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                {generation === null ? "Pokédex" : `Gen ${generation}: ${currentGenMeta.name} Region`}
              </h1>
              <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
                {generation === null
                  ? "Comprehensive database of all 1,025 Pokémon species across 9 generations with complete stats, types, and abilities."
                  : `Pokémon native to the ${currentGenMeta.name} region. № ${currentGenMeta.range} (${currentGenMeta.count} species).`}
              </p>
            </div>

            {/* View Mode & Filter Drawer Button for Mobile */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                type="button"
                className="lg:hidden px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-caption-label text-[12px] uppercase font-bold flex items-center gap-1.5 border border-border-crisp snappy-btn"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters & Types</span>
              </button>
            </div>
          </div>

          {/* GEN 1 - 9 + ALL POKÉMON SEGMENTED SELECTOR */}
          <div className="mt-4 pt-3 border-t border-border-crisp">
            <div className="flex items-center justify-between gap-2 pb-2">
              <span className="font-caption-label text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                REGIONS &amp; GENERATIONS
              </span>
              <span className="font-caption-label text-[10px] text-on-surface-variant hidden sm:inline">
                CURRENT: <span className="font-bold text-primary">{currentGenMeta.name} ({currentGenMeta.roman})</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {GENERATION_OPTIONS.map((opt) => {
                const isActive = generation === opt.gen;
                return (
                  <button
                    key={opt.name}
                    onClick={() => setGeneration(opt.gen)}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg font-caption-label text-[12px] whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 snappy-btn ${
                      isActive
                        ? "bg-primary text-on-primary border-primary font-bold shadow-xs"
                        : "bg-surface-container-lowest text-on-surface-variant border-border-crisp hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    <span>{opt.roman}</span>
                    <span className="font-sans text-[11px] opacity-75">
                      {opt.gen === null ? "All (1,025)" : opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Preset Filter Ribbon */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="font-caption-label text-[10px] uppercase text-on-surface-variant shrink-0 mr-1">
              Curated:
            </span>
            {PRESET_RIBBON.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset.id)}
                type="button"
                className={`px-2.5 py-1 rounded-md font-caption-label text-[11px] whitespace-nowrap transition-all border snappy-btn ${
                  activePreset === preset.id
                    ? "bg-primary text-on-primary border-primary font-bold shadow-xs"
                    : "bg-surface-container-lowest text-on-surface-variant border-border-crisp hover:bg-surface-container-high"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        {/* Main Archive Layout: Left Tactical Sidebar + Right Card Broadsheet */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
            {/* LEFT EDITORIAL SIDEBAR (4 Cols) */}
            <aside
              className={`lg:col-span-4 flex flex-col gap-3.5 ${
                isMobileFiltersOpen ? "block" : "hidden lg:flex"
              }`}
            >
              {/* Live Instant Search Plate */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-[0_2px_12px_rgba(23,27,38,0.04)] border border-border-crisp flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-caption-label text-[11px] text-primary font-extrabold uppercase tracking-wider">
                    SEARCH POKÉDEX
                  </span>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="font-caption-label text-[10px] text-on-surface-variant hover:text-primary uppercase font-bold snappy-btn"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative flex items-center bg-surface-container-low px-3 py-2 rounded-lg border border-border-crisp focus-within:ring-2 focus-within:ring-primary transition-all">
                  <Search className="w-4 h-4 text-secondary mr-2 flex-shrink-0" />
                  <input
                    id="archiveSearch"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, № ID (e.g. 0006, 0448, lucario)..."
                    className="bg-transparent outline-none font-body-sm text-[13px] text-on-surface placeholder:text-on-surface-variant/60 w-full"
                  />
                </div>
              </div>

              {/* Official 18-Type Matrix with Universal Standard Colors */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-[0_2px_12px_rgba(23,27,38,0.04)] border border-border-crisp flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-border-crisp">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-caption-label text-[11px] text-on-surface font-bold uppercase tracking-wider">
                      Types (18)
                    </span>
                  </div>
                  {selectedTypes.length > 0 && (
                    <button
                      onClick={() => setSelectedTypes([])}
                      className="font-caption-label text-[10px] text-primary hover:underline uppercase font-bold snappy-btn"
                    >
                      Reset ({selectedTypes.length})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5" id="typeMatrix">
                  {Object.entries(TYPE_CONFIGS).map(([key, config]) => {
                    const isSelected = selectedTypes.includes(key);
                    const textColor = isSelected
                      ? config.textClass.includes("white")
                        ? "#ffffff"
                        : "#1A1A1A"
                      : undefined;

                    return (
                      <button
                        key={key}
                        onClick={() => toggleType(key)}
                        type="button"
                        style={{
                          backgroundColor: isSelected ? config.colorHex : undefined,
                          borderColor: isSelected ? config.colorHex : undefined,
                          color: textColor,
                        }}
                        className={`type-filter-chip flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all text-left border snappy-btn ${
                          isSelected
                            ? "font-bold shadow-xs"
                            : "bg-surface-container-low text-on-surface border-border-crisp hover:border-primary/40 hover:bg-surface-container"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor: isSelected ? textColor : config.colorHex,
                            }}
                          ></span>
                          <span className="font-caption-label text-[11px] uppercase font-bold truncate">
                            {config.label}
                          </span>
                        </div>
                        <span
                          className={`font-subhead-kana text-[10px] shrink-0 ml-1 ${
                            isSelected ? "opacity-80" : "text-on-surface-variant/70"
                          }`}
                        >
                          {config.kanji}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Regional Compendium Jump Directory */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-[0_2px_12px_rgba(23,27,38,0.04)] border border-border-crisp flex flex-col gap-2">
                <span className="font-caption-label text-[11px] text-primary font-extrabold uppercase tracking-wider pb-1.5 border-b border-border-crisp">
                  REGIONS
                </span>
                <div className="flex flex-col gap-1 font-body-sm text-[12px]">
                  {GENERATION_OPTIONS.map((reg) => (
                    <button
                      key={reg.name}
                      onClick={() => setGeneration(reg.gen)}
                      type="button"
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left snappy-btn ${
                        generation === reg.gen
                          ? "bg-primary text-on-primary font-bold shadow-xs"
                          : "hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-caption-label text-[10px] uppercase font-bold opacity-75">
                          {reg.roman}
                        </span>
                        <span>{reg.name}</span>
                        <span className="font-subhead-kana text-[10px] opacity-60">
                          ({reg.kanji})
                        </span>
                      </div>
                      <span className="font-index-mono text-[10px] opacity-75 font-bold">
                        {reg.range}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* RIGHT BROADSHEET POKÉDEX ARCHIVE (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Live Filter Feedback Bar */}
              <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(23,27,38,0.04)] border border-border-crisp flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-caption-label text-[11px] uppercase font-bold text-on-surface">
                    SHOWING {filteredPokemons.length} POKÉMON
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-caption-label text-[10px] font-bold shadow-2xs">
                    {generation === null ? "ALL REGIONS" : `GEN ${generation}`}
                  </span>
                  {selectedTypes.map((t) => {
                    const cfg = TYPE_CONFIGS[t] || TYPE_CONFIGS.normal;
                    return (
                      <span
                        key={t}
                        style={{ backgroundColor: cfg.colorHex }}
                        className="px-2 py-0.5 rounded text-white font-caption-label text-[10px] font-bold uppercase flex items-center gap-1 shadow-2xs"
                      >
                        <span>{cfg.label}</span>
                        <button onClick={() => toggleType(t)} title={`Remove ${cfg.label} filter`} className="snappy-btn">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Sorting select */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-surface-container-low border border-border-crisp rounded-lg px-2.5 py-1.5 font-caption-label text-[11px] text-on-surface outline-none cursor-pointer"
                  >
                    <option value="id-asc">Sort: № 0001 → 1025</option>
                    <option value="id-desc">Sort: № 1025 → 0001</option>
                    <option value="name-asc">Sort: Name A → Z</option>
                    <option value="name-desc">Sort: Name Z → A</option>
                    <option value="bst-desc">Sort: Highest BST</option>
                    <option value="bst-asc">Sort: Lowest BST</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-border-crisp">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1 rounded snappy-btn ${
                        viewMode === "grid"
                          ? "bg-surface-container-lowest text-primary shadow-xs font-bold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1 rounded snappy-btn ${
                        viewMode === "list"
                          ? "bg-surface-container-lowest text-primary shadow-xs font-bold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                      title="Compact List View"
                    >
                      <ListIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pokemon Card Grid */}
              {filteredPokemons.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-10 border border-border-crisp text-center flex flex-col items-center justify-center gap-3 shadow-[0_2px_12px_rgba(23,27,38,0.04)]">
                  <SearchX className="w-12 h-12 text-on-surface-variant/60" />
                  <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                    No Pokémon Found
                  </h3>
                  <p className="font-body-sm text-[13px] text-on-surface-variant max-w-sm">
                    No Pokémon records match the current filter criteria. Try resetting the filters or modifying your search query.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-caption-label text-[11px] uppercase font-bold shadow-xs snappy-btn"
                  >
                    Reset Filter Matrix
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {visiblePokemons.map((pokemon) => (
                    <PokemonCard
                      key={pokemon.id}
                      id={pokemon.id}
                      name={pokemon.name}
                      sprite={pokemon.sprite}
                      types={pokemon.types}
                      stats={pokemon.stats}
                      height={pokemon.height}
                      weight={pokemon.weight}
                      isCaught={caughtIds.has(pokemon.id)}
                    />
                  ))}
                </div>
              ) : (
                /* Compact Ledger View with Authentic Type Colors */
                <div className="bg-surface-container-lowest rounded-xl border border-border-crisp overflow-hidden shadow-[0_2px_12px_rgba(23,27,38,0.04)]">
                  <table className="w-full text-left font-body-sm text-[13px]">
                    <thead>
                      <tr className="bg-surface-container border-b border-border-crisp font-caption-label text-[11px] text-on-surface-variant uppercase">
                        <th className="py-2.5 px-4">№ Index</th>
                        <th className="py-2.5 px-4">Pokémon</th>
                        <th className="py-2.5 px-4">Types</th>
                        <th className="py-2.5 px-4">BST</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-crisp">
                      {visiblePokemons.map((pokemon) => (
                        <tr
                          key={pokemon.id}
                          className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                          onClick={() => router.push(`/pokemon/${pokemon.name.toLowerCase()}`)}
                        >
                          <td className="py-2.5 px-4 font-index-mono text-[12px] text-primary font-extrabold">
                            #{String(pokemon.id).padStart(4, "0")}
                          </td>
                          <td className="py-2.5 px-4 font-headline-sm text-[14px] text-on-surface group-hover:text-primary capitalize font-semibold">
                            {pokemon.name}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {pokemon.types.map((t) => {
                                const cfg = TYPE_CONFIGS[t.toLowerCase()] || TYPE_CONFIGS.normal;
                                return (
                                  <span
                                    key={t}
                                    style={{ backgroundColor: cfg.colorHex }}
                                    className={`px-2 py-0.5 rounded font-caption-label text-[10px] uppercase font-bold shadow-2xs ${cfg.textClass}`}
                                  >
                                    {cfg.label}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-index-mono text-[12px] text-on-surface-variant font-bold">
                            {pokemon.stats?.bst ? `BST ${pokemon.stats.bst}` : "—"}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="font-caption-label text-[11px] text-primary font-bold group-hover:underline">
                              View Entry →
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Infinite Scroll Anchor & Load More */}
              <div ref={loaderRef} className="py-6 text-center flex flex-col items-center justify-center gap-2">
                {hasMore ? (
                  <button
                    onClick={loadMore}
                    type="button"
                    className="px-5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-caption-label text-[12px] uppercase font-bold border border-border-crisp shadow-xs snappy-btn"
                  >
                    Load More Pokémon ({visiblePokemons.length} of {filteredPokemons.length})
                  </button>
                ) : filteredPokemons.length > 0 ? (
                  <span className="font-caption-label text-[11px] text-on-surface-variant/80 tracking-wider">
                    — END OF REGISTERED POKÉDEX ENTRIES ({filteredPokemons.length}) —
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function PokedexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 text-center font-caption-label text-sm">INITIALIZING POKÉDEX...</div>}>
      <NationalDexContent />
    </Suspense>
  );
}
