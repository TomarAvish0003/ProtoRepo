"use client";
import { useState } from "react";
import Link from "next/link";

const TYPE_COLORS: Record<string, string> = {
  dragon: "#036DC5",
  poison: "#923FCC",
  normal: "#9FA29F",
  fighting: "#FF8100",
  flying: "#82BAEF",
  ground: "#92501B",
  rock: "#B0A981",
  bug: "#92A212",
  ghost: "#703F70",
  steel: "#5FA2BA",
  fire: "#E72324",
  water: "#2481EF",
  grass: "#3DA224",
  electric: "#FAC100",
  psychic: "#EF3F7A",
  ice: "#3DD9FF",
  dark: "#4F3F3D",
  fairy: "#EF70EF",
};

interface PokemonCardProps {
  id: number;
  name: string;
  sprite?: string | null;
  types: string[];
}

const FALLBACK_SPRITE = "/fallback-pokemon.png"; // Place a fallback image in /public

export default function PokemonCard({ id, name, sprite, types }: PokemonCardProps) {
  const [hovered, setHovered] = useState(false);
  const typeColor = TYPE_COLORS[types[0]] ?? "#888";
  const typeBgUrl = `/icons/${types[0]}.svg`;
  const validSprite =
    sprite && typeof sprite === "string" && sprite.trim() !== ""
      ? sprite
      : FALLBACK_SPRITE;

  return (
    <Link
      href={`/pokemon/${name.toLowerCase()}`}
      className="block focus:outline-none"
      tabIndex={0}
      aria-label={`View details for ${name}`}
      scroll={true}
    >
      <div
        className="relative flex flex-col items-center justify-center min-h-[16rem] w-56 p-4 overflow-hidden"
        style={{
          border: `3px solid ${typeColor}`,
          borderRadius: "1.5rem",
          background: "rgba(24,24,27,0.65)",
          boxShadow: hovered
            ? `0 8px 32px 0 ${typeColor}99, 0 2px 8px 0 #0002`
            : `0 4px 16px 0 ${typeColor}33, 0 2px 8px 0 #0002`,
          transition: "box-shadow 0.25s, transform 0.25s",
          cursor: "pointer",
          transform: hovered ? "scale(1.025)" : "scale(1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={-1}
      >
        {/* Type SVG background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `url(${typeBgUrl}) center/80% no-repeat`,
            opacity: 0.13,
          }}
        />

        {/* Glassy overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl z-10"
          style={{
            background:
              "linear-gradient(135deg,rgba(255,255,255,0.10) 60%,rgba(255,255,255,0.03) 100%)",
            backdropFilter: "blur(6px)",
          }}
        />

        {/* Card content */}
        <div className="relative z-20 flex flex-col items-center w-full">
          {/* Pokédex number */}
          <span
            className="absolute top-26 right-16 text-sm font-bold bg-black/40 text-white px-3 py-1 rounded-full backdrop-blur-sm"
            style={{
              border: `1.5px solid ${typeColor}`,
              letterSpacing: "0.05em",
            }}
          >
            #{id}
          </span>

          {/* Sprite */}
          <div className="relative w-28 h-28 mb-3 mt-2">
            <img
              src={validSprite}
              alt={name}
              width={112}
              height={112}
              className="object-contain"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          
          {/* Name */}
          <h2
            className="text-xl font-bold capitalize text-center mb-2"
            style={{
              color: "#fff",
              fontFamily: "'Fredoka', sans-serif",
              textShadow: "0 2px 8px #0008",
              letterSpacing: "0.02em",
            }}
          >
            {name}
          </h2>

          {/* Type badge(s) */}
          <div className="flex flex-wrap justify-center gap-2 mb-1">
            {types.map((type) => (
              <span
                key={type}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: TYPE_COLORS[type] ?? "#eee",
                  color: "#fff",
                  boxShadow: `0 2px 8px ${TYPE_COLORS[type] ?? "#eee"}44`,
                }}
              >
                <img
                  src={`/icons/${type}.svg`}
                  alt={type}
                  width={16}
                  height={16}
                  className="mr-1"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
