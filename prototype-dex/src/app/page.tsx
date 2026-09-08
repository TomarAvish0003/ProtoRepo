"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TYPE_CONFIGS,
  getOfficialArtwork,
  getPokemonCryUrl,
  getJapaneseName,
  getJapaneseMoniker,
  formatPokedexNumber,
  DEFAULT_POKEMON_LORE,
} from "@/app/utils/pokemonDataHelpers";
import { useAuth } from "@/app/context/AuthContext";
import POKEDEX_DATA from "@/app/data/pokedex-data.json";
import { FlatVarietyWithTypes } from "@/app/utils/types";

const MASTER_POKEMON_CATALOG = POKEDEX_DATA as FlatVarietyWithTypes[];

// Iconic Pokémon roster for daily spotlight rotation & fast shuffle
const FEATURED_SPOTLIGHT_IDS = [
  448, 6, 94, 131, 149, 150, 197, 212, 248, 249, 257, 282, 384, 445, 483, 493,
  658, 700, 778, 888, 937, 1007, 1008, 1, 4, 7, 25, 133
];

function getDailySpotlightId(): number {
  if (typeof window === "undefined") return 448;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return FEATURED_SPOTLIGHT_IDS[dayOfYear % FEATURED_SPOTLIGHT_IDS.length];
}

interface DiscoverPokemon {
  id: number;
  name: string;
  japanese: string;
  region: string;
  type: string;
  typeBg: string;
  bst: number;
}

const DISCOVER_POOL: DiscoverPokemon[] = [
  { id: 94, name: "Gengar", japanese: "ゲンガー", region: "KANTO", type: "GHOST", typeBg: "#735797", bst: 500 },
  { id: 131, name: "Lapras", japanese: "ラプラス", region: "KANTO", type: "WATER", typeBg: "#6390F0", bst: 535 },
  { id: 133, name: "Eevee", japanese: "イーブイ", region: "KANTO", type: "NORMAL", typeBg: "#A8A77A", bst: 325 },
  { id: 700, name: "Sylveon", japanese: "ニンフィア", region: "KALOS", type: "FAIRY", typeBg: "#D685AD", bst: 525 },
  { id: 937, name: "Ceruledge", japanese: "ソウブレイズ", region: "PALDEA", type: "FIRE", typeBg: "#EE8130", bst: 525 },
  { id: 6, name: "Charizard", japanese: "リザードン", region: "KANTO", type: "FIRE", typeBg: "#EE8130", bst: 534 },
  { id: 25, name: "Pikachu", japanese: "ピカチュウ", region: "KANTO", type: "ELECTRIC", typeBg: "#F7D02C", bst: 320 },
  { id: 149, name: "Dragonite", japanese: "カイリュー", region: "KANTO", type: "DRAGON", typeBg: "#6F35FC", bst: 600 },
  { id: 249, name: "Lugia", japanese: "ルギア", region: "JOHTO", type: "PSYCHIC", typeBg: "#F95587", bst: 680 },
  { id: 384, name: "Rayquaza", japanese: "レックウザ", region: "HOENN", type: "DRAGON", typeBg: "#6F35FC", bst: 680 },
  { id: 448, name: "Lucario", japanese: "ルカリオ", region: "SINNOH", type: "FIGHTING", typeBg: "#C22E28", bst: 525 },
  { id: 658, name: "Greninja", japanese: "ゲッコウガ", region: "KALOS", type: "WATER", typeBg: "#6390F0", bst: 530 },
  { id: 888, name: "Zacian", japanese: "ザシアン", region: "GALAR", type: "FAIRY", typeBg: "#D685AD", bst: 670 },
  { id: 1007, name: "Koraidon", japanese: "コライドン", region: "PALDEA", type: "FIGHTING", typeBg: "#C22E28", bst: 670 },
  { id: 1008, name: "Miraidon", japanese: "ミライドン", region: "PALDEA", type: "ELECTRIC", typeBg: "#F7D02C", bst: 670 },
];

const REGIONAL_GATEWAYS = [
  { gen: "GEN I", name: "Kanto", kanji: "カントー地方", count: "151 SPECIES", param: "kanto" },
  { gen: "GEN II", name: "Johto", kanji: "ジョウト地方", count: "100 SPECIES", param: "johto" },
  { gen: "GEN III", name: "Hoenn", kanji: "ホウエン地方", count: "135 SPECIES", param: "hoenn" },
  { gen: "GEN IV", name: "Sinnoh", kanji: "シンオウ地方", count: "107 SPECIES", param: "sinnoh" },
  { gen: "GEN V", name: "Unova", kanji: "イッシュ地方", count: "156 SPECIES", param: "unova" },
  { gen: "GEN VI", name: "Kalos", kanji: "カロス地方", count: "72 SPECIES", param: "kalos" },
  { gen: "GEN VII", name: "Alola", kanji: "アローラ地方", count: "88 SPECIES", param: "alola" },
  { gen: "GEN VIII", name: "Galar", kanji: "ガラル地方", count: "96 SPECIES", param: "galar" },
  { gen: "GEN IX", name: "Paldea", kanji: "パルデア地方", count: "120 SPECIES", param: "paldea" },
];

export default function HomePage() {
  const router = useRouter();
  const { toggleFavorite, isFavorite, toggleCaught, isCaught } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const [displayedReel, setDisplayedReel] = useState<DiscoverPokemon[]>(DISCOVER_POOL.slice(0, 5));
  const [isShufflingReel, setIsShufflingReel] = useState(false);
  const [spotlightId, setSpotlightId] = useState<number>(448);
  const [isShufflingSpotlight, setIsShufflingSpotlight] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSpotlightId(getDailySpotlightId());
  }, []);

  const currentSpotlight = useMemo(() => {
    return (
      MASTER_POKEMON_CATALOG.find((p) => p.id === spotlightId) ||
      MASTER_POKEMON_CATALOG[0]
    );
  }, [spotlightId]);

  const primaryType = currentSpotlight.types[0]?.toLowerCase() || "normal";
  const primaryConfig = TYPE_CONFIGS[primaryType] || TYPE_CONFIGS.normal;
  const secondaryType = currentSpotlight.types[1]?.toLowerCase();
  const secondaryConfig = secondaryType ? TYPE_CONFIGS[secondaryType] : null;
  const japaneseName = getJapaneseName(currentSpotlight.id, currentSpotlight.name);
  const japaneseMoniker = getJapaneseMoniker(currentSpotlight.id, currentSpotlight.name, currentSpotlight.types);
  const artwork = getOfficialArtwork(currentSpotlight.id, currentSpotlight.sprite);
  const lore = DEFAULT_POKEMON_LORE[currentSpotlight.id] || {
    redBlue: `Documented biological intelligence profile for ${currentSpotlight.name.toUpperCase()}. Exhibits advanced sensory acuity and calibrated combat capabilities across global habitats.`,
    crystal: `Field telemetry indicates high responsiveness to ecological shifts and tactical elemental synergy.`,
    scarlet: `Laboratory scans verify stable biological parameters and exceptional evolutionary potential.`,
    habitat: "Global Terrestrial Wilds",
    rarity: "Apex Research Specimen",
    surveyYear: 2024,
    leadSurveyor: "Field Telemetry Division",
  };

  const isSpotlightFavorite = isFavorite(currentSpotlight.name);
  const isSpotlightCaught = isCaught(currentSpotlight.name);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/pokedex?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const playSpotlightCry = () => {
    if (isPlayingCry) return;
    try {
      setIsPlayingCry(true);
      if (!audioRef.current) {
        audioRef.current = new Audio(getPokemonCryUrl(currentSpotlight.id));
      } else {
        audioRef.current.src = getPokemonCryUrl(currentSpotlight.id);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = () => setIsPlayingCry(false);
    } catch {
      setIsPlayingCry(false);
    }
  };

  const handleShuffleSpotlight = () => {
    setIsShufflingSpotlight(true);
    const pool = FEATURED_SPOTLIGHT_IDS.filter((id) => id !== spotlightId);
    const nextId = pool[Math.floor(Math.random() * pool.length)] || 448;
    setTimeout(() => {
      setSpotlightId(nextId);
      setIsShufflingSpotlight(false);
    }, 200);
  };

  const handleShuffleReel = () => {
    setIsShufflingReel(true);
    const shuffled = [...DISCOVER_POOL].sort(() => 0.5 - Math.random());
    setDisplayedReel(shuffled.slice(0, 5));
    setTimeout(() => setIsShufflingReel(false), 350);
  };

  return (
    <main className="w-full pt-16 bg-background min-h-screen text-on-surface transition-colors duration-200">
      <div className="flex flex-col w-full">
        {/* Top Command Masthead (Stitch Obsidian Research OS / Lab) */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative overflow-hidden bg-surface-container-lowest/80 border-b border-border-crisp anime-grid-bg">
          <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">
            {/* Masthead Header & Badging */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-3xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-caption-label text-[10px] text-secondary uppercase font-bold tracking-widest bg-surface-container-low px-2 py-0.5 rounded border border-secondary/30">
                    OBSIDIAN RESEARCH OS // FIELD TELEMETRY
                  </span>
                </div>
                <h1 className="font-display-hero text-3xl sm:text-5xl lg:text-[52px] text-on-surface tracking-tight uppercase font-black leading-[1.08]">
                  The Definitive Pokémon <br className="hidden sm:inline" />
                  <span className="text-primary underline decoration-secondary decoration-4 underline-offset-8">
                    Research Compendium
                  </span>
                </h1>

                <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
                  Synthesized laboratory field records, combat metrics, and taxonomic classifications spanning all 9 surveyed ecological domains.
                </p>
              </div>

              {/* Global Metric Stat Cards */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                <div className="bg-charcoal-surface p-3.5 rounded-xl shadow-xs border border-border-crisp flex flex-col items-start min-w-[115px] snappy-btn">
                  <span className="font-label-chamfer text-[10px] text-on-surface-variant uppercase font-bold">Cataloged</span>
                  <span className="font-headline-md text-2xl text-primary font-bold">1,025</span>
                  <span className="font-label-kanji-sub text-[10px] text-on-surface-variant/70">種族確認</span>
                </div>
                <div className="bg-charcoal-surface p-3.5 rounded-xl shadow-xs border border-border-crisp flex flex-col items-start min-w-[115px] snappy-btn">
                  <span className="font-label-chamfer text-[10px] text-on-surface-variant uppercase font-bold">Affinities</span>
                  <span className="font-headline-md text-2xl text-secondary font-bold">18</span>
                  <span className="font-label-kanji-sub text-[10px] text-on-surface-variant/70">属性分類</span>
                </div>
                <div className="bg-charcoal-surface p-3.5 rounded-xl shadow-xs border border-border-crisp flex flex-col items-start min-w-[115px] snappy-btn">
                  <span className="font-label-chamfer text-[10px] text-on-surface-variant uppercase font-bold">Sectors</span>
                  <span className="font-headline-md text-2xl text-on-surface font-bold">9</span>
                  <span className="font-label-kanji-sub text-[10px] text-on-surface-variant/70">調査管区</span>
                </div>
              </div>
            </div>

            {/* Quick Interactive Scanner Bar */}
            <div className="bg-charcoal-surface p-2.5 rounded-xl shadow-sm border border-border-crisp flex flex-col gap-2.5">
              <form onSubmit={handleSearch} className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg border border-border-crisp focus-within:ring-2 focus-within:ring-secondary focus-within:border-transparent transition-all">
                <span className="material-symbols-outlined text-secondary text-[22px]">manage_search</span>
                <input
                  id="pokedex-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan by Pokemon Name, #ID (e.g. 0448), Elemental Type, or Habitat..."
                  className="w-full bg-transparent font-body-md text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                />
                <button
                  type="submit"
                  className="bg-primary hover:opacity-90 text-white font-telemetry-data text-xs uppercase px-4 py-2 rounded-lg shadow-xs font-bold shrink-0 flex items-center gap-1.5 snappy-btn"
                >
                  <span>Query</span>
                  <span className="font-label-kanji-sub text-[10px] opacity-80">検索</span>
                </button>
              </form>

              {/* Filter Chips Strip */}
              <div className="flex items-center gap-1.5 flex-wrap px-1 font-label-chamfer text-xs">
                <span className="text-on-surface-variant font-bold uppercase mr-1">Direct Filters:</span>
                <Link
                  href="/pokedex?type=fire"
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5 snappy-btn border border-border-crisp"
                >
                  <span className="w-2 h-2 rounded-full bg-[#EE8130]"></span> Fire // 炎
                </Link>
                <Link
                  href="/pokedex?type=water"
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5 snappy-btn border border-border-crisp"
                >
                  <span className="w-2 h-2 rounded-full bg-[#6390F0]"></span> Water // 水
                </Link>
                <Link
                  href="/pokedex?type=grass"
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5 snappy-btn border border-border-crisp"
                >
                  <span className="w-2 h-2 rounded-full bg-[#7AC74C]"></span> Grass // 草
                </Link>
                <Link
                  href="/pokedex?type=electric"
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5 snappy-btn border border-border-crisp"
                >
                  <span className="w-2 h-2 rounded-full bg-[#F7D02C]"></span> Electric // 雷
                </Link>
                <Link
                  href="/pokedex?filter=legend"
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5 snappy-btn border border-border-crisp"
                >
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Legendary // 伝説
                </Link>
                <Link
                  href="/pokedex?gen=1"
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors snappy-btn border border-border-crisp"
                >
                  Gen I Kanto // 関東
                </Link>
                <Link
                  href="/pokedex?gen=9"
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors snappy-btn border border-border-crisp"
                >
                  Gen IX Paldea // パルデア
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Dynamic Featured Pokémon Spotlight */}
        <section className="w-full bg-background border-y border-border-crisp py-12 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header / Badging */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border-crisp mb-8 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-caption-label text-xs tracking-widest uppercase text-primary font-bold">
                  FEATURED POKÉMON OF THE DAY
                </span>
                <span className="font-subhead-kana text-xs text-on-surface-variant">
                  本日の特選アーカイブ
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 font-index-mono text-xs text-on-surface-variant">
                  <span>{formatPokedexNumber(currentSpotlight.id)}</span>
                  <span className="text-border-crisp">|</span>
                  <span className="text-secondary font-bold">
                    {currentSpotlight.types.map((t) => t.toUpperCase()).join(" / ")}
                  </span>
                </div>
                <button
                  onClick={handleShuffleSpotlight}
                  disabled={isShufflingSpotlight}
                  className="snappy-btn px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-secondary border border-secondary/30 font-caption-label text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all shadow-xs"
                  title="Randomize spotlight Pokémon"
                  type="button"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isShufflingSpotlight ? "animate-spin" : ""}`}>
                    casino
                  </span>
                  <span>Shuffle Spotlight</span>
                </button>
              </div>
            </div>

            {/* Asymmetric Editorial Spread */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch transition-opacity duration-300 ${isShufflingSpotlight ? "opacity-50" : "opacity-100"}`}>
              {/* Left: Visual Specimen Plate & Japanese Kanji Callout */}
              <div className="lg:col-span-6 relative bg-charcoal-surface rounded-2xl p-6 sm:p-8 border border-border-crisp shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden">
                {/* Vertical Japanese Watermark Callout (As shown in Stitch prototype) */}
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none text-on-surface/[0.05] font-black tracking-widest text-4xl sm:text-5xl lg:text-6xl font-sans"
                  style={{ writingMode: "vertical-rl" }}
                  aria-hidden="true"
                >
                  {japaneseMoniker}
                </div>

                <div className="flex items-start justify-between z-10">
                  <div>
                    <span className="font-index-mono text-xs text-on-surface-variant block font-bold">
                      {formatPokedexNumber(currentSpotlight.id)} / NATIONAL DEX
                    </span>
                    <h2 className="font-headline-lg text-3xl sm:text-4xl font-black text-on-surface tracking-tight mt-1 capitalize">
                      {currentSpotlight.name.replace(/-/g, " ")}
                    </h2>
                    <p className="font-subhead-kana text-sm text-on-surface-variant tracking-wider mt-0.5">
                      {japaneseName}
                    </p>
                  </div>

                  {/* Elemental Affinities */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span
                      style={{ backgroundColor: primaryConfig.colorHex }}
                      className={`px-3 py-1 rounded font-caption-label text-[11px] font-bold uppercase tracking-wider shadow-sm ${primaryConfig.textClass}`}
                    >
                      {`${primaryConfig.label} // ${primaryConfig.kanji}`}
                    </span>
                    {secondaryConfig && (
                      <span
                        style={{ backgroundColor: secondaryConfig.colorHex }}
                        className={`px-3 py-1 rounded font-caption-label text-[11px] font-bold uppercase tracking-wider shadow-sm ${secondaryConfig.textClass}`}
                      >
                        {`${secondaryConfig.label} // ${secondaryConfig.kanji}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Concentric Aura Waveform Ring Background & Artwork */}
                <div className="my-6 relative flex items-center justify-center min-h-[300px]">
                  <div
                    className="w-72 h-72 rounded-full absolute -z-0 blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
                    style={{ backgroundColor: primaryConfig.colorHex }}
                  />
                  <div
                    className="w-64 h-64 rounded-full border border-dashed border-border-crisp absolute animate-spin"
                    style={{ animationDuration: "35s" }}
                  />
                  <img
                    src={artwork}
                    alt={currentSpotlight.name}
                    className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 object-contain transition-transform duration-500 hover:scale-105 drop-shadow-[0_12px_28px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
                  />
                </div>

                {/* Bottom Metric Quick Readout */}
                <div className="pt-4 border-t border-border-crisp grid grid-cols-3 gap-2 font-caption-label text-xs">
                  <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-crisp">
                    <span className="text-on-surface-variant block text-[10px] uppercase font-bold">HEIGHT // 身長</span>
                    <span className="font-telemetry-data text-sm font-bold text-on-surface">
                      {currentSpotlight.height ? `${(currentSpotlight.height / 10).toFixed(1)} m` : "—"}
                    </span>
                  </div>
                  <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-crisp">
                    <span className="text-on-surface-variant block text-[10px] uppercase font-bold">WEIGHT // 体重</span>
                    <span className="font-telemetry-data text-sm font-bold text-on-surface">
                      {currentSpotlight.weight ? `${(currentSpotlight.weight / 10).toFixed(1)} kg` : "—"}
                    </span>
                  </div>
                  <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-crisp">
                    <span className="text-on-surface-variant block text-[10px] uppercase font-bold">HABITAT</span>
                    <span className="font-telemetry-data text-xs font-bold text-secondary truncate block">
                      {lore.habitat}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Telemetry, Abilities, Stat Breakdown & Actions */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-6 bg-charcoal-surface rounded-2xl p-6 sm:p-8 border border-border-crisp shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border-crisp">
                    <span className="font-caption-label text-xs uppercase tracking-wider text-secondary font-bold">
                      FIELD OBSERVATION NOTES
                    </span>
                    <button
                      onClick={playSpotlightCry}
                      type="button"
                      className={`inline-flex items-center gap-1.5 font-caption-label text-xs px-3 py-1 rounded transition-colors snappy-btn ${
                        isPlayingCry
                          ? "bg-primary text-white shadow-xs"
                          : "bg-surface-container-low text-secondary hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isPlayingCry ? "graphic_eq" : "volume_up"}
                      </span>
                      <span>{isPlayingCry ? "PLAYING..." : "PLAY CRY (0.8s)"}</span>
                    </button>
                  </div>

                  <p className="font-body-md text-sm sm:text-base text-on-surface mt-4 leading-relaxed">
                    {lore.redBlue || lore.scarlet || `High-resolution biological index profile for ${currentSpotlight.name}. Monitored across field research domains with calibrated telemetry feeds.`}
                  </p>

                  {/* Diagnostic Information */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="p-3 rounded-lg bg-surface-container-low border border-border-crisp">
                      <span className="font-caption-label text-[10px] text-on-surface-variant uppercase block font-bold">
                        SURVEY CLASSIFICATION
                      </span>
                      <span className="font-headline-sm text-sm font-bold text-primary block mt-0.5">
                        {lore.rarity || "Field Specimen"}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant block mt-1">
                        Survey Lead: {lore.leadSurveyor || "Prof. Samuel Oak"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low border border-border-crisp">
                      <span className="font-caption-label text-[10px] text-on-surface-variant uppercase block font-bold">
                        PRIMARY AFFINITY
                      </span>
                      <span className="font-headline-sm text-sm font-bold text-secondary block mt-0.5 capitalize">
                        {primaryType} Type Mastery
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant block mt-1">
                        Calibrated for tactical combat &amp; elemental synergy.
                      </span>
                    </div>
                  </div>

                  {/* Base Stat Combat Matrix */}
                  <div className="mt-6 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between font-caption-label text-xs text-on-surface-variant uppercase">
                      <span>BASE STAT COMBAT MATRIX</span>
                      <span className="text-secondary font-bold font-index-mono">
                        TOTAL: {currentSpotlight.stats?.bst || 500} BST
                      </span>
                    </div>
                    {[
                      { label: "HP", val: currentSpotlight.stats?.hp ?? 70, color: "bg-primary" },
                      { label: "ATK", val: currentSpotlight.stats?.atk ?? 90, color: "bg-secondary" },
                      { label: "DEF", val: currentSpotlight.stats?.def ?? 75, color: "bg-primary" },
                      { label: "SP.ATK", val: currentSpotlight.stats?.spa ?? 95, color: "bg-secondary" },
                      { label: "SP.DEF", val: currentSpotlight.stats?.spd ?? 75, color: "bg-primary" },
                      { label: "SPEED", val: currentSpotlight.stats?.spe ?? 95, color: "bg-secondary" },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3">
                        <span className="font-caption-label text-[11px] text-on-surface-variant w-14 font-bold">
                          {stat.label}
                        </span>
                        <div className="flex-1 h-2 rounded bg-surface-container-high overflow-hidden">
                          <div
                            className={`h-full ${stat.color} rounded transition-all duration-500`}
                            style={{ width: `${Math.min(100, (stat.val / 160) * 100)}%` }}
                          />
                        </div>
                        <span className="font-index-mono text-xs text-on-surface w-8 text-right font-bold">
                          {stat.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-6 pt-4 border-t border-border-crisp flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Favorite Bookmark Button */}
                    <button
                      onClick={() => toggleFavorite(currentSpotlight.name)}
                      className={`snappy-btn px-3 py-2 rounded-lg border font-caption-label text-xs uppercase flex items-center gap-1.5 transition-colors ${
                        isSpotlightFavorite
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40"
                          : "border-border-crisp hover:bg-surface-container-low text-on-surface"
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isSpotlightFavorite ? "bookmark_added" : "bookmark"}
                      </span>
                      <span>{isSpotlightFavorite ? "Bookmarked" : "Favorite"}</span>
                    </button>

                    {/* Caught Button */}
                    <button
                      onClick={() => toggleCaught(currentSpotlight.name)}
                      className={`snappy-btn px-3 py-2 rounded-lg border font-caption-label text-xs uppercase flex items-center gap-1.5 transition-colors ${
                        isSpotlightCaught
                          ? "bg-secondary/15 text-secondary border-secondary/30"
                          : "border-border-crisp hover:bg-surface-container-low text-on-surface"
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isSpotlightCaught ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span>{isSpotlightCaught ? "Caught" : "Log Catch"}</span>
                    </button>
                  </div>

                  <Link
                    href={`/pokemon/${currentSpotlight.name.toLowerCase()}`}
                    className="snappy-btn px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 text-white font-caption-label text-xs uppercase font-bold shadow-xs transition-all inline-flex items-center gap-2"
                  >
                    <span>Open Master Dossier</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Random Discover Reel */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border-crisp">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-caption-label text-xs uppercase text-secondary font-bold">
                  SERENDIPITOUS ARCHIVE
                </span>
                <span className="font-subhead-kana text-xs text-on-surface-variant">
                  偶発的な出会い
                </span>
              </div>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface mt-1">
                Curated Field Discoveries
              </h2>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Continuous five-Pokémon randomized exploration roll across global habitats.
              </p>
            </div>
            <button
              onClick={handleShuffleReel}
              disabled={isShufflingReel}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-secondary border border-secondary/30 transition-all font-caption-label text-xs uppercase active:scale-95 shadow-xs snappy-btn"
            >
              <span className={`material-symbols-outlined text-[18px] ${isShufflingReel ? "animate-spin" : ""}`}>
                autorenew
              </span>
              <span>Shuffle / ↻ Draw New Random</span>
            </button>
          </div>

          {/* 5 Pokémon Cards Reel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {displayedReel.map((pokemon) => (
              <Link
                key={pokemon.id}
                href={`/pokemon/${pokemon.name.toLowerCase()}`}
                className="group pokemon-card bg-charcoal-surface rounded-xl p-4 border border-border-crisp hover:border-primary shadow-xs hover:shadow-lg dark:hover:shadow-[0_8px_24px_rgba(255,51,85,0.2)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border-crisp">
                    <span className="font-index-mono text-xs text-on-surface-variant font-bold">
                      #{String(pokemon.id).padStart(4, "0")}
                    </span>
                    <span
                      className="font-caption-label text-[10px] px-2 py-0.5 rounded text-white font-bold"
                      style={{ backgroundColor: pokemon.typeBg }}
                    >
                      {pokemon.type}
                    </span>
                  </div>

                  <div
                    className="my-4 h-36 flex items-center justify-center rounded-lg p-2 overflow-hidden relative transition-all duration-300 border"
                    style={{
                      backgroundColor: `${pokemon.typeBg}15`,
                      borderColor: `${pokemon.typeBg}35`,
                    }}
                  >
                    <div
                      className="absolute w-24 h-24 rounded-full blur-xl opacity-60 group-hover:scale-125 transition-transform duration-500 pointer-events-none"
                      style={{ backgroundColor: pokemon.typeBg }}
                    ></div>
                    <span className="absolute top-2 left-2 text-[10px] font-caption-label text-on-surface-variant font-bold">
                      {pokemon.region}
                    </span>
                    <img
                      src={getOfficialArtwork(pokemon.id)}
                      alt={pokemon.name}
                      className="h-28 w-28 object-contain group-hover:scale-108 transition-transform drop-shadow-[0_6px_14px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] relative z-10"
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-base text-on-surface group-hover:text-secondary transition-colors font-bold">
                      {pokemon.name}
                    </h3>
                    <span className="font-subhead-kana text-xs text-on-surface-variant">
                      {pokemon.japanese}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border-crisp flex items-center justify-between font-caption-label text-xs text-on-surface-variant">
                  <span className="text-secondary font-bold">BST {pokemon.bst}</span>
                  <span className="inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-primary font-bold">
                    <span>Inspect</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 4: Regional Field Gateways & Type Matrix Discovery */}
        <section className="w-full bg-surface-container-low/50 border-t border-border-crisp py-12 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Title Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-crisp gap-4">
              <div>
                <span className="font-caption-label text-xs uppercase tracking-widest text-primary font-bold">
                  GEOGRAPHIC &amp; ELEMENTAL TAXONOMY
                </span>
                <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface mt-0.5">
                  Regions of the Known World
                </h2>
                <p className="font-body-sm text-sm text-on-surface-variant">
                  Navigate Pokémon categorized by geographical origin and elemental typology.
                </p>
              </div>
              <span className="font-subhead-kana text-xs text-on-surface-variant">
                地方別分類 &amp; 属性マトリクス
              </span>
            </div>

            {/* 9 Regional Gateways Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 mt-8">
              {REGIONAL_GATEWAYS.map((r) => (
                <Link
                  key={r.name}
                  href={`/pokedex?region=${r.param}`}
                  className="region-tile group p-3 bg-charcoal-surface rounded-lg border border-border-crisp hover:border-primary shadow-xs hover:shadow-[0_4px_16px_rgba(255,51,85,0.2)] transition-all flex flex-col justify-between"
                >
                  <span className="font-index-mono text-xs text-on-surface-variant">
                    {r.gen}
                  </span>
                  <div className="my-3">
                    <span className="font-headline-sm text-sm font-bold text-on-surface group-hover:text-secondary transition-colors block">
                      {r.name}
                    </span>
                    <span className="font-subhead-kana text-[10px] text-on-surface-variant block">
                      {r.kanji}
                    </span>
                  </div>
                  <span className="font-caption-label text-[10px] text-secondary font-semibold">
                    {r.count}
                  </span>
                </Link>
              ))}
            </div>

            {/* 18-Type Taxonomy Matrix */}
            <div className="mt-12 pt-8 border-t border-border-crisp">
              <div className="flex items-center justify-between pb-4">
                <span className="font-caption-label text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                  OFFICIAL 18-AFFINITY TAXONOMY
                </span>
                <Link
                  href="/pokedex"
                  className="font-caption-label text-xs text-secondary hover:text-primary uppercase font-bold transition-colors"
                >
                  View Full Cross-Matrix →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(TYPE_CONFIGS).map(([key, config]) => (
                  <Link
                    key={key}
                    href={`/pokedex?type=${key}`}
                    className="p-2.5 rounded-lg bg-charcoal-surface border border-border-crisp hover:border-primary transition-all flex items-center justify-between shadow-xs group snappy-btn"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: config.colorHex }}
                      ></span>
                      <span className="font-caption-label text-[11px] uppercase font-bold text-on-surface group-hover:text-secondary transition-colors">
                        {config.label}
                      </span>
                    </div>
                    <span className="font-subhead-kana text-xs text-on-surface-variant opacity-75">
                      {config.kanji}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Field Ranger Banner / Interactive CTA */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-charcoal-surface text-on-surface rounded-2xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-border-crisp shadow-xs dark:shadow-2xl">
            {/* Decorative subtle stamp */}
            <div className="absolute -right-8 -bottom-10 select-none pointer-events-none text-on-surface/[0.03] font-black text-9xl tracking-tighter">
              図鑑
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="font-caption-label text-xs uppercase tracking-wider font-bold">
                  OFFICIAL FIELD DISPATCH
                </span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                Sync Your Personal Trainer Journal
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant mt-2 leading-relaxed">
                Connect your field capture telemetry, log caught species, and synchronize your collection to cloud Pokédex storage.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link
                href="/caught"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary hover:opacity-90 text-white font-caption-label text-xs font-bold uppercase shadow-xs transition-all text-center"
              >
                Open Trainer Log
              </Link>
              <Link
                href="/favorites"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-surface-container-low border border-border-crisp hover:border-secondary text-secondary font-caption-label text-xs font-bold uppercase transition-colors text-center"
              >
                View Favorites
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
