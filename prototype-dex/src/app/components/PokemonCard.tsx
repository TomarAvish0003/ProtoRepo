"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TYPE_CONFIGS,
  getJapaneseName,
  formatPokedexNumber,
  formatArchivalIndex,
  getOfficialArtwork,
  getPokemonCryUrl,
} from "@/app/utils/pokemonDataHelpers";
import { useAuth } from "@/app/context/AuthContext";
import { Bookmark, CheckCircle2, Volume2, Activity } from "lucide-react";

export interface PokemonCardStats {
  hp?: number;
  atk?: number;
  def?: number;
  spa?: number;
  spd?: number;
  spe?: number;
  bst?: number;
}

interface PokemonCardProps {
  id: number;
  name: string;
  sprite?: string | null;
  types: string[];
  stats?: PokemonCardStats;
  isCaught?: boolean;
  isFavorite?: boolean;
  height?: number; // decimeters
  weight?: number; // hectograms
}

export default function PokemonCard({
  id,
  name,
  sprite,
  types,
  stats,
  isCaught: propIsCaught,
  isFavorite: propIsFavorite,
  height,
  weight,
}: PokemonCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const { isFavorite: checkFavorite, isCaught: checkCaught, toggleFavorite, toggleCaught } = useAuth();
  const isCardFavorite = propIsFavorite !== undefined ? propIsFavorite : checkFavorite(name);
  const isCardCaught = propIsCaught !== undefined ? propIsCaught : checkCaught(name);

  const primaryType = types[0]?.toLowerCase() || "normal";
  const primaryConfig = TYPE_CONFIGS[primaryType] || TYPE_CONFIGS.normal;
  const japaneseName = getJapaneseName(id, name);
  const formattedId = formatPokedexNumber(id);
  const archivalIndex = formatArchivalIndex(id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(name);
  };

  const handleToggleCaught = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCaught(name);
  };

  // Artwork URL
  const artworkUrl = !imageError ? getOfficialArtwork(id, sprite) : (sprite || "/detective-pikachu.jpg");

  // Calculated BST
  const bst = stats?.bst ?? (
    stats && (stats.hp !== undefined || stats.atk !== undefined)
      ? ((stats.hp || 0) + (stats.atk || 0) + (stats.def || 0) + (stats.spa || 0) + (stats.spd || 0) + (stats.spe || 0))
      : undefined
  );

  // Formatted Metric
  const formattedHeight = height !== undefined && height !== null ? `${(height / 10).toFixed(1)}m` : null;
  const formattedWeight = weight !== undefined && weight !== null ? `${(weight / 10).toFixed(1)}kg` : null;

  const handlePlayCry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsPlayingAudio(true);
      const audio = new Audio(getPokemonCryUrl(id));
      audio.play().catch(() => {});
      audio.onended = () => setIsPlayingAudio(false);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  return (
    <article
      className={`pokemon-card pokemon-card-interactive group relative bg-charcoal-surface hover:bg-slate-panel rounded-xl p-3 sm:p-3.5 border transition-all duration-200 flex flex-col justify-between h-full ${
        isNavigating
          ? "border-primary shadow-[0_0_16px_rgba(255,51,85,0.35)] ring-1 ring-primary/50 pointer-events-none"
          : "border-border-crisp hover:border-primary shadow-xs hover:shadow-lg dark:shadow-lg dark:hover:shadow-[0_8px_24px_rgba(255,51,85,0.15)]"
      }`}
      style={{
        ["--type-color" as string]: primaryConfig.colorHex,
      }}
    >
      {/* Top Meta Row - Actions decoupled from anchor to ensure valid HTML and accessible focus states */}
      <div className="flex items-center justify-between gap-1 pb-2 border-b border-border-crisp relative z-10">
        <Link
          href={`/pokemon/${name.toLowerCase()}`}
          onClick={() => setIsNavigating(true)}
          className="flex items-center gap-1.5 focus:outline-none hover:opacity-85 transition-opacity"
        >
          <span className="font-index-mono text-[13px] font-extrabold text-primary tracking-tight">
            {formattedId}
          </span>
          <span className="font-subhead-kana text-[11px] text-on-surface-variant">
            {japaneseName}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Quick Favorite toggle button */}
          <button
            onClick={handleToggleFavorite}
            aria-label={isCardFavorite ? `Remove ${name} from Favorites` : `Add ${name} to Favorites`}
            className={`snappy-btn w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              isCardFavorite
                ? "bg-amber-500/20 text-amber-500 dark:text-amber-400 hover:bg-amber-500/30 shadow-2xs"
                : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-amber-500 dark:hover:text-amber-400"
            }`}
            title={isCardFavorite ? "Remove from Favorites" : "Add to Favorites"}
            type="button"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isCardFavorite ? "fill-amber-500 dark:fill-amber-400 text-amber-500 dark:fill-amber-400" : ""}`} />
          </button>

          {/* Quick Caught toggle badge/button */}
          <button
            onClick={handleToggleCaught}
            aria-label={isCardCaught ? `Marked ${name} as Caught` : `Log ${name} as Caught`}
            className={`snappy-btn h-6 px-1.5 rounded-md flex items-center gap-1 transition-all text-[10px] font-caption-label font-bold ${
              isCardCaught
                ? "bg-secondary/15 text-secondary hover:bg-secondary/25 border border-secondary/30"
                : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-secondary"
            }`}
            title={isCardCaught ? "Marked as Caught (click to toggle)" : "Log as Caught"}
            type="button"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCardCaught ? "text-secondary fill-secondary/20" : ""}`} />
            {isCardCaught && <span>CAUGHT</span>}
          </button>

          {/* Quick Audio Cry Preview button directly on card */}
          <button
            onClick={handlePlayCry}
            aria-label={`Play ${name} cry audio`}
            className={`snappy-btn w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              isPlayingAudio
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
            }`}
            title="Play Pokémon Cry"
            type="button"
          >
            {isPlayingAudio ? (
              <Activity className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Pokémon Entry Link (Artwork, Name, BST, Types) */}
      <Link
        href={`/pokemon/${name.toLowerCase()}`}
        onClick={() => setIsNavigating(true)}
        className="block focus:outline-none flex-1 flex flex-col justify-between"
        aria-label={`View Pokédex entry for ${name}`}
      >
        {/* Pokemon Illustration Well with Type-Colored Atmosphere */}
        <div
          className="relative w-full h-40 my-2.5 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 border"
          style={{
            backgroundColor: primaryConfig.softBg,
            borderColor: primaryConfig.borderHex,
          }}
        >
          {/* Subtle Radial Glow in primary type color */}
          <div
            className="absolute w-32 h-32 rounded-full blur-xl opacity-60 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
            style={{ backgroundColor: primaryConfig.colorHex }}
          ></div>

          {/* Official Artwork with explicit dimensions for layout stability */}
          <Image
            src={artworkUrl}
            alt={name}
            width={128}
            height={128}
            unoptimized={imageError || artworkUrl.startsWith("/")}
            onError={() => setImageError(true)}
            className="relative z-10 max-h-32 object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-[0_6px_14px_rgba(0,0,0,0.14)]"
            loading="lazy"
          />

          {/* Archival Corner Stamp */}
          <span className="absolute bottom-1 right-2 font-index-mono text-[9px] text-on-surface-variant/60 tracking-wider">
            {archivalIndex}
          </span>

          {/* Real-time Navigation Loading Overlay */}
          {isNavigating && (
            <div className="absolute inset-0 bg-charcoal-surface/85 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-1.5 text-primary">
              <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-[9px] font-extrabold tracking-widest text-primary">
                OPENING DOSSIER...
              </span>
            </div>
          )}
        </div>

        {/* Card Content Footer */}
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex items-baseline justify-between gap-1">
            <h2 className="font-headline-sm text-[16px] text-on-surface group-hover:text-secondary transition-colors capitalize font-bold truncate">
              {name.replace(/-/g, " ")}
            </h2>
            {bst !== undefined && (
              <span className="font-caption-label text-[10px] text-secondary font-bold bg-surface-container-low border border-border-crisp px-1.5 py-0.5 rounded shrink-0">
                BST {bst}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-0.5 flex-wrap gap-1">
            {/* Standard Authentic Pokémon Type Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {types.map((t) => {
                const config = TYPE_CONFIGS[t.toLowerCase()] || TYPE_CONFIGS.normal;
                return (
                  <span
                    key={t}
                    style={{ backgroundColor: config.colorHex }}
                    className={`px-2 py-0.5 rounded text-[10px] font-caption-label uppercase font-bold tracking-wide shadow-2xs ${config.textClass}`}
                  >
                    {config.label}
                  </span>
                );
              })}
            </div>

            {formattedHeight || formattedWeight ? (
              <span className="font-caption-label text-[10px] text-on-surface-variant font-mono">
                {formattedHeight || "—"} / {formattedWeight || "—"}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
