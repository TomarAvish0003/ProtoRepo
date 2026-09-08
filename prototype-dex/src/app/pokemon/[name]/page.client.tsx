"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Pokemon,
  EvolutionStage,
  Move,
  Ability,
  FlavorTextEntry,
  PokemonEncounter,
  PokemonForm,
  RawStat,
} from "@/app/utils/types";
import {
  TYPE_CONFIGS,
  getJapaneseName,
  formatPokedexNumber,
  formatArchivalIndex,
  getOfficialArtwork,
  getShinyArtwork,
  getPokemonCryUrl,
  DEFAULT_POKEMON_LORE,
} from "@/app/utils/pokemonDataHelpers";
import {
  Bookmark,
  CheckCircle2,
  Users,
  Volume2,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const GAME_LORE_METADATA: Record<string, { label: string; gen: string; year: string }> = {
  "red": { label: "Red", gen: "GEN I", year: "1996" },
  "blue": { label: "Blue", gen: "GEN I", year: "1996" },
  "yellow": { label: "Yellow", gen: "GEN I", year: "1998" },
  "gold": { label: "Gold", gen: "GEN II", year: "1999" },
  "silver": { label: "Silver", gen: "GEN II", year: "1999" },
  "crystal": { label: "Crystal", gen: "GEN II", year: "2000" },
  "ruby": { label: "Ruby", gen: "GEN III", year: "2002" },
  "sapphire": { label: "Sapphire", gen: "GEN III", year: "2002" },
  "emerald": { label: "Emerald", gen: "GEN III", year: "2004" },
  "firered": { label: "FireRed", gen: "GEN III", year: "2004" },
  "leafgreen": { label: "LeafGreen", gen: "GEN III", year: "2004" },
  "diamond": { label: "Diamond", gen: "GEN IV", year: "2006" },
  "pearl": { label: "Pearl", gen: "GEN IV", year: "2006" },
  "platinum": { label: "Platinum", gen: "GEN IV", year: "2008" },
  "heartgold": { label: "HeartGold", gen: "GEN IV", year: "2009" },
  "soulsilver": { label: "SoulSilver", gen: "GEN IV", year: "2009" },
  "black": { label: "Black", gen: "GEN V", year: "2010" },
  "white": { label: "White", gen: "GEN V", year: "2010" },
  "black-2": { label: "Black 2", gen: "GEN V", year: "2012" },
  "white-2": { label: "White 2", gen: "GEN V", year: "2012" },
  "x": { label: "X", gen: "GEN VI", year: "2013" },
  "y": { label: "Y", gen: "GEN VI", year: "2013" },
  "omega-ruby": { label: "Omega Ruby", gen: "GEN VI", year: "2014" },
  "alpha-sapphire": { label: "Alpha Sapphire", gen: "GEN VI", year: "2014" },
  "sun": { label: "Sun", gen: "GEN VII", year: "2016" },
  "moon": { label: "Moon", gen: "GEN VII", year: "2016" },
  "ultra-sun": { label: "Ultra Sun", gen: "GEN VII", year: "2017" },
  "ultra-moon": { label: "Ultra Moon", gen: "GEN VII", year: "2017" },
  "lets-go-pikachu": { label: "Let's Go Pikachu", gen: "GEN VII", year: "2018" },
  "lets-go-eevee": { label: "Let's Go Eevee", gen: "GEN VII", year: "2018" },
  "sword": { label: "Sword", gen: "GEN VIII", year: "2019" },
  "shield": { label: "Shield", gen: "GEN VIII", year: "2019" },
  "brilliant-diamond": { label: "Brilliant Diamond", gen: "GEN VIII", year: "2021" },
  "shining-pearl": { label: "Shining Pearl", gen: "GEN VIII", year: "2021" },
  "legends-arceus": { label: "Legends: Arceus", gen: "GEN VIII", year: "2022" },
  "scarlet": { label: "Scarlet", gen: "GEN IX", year: "2022" },
  "violet": { label: "Violet", gen: "GEN IX", year: "2022" },
};

const VERSION_GROUP_LABELS: Record<string, { label: string; gen: string }> = {
  "scarlet-violet": { label: "Scarlet & Violet", gen: "Gen IX" },
  "legends-arceus": { label: "Legends: Arceus", gen: "Gen VIII" },
  "brilliant-diamond-and-shining-pearl": { label: "Brilliant Diamond & Shining Pearl", gen: "Gen VIII" },
  "sword-shield": { label: "Sword & Shield", gen: "Gen VIII" },
  "ultra-sun-ultra-moon": { label: "Ultra Sun & Ultra Moon", gen: "Gen VII" },
  "sun-moon": { label: "Sun & Moon", gen: "Gen VII" },
  "omega-ruby-alpha-sapphire": { label: "Omega Ruby & Alpha Sapphire", gen: "Gen VI" },
  "x-y": { label: "X & Y", gen: "Gen VI" },
  "black-2-white-2": { label: "Black 2 & White 2", gen: "Gen V" },
  "black-white": { label: "Black & White", gen: "Gen V" },
  "heartgold-soulsilver": { label: "HeartGold & SoulSilver", gen: "Gen IV" },
  "platinum": { label: "Platinum", gen: "Gen IV" },
  "diamond-pearl": { label: "Diamond & Pearl", gen: "Gen IV" },
  "firered-leafgreen": { label: "FireRed & LeafGreen", gen: "Gen III" },
  "emerald": { label: "Emerald", gen: "Gen III" },
  "ruby-sapphire": { label: "Ruby & Sapphire", gen: "Gen III" },
  "crystal": { label: "Crystal", gen: "Gen II" },
  "gold-silver": { label: "Gold & Silver", gen: "Gen II" },
  "yellow": { label: "Yellow", gen: "Gen I" },
  "red-blue": { label: "Red & Blue", gen: "Gen I" },
};

interface PokemonDetailClientProps {
  pokemon: Pokemon;
  evoChain: EvolutionStage[];
  evoError: string | null;
  flavorTexts: FlavorTextEntry[];
  abilities: Ability[];
  moves: Move[];
  encounters: PokemonEncounter[];
  availableVersions: string[];
  availableEncounterVersions: string[];
  forms: PokemonForm[];
}

export default function PokemonDetailClient({
  pokemon,
  evoChain,
  flavorTexts,
  abilities,
  moves,
  availableVersions = [],
}: PokemonDetailClientProps) {
  const [isShiny, setIsShiny] = useState(false);
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const { isFavorite, isCaught: isCaughtInDex, toggleFavorite, toggleCaught } = useAuth();
  const isBookmarked = isFavorite(pokemon.name);
  const isCaught = isCaughtInDex(pokemon.name);
  const [selectedLoreVersion, setSelectedLoreVersion] = useState<string>("");
  const [selectedGameVersion, setSelectedGameVersion] = useState<string>("");
  const [moveFilter, setMoveFilter] = useState<string>("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pokemonId = pokemon.id;
  const formattedId = formatPokedexNumber(pokemonId);
  const archivalIndex = formatArchivalIndex(pokemonId);
  const japaneseName = getJapaneseName(pokemonId, pokemon.name);

  // Types
  const pokemonTypes = useMemo(() => {
    return pokemon.types.map((t) => t.type.name.toLowerCase());
  }, [pokemon.types]);

  const primaryType = pokemonTypes[0] || "normal";
  const primaryConfig = TYPE_CONFIGS[primaryType] || TYPE_CONFIGS.normal;

  // Stats calculation
  const statsMap = useMemo(() => {
    const map: Record<string, number> = {
      hp: 45,
      attack: 49,
      defense: 49,
      "special-attack": 65,
      "special-defense": 65,
      speed: 45,
    };
    if (pokemon.stats) {
      pokemon.stats.forEach((s: RawStat) => {
        map[s.stat.name] = s.base_stat;
      });
    }
    return map;
  }, [pokemon.stats]);

  const hp = statsMap["hp"] ?? 45;
  const atk = statsMap["attack"] ?? 49;
  const def = statsMap["defense"] ?? 49;
  const spa = statsMap["special-attack"] ?? 65;
  const spd = statsMap["special-defense"] ?? 65;
  const spe = statsMap["speed"] ?? 45;
  const bst = hp + atk + def + spa + spd + spe;

  // Biometrics
  const heightM = (pokemon.height / 10).toFixed(1);
  const heightFtIn = `${Math.floor((pokemon.height * 0.1) * 3.28084)}′${Math.round(((pokemon.height * 0.1) * 3.28084 % 1) * 12).toString().padStart(2, "0")}″`;
  const weightKg = (pokemon.weight / 10).toFixed(1);
  const weightLbs = ((pokemon.weight / 10) * 2.20462).toFixed(1);

  // Audio Cry
  const playCry = () => {
    if (isPlayingCry) return;
    setIsPlayingCry(true);
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(getPokemonCryUrl(pokemonId));
      } else {
        audioRef.current.src = getPokemonCryUrl(pokemonId);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = () => setIsPlayingCry(false);
    } catch {
      setIsPlayingCry(false);
    }
  };

  // Lore text mapping for ALL games provided by API
  const availableLoreEntries = useMemo(() => {
    if (!flavorTexts || flavorTexts.length === 0) {
      const customLore = DEFAULT_POKEMON_LORE[pokemonId];
      if (customLore) {
        return [
          { version: "red", label: "Red / Blue", gen: "GEN I", year: "1996", text: customLore.redBlue },
          { version: "crystal", label: "Crystal", gen: "GEN II", year: "2000", text: customLore.crystal },
          { version: "scarlet", label: "Scarlet", gen: "GEN IX", year: "2022", text: customLore.scarlet },
        ];
      }
      return [
        {
          version: "standard",
          label: "National Archive",
          gen: "ARCHIVE",
          year: "1996",
          text: `${pokemon.name} displays exceptional survival instincts across ecological biomes. Its physical structure allows it to command elemental energy with distinct precision.`,
        },
      ];
    }

    return flavorTexts.map((ft) => {
      const vKey = ft.version.toLowerCase();
      const meta = GAME_LORE_METADATA[vKey] || {
        label: ft.version.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        gen: "CHRONICLE",
        year: "ARCHIVE",
      };
      return {
        version: ft.version,
        label: meta.label,
        gen: meta.gen,
        year: meta.year,
        text: ft.text,
      };
    });
  }, [flavorTexts, pokemonId, pokemon.name]);

  const activeLore = useMemo(() => {
    if (availableLoreEntries.length === 0) return null;
    if (selectedLoreVersion) {
      const found = availableLoreEntries.find((e) => e.version === selectedLoreVersion);
      if (found) return found;
    }
    // Default to the latest entry
    return availableLoreEntries[availableLoreEntries.length - 1];
  }, [availableLoreEntries, selectedLoreVersion]);

  // Abilities
  const primaryAbility = abilities[0] || {
    name: "Standard Ability",
    description: "Innate combat capability.",
  };
  const hiddenAbility = abilities.find((a) => a.is_hidden) || abilities[1] || {
    name: "Hidden Ability",
    description: "Latent tactical mastery unleashed under specific field conditions.",
  };

  // Type Matchups (computed from authentic type effectiveness)
  const defensiveMatchups = useMemo(() => {
    const eff = pokemon.type_effectiveness;
    if (eff && Object.keys(eff).length > 0) {
      const weaknesses: { type: string; multiplier: number }[] = [];
      const resistances: { type: string; multiplier: number }[] = [];
      const immunities: { type: string; multiplier: number }[] = [];

      for (const [tName, mult] of Object.entries(eff)) {
        const typeLower = tName.toLowerCase();
        if (mult > 1) {
          weaknesses.push({ type: typeLower, multiplier: mult });
        } else if (mult === 0) {
          immunities.push({ type: typeLower, multiplier: mult });
        } else if (mult < 1) {
          resistances.push({ type: typeLower, multiplier: mult });
        }
      }

      // Sort by multiplier descending
      weaknesses.sort((a, b) => b.multiplier - a.multiplier);
      resistances.sort((a, b) => a.multiplier - b.multiplier);

      return {
        weaknesses,
        resistances: [...immunities, ...resistances],
      };
    }

    return {
      weaknesses: [
        { type: "water", multiplier: 2 },
        { type: "ground", multiplier: 2 },
        { type: "rock", multiplier: 2 },
      ],
      resistances: [
        { type: "fire", multiplier: 0.5 },
        { type: "grass", multiplier: 0.5 },
        { type: "ice", multiplier: 0.5 },
        { type: "bug", multiplier: 0.5 },
        { type: "steel", multiplier: 0.5 },
        { type: "fairy", multiplier: 0.5 },
      ],
    };
  }, [pokemon.type_effectiveness]);

  // Game version groups for moves
  const availableGameGroups = useMemo(() => {
    const set = new Set<string>();
    if (moves) {
      for (const m of moves) {
        if (m.version_group) set.add(m.version_group);
      }
    }
    if (availableVersions) {
      for (const v of availableVersions) set.add(v);
    }
    const list = Array.from(set);
    const priority = [
      "scarlet-violet",
      "legends-arceus",
      "brilliant-diamond-and-shining-pearl",
      "sword-shield",
      "ultra-sun-ultra-moon",
      "sun-moon",
      "omega-ruby-alpha-sapphire",
      "x-y",
      "black-2-white-2",
      "black-white",
      "heartgold-soulsilver",
      "platinum",
      "diamond-pearl",
      "firered-leafgreen",
      "emerald",
      "ruby-sapphire",
      "crystal",
      "gold-silver",
      "yellow",
      "red-blue",
    ];
    list.sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return list;
  }, [moves, availableVersions]);

  // Active game version defaults to latest available (e.g. scarlet-violet)
  const activeGameVersion = useMemo(() => {
    if (selectedGameVersion) return selectedGameVersion;
    if (availableGameGroups.length > 0) return availableGameGroups[0];
    return "all";
  }, [selectedGameVersion, availableGameGroups]);

  // Filtered & Deduplicated Moves
  const processedMoves = useMemo(() => {
    if (!moves || moves.length === 0) return [];

    // 1. Filter by game version group if not "all"
    let groupMoves = moves;
    if (activeGameVersion && activeGameVersion !== "all") {
      groupMoves = moves.filter((m) => m.version_group === activeGameVersion);
    }

    // 2. Filter by learn method
    if (moveFilter !== "all") {
      groupMoves = groupMoves.filter((m) => {
        if (moveFilter === "level") return m.method === "level-up";
        if (moveFilter === "tm") return m.method === "machine";
        if (moveFilter === "egg") return m.method === "egg";
        if (moveFilter === "tutor") return m.method === "tutor";
        return true;
      });
    }

    // 3. Deduplicate by move name so a move NEVER appears twice!
    const dedupedMap = new Map<string, Move>();
    for (const m of groupMoves) {
      const key = m.name.toLowerCase();
      const existing = dedupedMap.get(key);
      if (!existing) {
        dedupedMap.set(key, m);
      } else {
        // If both are level-up, prefer the lowest level
        if (m.method === "level-up" && (m.level_learned_at || 0) < (existing.level_learned_at || 999)) {
          dedupedMap.set(key, m);
        }
      }
    }

    const list = Array.from(dedupedMap.values());

    // 4. Sort: Level-up moves by level ascending, then alphabetically
    list.sort((a, b) => {
      if (a.method === "level-up" && b.method === "level-up") {
        return (a.level_learned_at || 1) - (b.level_learned_at || 1);
      }
      if (a.method === "level-up") return -1;
      if (b.method === "level-up") return 1;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [moves, activeGameVersion, moveFilter]);

  // SVG Radar Chart Calculation
  // Radar vertices (Center: 100, 100, Max Radius: 65)
  // HP (top), ATK (top right), DEF (bottom right), SPE (bottom), SP.DEF (bottom left), SP.ATK (top left)
  const radarData = useMemo(() => {
    const scale = (val: number) => Math.min(Math.max((val / 160) * 65, 15), 65);
    const rHP = scale(hp);
    const rATK = scale(atk);
    const rDEF = scale(def);
    const rSPE = scale(spe);
    const rSPD = scale(spd);
    const rSPA = scale(spa);

    // Coordinates:
    // HP: 0 deg (top) -> (100, 100 - rHP)
    // ATK: 60 deg -> (100 + rATK * sin60, 100 - rATK * cos60)
    // DEF: 120 deg -> (100 + rDEF * sin60, 100 + rDEF * cos60)
    // SPE: 180 deg (bottom) -> (100, 100 + rSPE)
    // SPD: 240 deg -> (100 - rSPD * sin60, 100 + rSPD * cos60)
    // SPA: 300 deg -> (100 - rSPA * sin60, 100 - rSPA * cos60)
    const sin60 = 0.866;
    const cos60 = 0.5;

    const pHP = `100,${(100 - rHP).toFixed(1)}`;
    const pATK = `${(100 + rATK * sin60).toFixed(1)},${(100 - rATK * cos60).toFixed(1)}`;
    const pDEF = `${(100 + rDEF * sin60).toFixed(1)},${(100 + rDEF * cos60).toFixed(1)}`;
    const pSPE = `100,${(100 + rSPE).toFixed(1)}`;
    const pSPD = `${(100 - rSPD * sin60).toFixed(1)},${(100 + rSPD * cos60).toFixed(1)}`;
    const pSPA = `${(100 - rSPA * sin60).toFixed(1)},${(100 - rSPA * cos60).toFixed(1)}`;

    return {
      points: `${pHP} ${pATK} ${pDEF} ${pSPE} ${pSPD} ${pSPA}`,
      coords: { pHP, pATK, pDEF, pSPE, pSPD, pSPA },
    };
  }, [hp, atk, def, spa, spd, spe]);

  return (
    <main className="w-full pt-20 bg-background text-on-surface anime-grid-bg min-h-screen">
      <div className="flex flex-col w-full">
        {/* Archival Navigation Breadcrumb Bar */}
        <section className="w-full bg-surface-container-lowest/80 backdrop-blur-xs border-b border-border-crisp py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-inset-sm font-caption-label text-caption-label text-on-surface-variant flex-wrap">
              <Link href="/pokedex" className="hover:text-primary transition-colors flex items-center gap-1 snappy-btn">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ARCHIVE DEPT.</span>
              </Link>
              <span>/</span>
              <span className="text-primary font-bold">№ {formattedId} POKÉMON</span>
            </div>
            <div className="flex items-center gap-inset-xs font-index-mono text-index-mono text-secondary font-bold">
              <span>ACTIVE ARCHIVE</span>
            </div>
          </div>
        </section>

        {/* Editorial Masthead & Pokemon Stage */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
            {/* Left Editorial Pokemon Stage (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-inset-md">
              {/* Archival Pokemon Plate */}
              <div className="bg-surface-container-lowest border border-surface-container rounded-xl p-inset-lg shadow-archival-sm relative overflow-hidden flex flex-col justify-between">
                {/* Japanese Stamp Annotation */}
                <div className="flex items-center justify-between pb-inset-sm border-b border-surface-container">
                  <span className="font-caption-label text-caption-label text-on-surface-variant font-bold">
                    {archivalIndex} {"//"} NO. {formattedId}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-caption-label text-caption-label text-primary font-bold">
                      POKÉDEX DOSSIER
                    </span>
                  </div>
                </div>

                {/* Minimal Pokeball Mark */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-8 border-surface-container/40 pointer-events-none select-none"></div>

                {/* Japanese Calligraphy Watermark in Background */}
                <div
                  className="absolute right-4 top-20 pointer-events-none select-none text-primary/8 font-black text-7xl tracking-tighter"
                  style={{ writingMode: "vertical-rl" }}
                >
                  {japaneseName}
                </div>

                {/* Primary Pokemon Art Plate */}
                <div className="relative my-6 flex items-center justify-center min-h-[280px]">
                  <div
                    className="absolute w-56 h-56 rounded-full blur-2xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: primaryConfig.colorHex }}
                  ></div>
                  <img
                    src={isShiny ? getShinyArtwork(pokemonId) : getOfficialArtwork(pokemonId)}
                    alt={pokemon.name}
                    className="relative z-10 w-60 h-60 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Pokemon Audio Trigger & Palette Toggle */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container">
                  <button
                    onClick={playCry}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-caption-label text-caption-label transition-colors ${
                      isPlayingCry
                        ? "bg-secondary text-on-secondary"
                        : "bg-surface-container hover:bg-surface-container-high text-primary"
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlayingCry ? "PLAYING CRY..." : "POKÉMON CRY"}</span>
                    {/* Animated Equalizer Bars */}
                    <div className="flex items-end gap-0.5 h-3 ml-1">
                      <span className={`w-0.5 bg-current rounded-full ${isPlayingCry ? "h-3 animate-pulse" : "h-1"}`}></span>
                      <span className={`w-0.5 bg-current rounded-full ${isPlayingCry ? "h-2 animate-pulse delay-75" : "h-2"}`}></span>
                      <span className={`w-0.5 bg-current rounded-full ${isPlayingCry ? "h-3 animate-pulse delay-150" : "h-1"}`}></span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsShiny(!isShiny)}
                    type="button"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-caption-label text-caption-label border transition-colors ${
                      isShiny
                        ? "bg-amber-50 text-amber-900 border-amber-300 font-bold"
                        : "bg-surface-container text-on-surface-variant border-surface-container hover:bg-surface-container-high"
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isShiny ? "text-amber-500 fill-amber-500" : ""}`} />
                    <span>{isShiny ? "SHINY FORM" : "NORMAL PALETTE"}</span>
                  </button>
                </div>

                {/* Type Badges & Trainer Controls */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-surface-container flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pokemonTypes.map((t) => {
                      const cfg = TYPE_CONFIGS[t] || TYPE_CONFIGS.normal;
                      return (
                        <span
                          key={t}
                          style={{ backgroundColor: cfg.colorHex }}
                          className={`px-2.5 py-1 rounded font-caption-label text-caption-label font-bold uppercase shadow-xs ${cfg.textClass}`}
                        >
                          {cfg.label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFavorite(pokemon.name)}
                      type="button"
                      className={`p-2 rounded-lg border transition-colors ${
                        isBookmarked
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-xs"
                          : "bg-surface-container text-on-surface-variant border-surface-container hover:text-primary"
                      }`}
                      title={isBookmarked ? "Remove Favorite" : "Add to Favorites"}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>

                    <button
                      onClick={() => toggleCaught(pokemon.name)}
                      type="button"
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-caption-label text-caption-label font-bold uppercase border transition-colors ${
                        isCaught
                          ? "bg-[#006b58]/20 text-[#006b58] border-[#006b58]/40 shadow-xs dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40"
                          : "bg-surface-container text-on-surface-variant border-surface-container hover:text-primary"
                      }`}
                      title={isCaught ? "Marked as Caught" : "Log Catch"}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isCaught ? "text-[#006b58] dark:text-emerald-400 fill-current/20" : ""}`} />
                      <span>{isCaught ? "CAUGHT" : "LOG CATCH"}</span>
                    </button>

                    <Link
                      href="/team"
                      className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary border border-surface-container transition-colors"
                      title="Add to Team Lab"
                    >
                      <Users className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Biometric Field Ledger */}
              <div className="bg-surface-container-lowest border border-surface-container rounded-xl p-inset-lg shadow-archival-sm flex flex-col gap-inset-sm">
                <div className="flex items-center justify-between pb-inset-xs border-b border-surface-container">
                  <span className="font-caption-label text-caption-label text-primary font-bold uppercase tracking-wider">
                    BIOMETRIC SPECIFICATIONS
                  </span>
                  <span className="font-caption-label text-caption-label text-on-surface-variant">
                    METRIC STANDARD
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-inset-sm">
                  <div className="p-inset-sm rounded-lg bg-surface-container-low border border-surface-container flex flex-col">
                    <span className="font-caption-label text-caption-label text-on-surface-variant uppercase">
                      HEIGHT (身長)
                    </span>
                    <span className="font-data-metric text-data-metric text-primary font-bold mt-0.5">
                      {heightM} m
                    </span>
                    <span className="font-caption-label text-[11px] text-on-surface-variant">
                      {heightFtIn}
                    </span>
                  </div>

                  <div className="p-inset-sm rounded-lg bg-surface-container-low border border-surface-container flex flex-col">
                    <span className="font-caption-label text-caption-label text-on-surface-variant uppercase">
                      WEIGHT (体重)
                    </span>
                    <span className="font-data-metric text-data-metric text-primary font-bold mt-0.5">
                      {weightKg} kg
                    </span>
                    <span className="font-caption-label text-[11px] text-on-surface-variant">
                      {weightLbs} lbs
                    </span>
                  </div>

                  <div className="p-inset-sm rounded-lg bg-surface-container-low border border-surface-container flex flex-col">
                    <span className="font-caption-label text-caption-label text-on-surface-variant uppercase">
                      CATCH RATE
                    </span>
                    <span className="font-data-metric text-data-metric text-primary font-bold mt-0.5">
                      45
                    </span>
                    <span className="font-caption-label text-[11px] text-on-surface-variant">
                      11.9% at full health
                    </span>
                  </div>

                  <div className="p-inset-sm rounded-lg bg-surface-container-low border border-surface-container flex flex-col">
                    <span className="font-caption-label text-caption-label text-on-surface-variant uppercase">
                      BASE EXPERIENCE
                    </span>
                    <span className="font-data-metric text-data-metric text-primary font-bold mt-0.5">
                      {(pokemon as unknown as { base_experience?: number }).base_experience || 64} EXP
                    </span>
                    <span className="font-caption-label text-[11px] text-on-surface-variant">
                      Medium Slow Growth
                    </span>
                  </div>
                </div>

                <div className="pt-inset-xs border-t border-surface-container grid grid-cols-2 gap-inset-sm text-body-sm">
                  <div>
                    <span className="font-caption-label text-caption-label text-on-surface-variant uppercase block">
                      GENDER DISTRIBUTION
                    </span>
                    <span className="font-index-mono text-[12px] text-primary font-bold mt-0.5 block">
                      87.5% ♂ / 12.5% ♀
                    </span>
                  </div>
                  <div>
                    <span className="font-caption-label text-caption-label text-on-surface-variant uppercase block">
                      EGG CLASSIFICATION
                    </span>
                    <span className="font-index-mono text-[12px] text-primary font-bold mt-0.5 block">
                      Monster, Grass
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Editorial Telemetry & Analysis (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-inset-md">
              {/* Pokédex Editorial Lore Book */}
              <div className="bg-surface-container-lowest p-inset-lg rounded-xl shadow-archival-sm border border-surface-container flex flex-col gap-inset-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-inset-xs border-b border-surface-container">
                  <div className="flex items-center gap-inset-xs">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      FIELD OBSERVATIONS
                    </span>
                    <span className="font-caption-label text-caption-label text-secondary bg-secondary/10 px-2 py-0.5 rounded font-bold uppercase">
                      POKÉDEX LORE ({availableLoreEntries.length} EDITIONS)
                    </span>
                  </div>

                  {/* Game Edition Selector Dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor="loreEditionSelect" className="font-caption-label text-[11px] text-on-surface-variant font-bold uppercase shrink-0">
                      EDITION:
                    </label>
                    <select
                      id="loreEditionSelect"
                      value={activeLore?.version || ""}
                      onChange={(e) => setSelectedLoreVersion(e.target.value)}
                      className="bg-surface-container-low border border-surface-container text-on-surface font-caption-label text-[12px] font-bold px-2.5 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-secondary transition-all cursor-pointer"
                    >
                      {availableLoreEntries.map((entry) => (
                        <option key={entry.version} value={entry.version}>
                          {entry.label} ({entry.gen})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vintage Typewriter Text Container */}
                <div className="bg-surface-container-low/40 p-inset-md rounded-lg font-body-md text-body-md text-on-surface leading-relaxed border-l-2 border-secondary">
                  <p className="italic">
                    &ldquo;{activeLore?.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between mt-inset-xs pt-inset-xs border-t border-surface-container text-caption-label font-caption-label text-on-surface-variant flex-wrap gap-1">
                    <span>ARCHIVAL REGISTRATION: POKÉMON {activeLore?.label?.toUpperCase()} ({activeLore?.year})</span>
                    <span className="text-secondary font-bold font-index-mono uppercase">PROF. OAK ARCHIVE // {activeLore?.gen}</span>
                  </div>
                </div>

                {/* Natural Habitat & Abilities Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-inset-sm pt-inset-xs">
                  <div className="bg-surface-container-low p-inset-sm rounded-lg border border-surface-container flex flex-col">
                    <span className="font-caption-label text-caption-label text-on-surface-variant uppercase font-bold">
                      NATURAL ABILITY // 固有能力
                    </span>
                    <span className="font-headline-sm text-body-md font-bold text-on-surface mt-0.5 capitalize">
                      {primaryAbility.name.replace(/-/g, " ")}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-normal">
                      {primaryAbility.description}
                    </p>
                  </div>

                  <div className="bg-surface-container-low p-inset-sm rounded-lg border border-surface-container flex flex-col">
                    <span className="font-caption-label text-caption-label text-on-surface-variant uppercase font-bold">
                      HIDDEN POTENTIAL // 潜在能力
                    </span>
                    <span className="font-headline-sm text-body-md font-bold text-secondary mt-0.5 capitalize">
                      {hiddenAbility.name.replace(/-/g, " ")}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-normal">
                      {hiddenAbility.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Combat Diagnostics & Calibrated Stat Bars */}
              <div className="bg-surface-container-lowest p-inset-lg rounded-xl shadow-archival-sm border border-surface-container flex flex-col gap-inset-md">
                <div className="flex items-center justify-between pb-inset-xs border-b border-surface-container">
                  <div className="flex items-center gap-inset-xs">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      BASE STAT MATRIX
                    </span>
                    <span className="font-caption-label text-caption-label bg-surface-container-high px-2 py-0.5 rounded text-secondary font-bold">
                      BST: {bst}
                    </span>
                  </div>
                  <span className="font-caption-label text-caption-label text-on-surface-variant">
                    CALIBRATED STANDARD (MAX 255)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop items-center">
                  {/* Left: 6 Stat Bars (7 Cols) */}
                  <div className="md:col-span-7 flex flex-col gap-3 font-caption-label">
                    {[
                      { label: "HP", val: hp, max: 255, color: "bg-[#48d0b0]", range: "200 – 294" },
                      { label: "ATTACK", val: atk, max: 255, color: "bg-[#f08030]", range: "92 – 216" },
                      { label: "DEFENSE", val: def, max: 255, color: "bg-[#f8d030]", range: "92 – 216" },
                      { label: "SP. ATK", val: spa, max: 255, color: "bg-[#6890f0]", range: "121 – 251" },
                      { label: "SP. DEF", val: spd, max: 255, color: "bg-[#78c850]", range: "121 – 251" },
                      { label: "SPEED", val: spe, max: 255, color: "bg-[#f85888]", range: "85 – 207" },
                    ].map((st) => (
                      <div key={st.label} className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-3 sm:col-span-2 text-caption-label text-on-surface-variant font-bold">
                          {st.label}
                        </span>
                        <span className="col-span-2 sm:col-span-1 text-index-mono text-index-mono text-right font-bold text-on-surface">
                          {st.val}
                        </span>
                        <div className="col-span-5 sm:col-span-7 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${st.color}`}
                            style={{ width: `${(st.val / st.max) * 100}%` }}
                          ></div>
                        </div>
                        <span className="col-span-2 text-right text-caption-label text-on-surface-variant hidden sm:inline">
                          {st.range}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Right: SVG Radar Chart (5 Cols) */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-2">
                    <svg className="w-48 h-48 drop-shadow-sm" viewBox="0 0 200 200">
                      {/* Grid webs */}
                      <polygon
                        points="100,20 170,60 170,140 100,180 30,140 30,60"
                        fill="none"
                        stroke="#e2e2e2"
                        strokeWidth="1"
                      />
                      <polygon
                        points="100,45 149,73 149,127 100,155 51,127 51,73"
                        fill="none"
                        stroke="#e2e2e2"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <polygon
                        points="100,70 128,86 128,114 100,130 72,114 72,86"
                        fill="none"
                        stroke="#e2e2e2"
                        strokeWidth="1"
                      />

                      {/* Axes */}
                      <line x1="100" y1="20" x2="100" y2="180" stroke="#c8c5cb" strokeWidth="0.75" />
                      <line x1="30" y1="60" x2="170" y2="140" stroke="#c8c5cb" strokeWidth="0.75" />
                      <line x1="30" y1="140" x2="170" y2="60" stroke="#c8c5cb" strokeWidth="0.75" />

                      {/* Polygon fill */}
                      <polygon
                        points={radarData.points}
                        fill="rgba(0, 107, 88, 0.2)"
                        stroke="#006b58"
                        strokeWidth="2"
                      />

                      {/* Labels */}
                      <text x="100" y="14" textAnchor="middle" className="text-[9px] font-bold fill-current font-mono">HP</text>
                      <text x="180" y="60" textAnchor="start" className="text-[9px] font-bold fill-current font-mono">ATK</text>
                      <text x="180" y="144" textAnchor="start" className="text-[9px] font-bold fill-current font-mono">DEF</text>
                      <text x="100" y="194" textAnchor="middle" className="text-[9px] font-bold fill-current font-mono">SPE</text>
                      <text x="20" y="144" textAnchor="end" className="text-[9px] font-bold fill-current font-mono">SP.DEF</text>
                      <text x="20" y="60" textAnchor="end" className="text-[9px] font-bold fill-current font-mono">SP.ATK</text>
                    </svg>
                    <span className="font-caption-label text-caption-label text-on-surface-variant mt-1">
                      RADIAL COGNITIVE BALANCE
                    </span>
                  </div>
                </div>
              </div>

              {/* Type Matchup Tactical Table */}
              <div className="bg-surface-container-lowest p-inset-lg rounded-xl shadow-archival-sm border border-surface-container flex flex-col gap-inset-sm">
                <div className="flex items-center justify-between pb-inset-xs border-b border-surface-container">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    DEFENSIVE TYPE COMPATIBILITY
                  </span>
                  <span className="font-caption-label text-caption-label text-on-surface-variant font-bold">
                    {pokemonTypes.length > 1 ? "DUAL AFFINITY" : "SINGLE AFFINITY"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-inset-sm">
                  {/* Vulnerabilities */}
                  <div className="p-inset-sm bg-surface-container-low rounded-lg border border-surface-container flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-error font-caption-label text-caption-label font-bold uppercase">
                      <ShieldAlert className="w-4 h-4" />
                      <span>VULNERABILITIES (2x / 4x)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {defensiveMatchups.weaknesses.length > 0 ? (
                        defensiveMatchups.weaknesses.map((item) => {
                          const cfg = TYPE_CONFIGS[item.type] || TYPE_CONFIGS.normal;
                          return (
                            <span
                              key={item.type}
                              style={{ backgroundColor: cfg.colorHex }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption-label text-[11px] font-bold shadow-2xs ${cfg.textClass}`}
                            >
                              <span className="uppercase tracking-wider">{cfg.label}</span>
                              <span className="bg-black/25 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                                {item.multiplier}x
                              </span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="font-caption-label text-[11px] text-on-surface-variant italic">
                          No special vulnerabilities
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Resistances & Immunities */}
                  <div className="p-inset-sm bg-surface-container-low rounded-lg border border-surface-container flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-secondary font-caption-label text-caption-label font-bold uppercase">
                      <ShieldCheck className="w-4 h-4" />
                      <span>RESISTANCES & IMMUNITIES</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {defensiveMatchups.resistances.length > 0 ? (
                        defensiveMatchups.resistances.map((item) => {
                          const cfg = TYPE_CONFIGS[item.type] || TYPE_CONFIGS.normal;
                          const multLabel = item.multiplier === 0 ? "0x" : `${item.multiplier}x`;
                          return (
                            <span
                              key={item.type}
                              style={{ backgroundColor: cfg.colorHex }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption-label text-[11px] font-bold shadow-2xs ${cfg.textClass}`}
                            >
                              <span className="uppercase tracking-wider">{cfg.label}</span>
                              <span className="bg-black/25 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                                {multLabel}
                              </span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="font-caption-label text-[11px] text-on-surface-variant italic">
                          Standard neutral effectiveness
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Branching Evolution Lineage Spread */}
        <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-inset-md">
          <div className="max-w-7xl mx-auto bg-surface-container-lowest p-inset-lg rounded-xl shadow-archival-sm border border-surface-container flex flex-col gap-inset-md">
            <div className="flex items-center justify-between pb-inset-xs border-b border-surface-container">
              <div className="flex items-center gap-inset-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  EVOLUTIONARY MORPHOLOGY
                </span>
                <span className="font-caption-label text-caption-label text-secondary bg-secondary/10 px-2 py-0.5 rounded font-bold uppercase">
                  TAXONOMIC PROGRESSION
                </span>
              </div>
              <span className="font-caption-label text-caption-label text-on-surface-variant font-mono">
                GENETIC LINEAGE
              </span>
            </div>

            {/* Robust Horizontal Evolution Flow */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4">
              {evoChain && evoChain.length > 0 ? (
                evoChain.map((stage, idx) => {
                  const isCurrent = stage.name.toLowerCase() === pokemon.name.toLowerCase();
                  const stageNum = String(idx + 1).padStart(2, "0");

                  // Trigger condition for transitioning to next stage
                  const nextStage = evoChain[idx + 1];
                  const details = nextStage?.evolution_details?.[0];
                  let triggerLabel = "Level Up";
                  if (details) {
                    if (details.min_level) {
                      triggerLabel = `LV. ${details.min_level}`;
                    } else if (details.item?.name) {
                      triggerLabel = details.item.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    } else if (details.trigger?.name === "trade") {
                      triggerLabel = details.held_item?.name
                        ? `Trade (${details.held_item.name.replace(/-/g, " ")})`
                        : "Trade";
                    } else if (details.min_happiness) {
                      triggerLabel = "Friendship";
                    } else if (details.known_move?.name) {
                      triggerLabel = `Knows ${details.known_move.name.replace(/-/g, " ")}`;
                    } else if (details.time_of_day) {
                      triggerLabel = `Evolve (${details.time_of_day})`;
                    } else if (details.location?.name) {
                      triggerLabel = "Special Area";
                    }
                  }

                  return (
                    <React.Fragment key={stage.name}>
                      <Link
                        href={`/pokemon/${stage.name.toLowerCase()}`}
                        className={`w-44 sm:w-52 bg-surface-container-low/70 p-4 rounded-xl flex flex-col items-center text-center relative border transition-all hover:scale-105 ${
                          isCurrent
                            ? "border-secondary ring-2 ring-secondary/30 bg-surface-container-lowest shadow-sm"
                            : "border-surface-container hover:border-outline hover:shadow-xs"
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="font-index-mono text-[11px] text-on-surface-variant font-bold">
                            0{stageNum}
                          </span>
                          {isCurrent && (
                            <span className="bg-secondary text-white text-[10px] font-caption-label px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <img
                          src={getOfficialArtwork(stage.id)}
                          alt={stage.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-contain my-2 drop-shadow-sm"
                        />

                        <span className="font-headline-sm text-sm font-bold text-on-surface capitalize">
                          {stage.name}
                        </span>
                        <span className="font-subhead-kana text-[11px] text-on-surface-variant">
                          {getJapaneseName(stage.id, stage.name)}
                        </span>

                        {/* Stage Types */}
                        {stage.types && stage.types.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {stage.types.map((tName: string) => {
                              const cfg = TYPE_CONFIGS[tName.toLowerCase()] || TYPE_CONFIGS.normal;
                              return (
                                <span
                                  key={tName}
                                  style={{ backgroundColor: cfg.colorHex }}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-caption-label font-bold uppercase ${cfg.textClass}`}
                                >
                                  {cfg.label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </Link>

                      {/* Transition Connector to Next Stage */}
                      {idx < evoChain.length - 1 && (
                        <div className="flex flex-col items-center justify-center gap-1 text-on-surface-variant px-1 sm:px-2 shrink-0">
                          <span className="font-caption-label text-[10px] uppercase font-bold bg-surface-container px-2 py-0.5 rounded-full text-secondary whitespace-nowrap border border-surface-container-high shadow-2xs">
                            {triggerLabel}
                          </span>
                          <span className="material-symbols-outlined text-[24px] text-secondary">
                            trending_flat
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                /* Single Stage Pokémon */
                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center text-center border border-surface-container w-52">
                  <span className="font-index-mono text-[11px] text-on-surface-variant font-bold">01</span>
                  <img src={getOfficialArtwork(pokemonId)} alt={pokemon.name} className="w-24 h-24 object-contain my-2" />
                  <span className="font-headline-sm text-sm font-bold text-on-surface capitalize">{pokemon.name}</span>
                  <span className="font-caption-label text-[10px] text-secondary font-bold uppercase mt-2 bg-secondary/10 px-2 py-0.5 rounded">
                    Single Stage // Does Not Evolve
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Consolidated Movepool Engine (Tabbed & Filterable Table) */}
        <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-inset-md pb-16">
          <div className="max-w-7xl mx-auto bg-surface-container-lowest p-inset-lg rounded-xl shadow-archival-sm border border-surface-container flex flex-col gap-inset-md">
            {/* Table Header & Dual Filter Bar */}
            <div className="flex flex-col gap-3 pb-inset-xs border-b border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-inset-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    TACTICAL MOVEPOOL REGISTRY
                  </span>
                  <span className="font-caption-label text-caption-label text-secondary bg-secondary/10 px-2 py-0.5 rounded font-bold uppercase">
                    {processedMoves.length} TECHNIQUES
                  </span>
                </div>

                {/* Game Version Group Selector Dropdown / Pill */}
                <div className="flex items-center gap-2">
                  <label htmlFor="moveGameSelect" className="font-caption-label text-[11px] text-on-surface-variant font-bold uppercase shrink-0">
                    GAME:
                  </label>
                  <select
                    id="moveGameSelect"
                    value={activeGameVersion}
                    onChange={(e) => setSelectedGameVersion(e.target.value)}
                    className="bg-surface-container-low border border-surface-container text-on-surface font-caption-label text-[12px] font-bold px-2.5 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-secondary transition-all"
                  >
                    <option value="all">All Games (Deduplicated)</option>
                    {availableGameGroups.map((vg) => {
                      const meta = VERSION_GROUP_LABELS[vg] || {
                        label: vg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                        gen: "ARCHIVE",
                      };
                      return (
                        <option key={vg} value={vg}>
                          {meta.label} ({meta.gen})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Learn Method Action Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-1 rounded-lg">
                {[
                  { id: "all", label: "ALL MOVES" },
                  { id: "level", label: "LEVEL-UP" },
                  { id: "tm", label: "TM / MACHINE" },
                  { id: "egg", label: "EGG MOVES" },
                  { id: "tutor", label: "TUTOR" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMoveFilter(f.id)}
                    type="button"
                    className={`px-3 py-1 rounded font-caption-label text-[11px] font-bold transition-all snappy-btn ${
                      moveFilter === f.id
                        ? "bg-[#171b26] text-white shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High Density Clean Movepool Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container font-caption-label text-caption-label text-on-surface-variant uppercase">
                    <th className="py-2.5 px-4">Move Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Affinity</th>
                    <th className="py-2.5 px-4 text-center">Power</th>
                    <th className="py-2.5 px-4 text-center">Accuracy</th>
                    <th className="py-2.5 px-4 text-center">PP</th>
                    <th className="py-2.5 px-4 text-right">Method / Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {processedMoves.length > 0 ? (
                    processedMoves.map((m) => {
                      const level = m.level_learned_at || 1;
                      const method = m.method ? m.method.toUpperCase() : "NATURAL";
                      const moveType = (m.type || "normal").toLowerCase();
                      const typeCfg = TYPE_CONFIGS[moveType] || TYPE_CONFIGS.normal;
                      const category = (m.damage_class || m.category || "status").toLowerCase();

                      const categoryBadge =
                        category === "physical"
                          ? { label: "PHYSICAL", cls: "bg-amber-100 text-amber-900 border-amber-300" }
                          : category === "special"
                          ? { label: "SPECIAL", cls: "bg-sky-100 text-sky-900 border-sky-300" }
                          : { label: "STATUS", cls: "bg-slate-100 text-slate-700 border-slate-300" };

                      return (
                        <tr key={m.name} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-body-md text-on-surface font-bold capitalize">
                                {m.name.replace(/-/g, " ")}
                              </span>
                              {m.shortDescription && (
                                <span className="font-body-sm text-[11px] text-on-surface-variant line-clamp-1">
                                  {m.shortDescription}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded font-caption-label text-[10px] font-bold border ${categoryBadge.cls}`}>
                              {categoryBadge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              style={{ backgroundColor: typeCfg.colorHex }}
                              className={`px-2 py-0.5 rounded font-caption-label text-[10px] uppercase font-bold ${typeCfg.textClass}`}
                            >
                              {typeCfg.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-index-mono text-index-mono font-bold text-on-surface">
                            {m.power ?? "—"}
                          </td>
                          <td className="py-2.5 px-4 text-center font-index-mono text-index-mono text-on-surface">
                            {m.accuracy ? `${m.accuracy}%` : "—"}
                          </td>
                          <td className="py-2.5 px-4 text-center font-index-mono text-index-mono text-on-surface">
                            {m.pp ?? "—"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-caption-label text-caption-label font-bold">
                            {m.method === "level-up" ? (
                              <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded">
                                LV. {level}
                              </span>
                            ) : (
                              <span className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded">
                                {method}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant font-body-sm">
                        No moves match the selected filter criteria for this game edition.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Archival Ledger Metadata Footer */}
            <div className="pt-inset-xs border-t border-surface-container flex flex-col sm:flex-row items-center justify-between text-caption-label font-caption-label text-on-surface-variant gap-2">
              <span>SHOWING {processedMoves.length} DEDUPLICATED COMBAT TECHNIQUES</span>
              <span className="text-secondary font-bold font-index-mono uppercase">AUTHENTIC METRICS VIA LOCAL LIB-SQL DATABASE</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}