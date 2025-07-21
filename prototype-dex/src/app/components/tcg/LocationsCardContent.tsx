import { useState } from "react";
import { motion } from "framer-motion";
import { Press_Start_2P } from "next/font/google";
import { Fredoka } from "next/font/google";

// Font imports
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-retro",
});
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-fredoka",
});

const TYPE_COLORS: Record<string, string> = {
  normal: "#9FA29F", fire: "#E72324", water: "#2481EF", electric: "#FAC100",
  grass: "#3DA224", ice: "#3DD9FF", fighting: "#FF8100", poison: "#923FCC",
  ground: "#92501B", flying: "#82BAEF", psychic: "#EF3F7A", bug: "#92A212",
  rock: "#B0A981", ghost: "#703F70", dragon: "#036DC5", dark: "#4F3F3D",
  steel: "#5FA2BA", fairy: "#EF70EF",
};

interface SimpleEncounter {
  location: string;
  version: string;
  method: string;
  min_level?: number;
  max_level?: number;
  rate?: number;
}

interface LocationsCardContentProps {
  encounters: SimpleEncounter[];
  availableGames: string[];
  primaryType: string;
}

// Utility to humanize strings
function humanize(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export default function LocationsCardContent({
  encounters,
  availableGames=[],
  primaryType,
}: LocationsCardContentProps) {
  const color = TYPE_COLORS[primaryType?.toLowerCase()] ?? "#fac100";
  const [selectedGame, setSelectedGame] = useState(
    availableGames.length ? availableGames[0].toLowerCase() : ""
  );

  const filteredEncounters = encounters.filter(
    (e) => e.version && e.version.toLowerCase() === selectedGame
  );

  return (
    <div
      className={`flex flex-col gap-10 items-center w-full ${pressStart2P.variable} ${fredoka.variable}`}
    >
      <h2
        className="text-3xl mb-4 tracking-widest"
        style={{
          fontFamily: pressStart2P.style.fontFamily,
          color: "hsl(var(--primary))",
          letterSpacing: "0.07em",
          textShadow: `0 2px 18px ${color}33`,
        }}
      >
        Locations
      </h2>

      {/* Game Selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {availableGames.map((game) => (
          <button
            key={game}
            style={{
              fontFamily: pressStart2P.style.fontFamily,
              letterSpacing: "0.025em",
              borderColor: color,
              background: game.toLowerCase() === selectedGame
                ? color
                : "var(--muted)",
              color: game.toLowerCase() === selectedGame
                ? "#fff"
                : "hsl(var(--muted-foreground))",
              boxShadow: game.toLowerCase() === selectedGame
                ? `0 0 0 2px ${color}cc`
                : undefined,
              padding: "0.42rem 0.95rem",
              fontSize: "0.91rem",
              minWidth: 58,
              fontWeight: 600,
            }}
            className={`rounded-full border-2 uppercase transition-colors duration-150 ${
              game.toLowerCase() === selectedGame
                ? "shadow"
                : "hover:bg-primary/15"
            }`}
            onClick={() => setSelectedGame(game.toLowerCase())}
          >
            {humanize(game)}
          </button>
        ))}
      </div>

      {/* Location List */}
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.38 }}
      >
        {filteredEncounters.length === 0 ? (
          <div
            className="text-center"
            style={{
              fontFamily: pressStart2P.style.fontFamily,
              color: "hsl(var(--muted-foreground))",
              marginTop: "2.2rem",
              fontSize: "1.12rem",
              opacity: 0.89,
            }}
          >
            No locations for this game.
          </div>
        ) : (
          <ul className="flex flex-col gap-7">
            {filteredEncounters.map((loc, idx) => (
              <motion.li
                initial={{ opacity: 0, scale: 0.985, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  duration: 0.37,
                  delay: idx * 0.04,
                  bounce: 0.18,
                }}
                key={idx}
                className="glass-card flex flex-col justify-center items-center px-12 py-8 border-l-8"
                style={{
                  borderColor: color,
                  background: `linear-gradient(110deg, ${color}1f 65%, #fff4 99%)`,
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  boxShadow: `0 10px 60px 0 ${color}18, 0 15px 46px 0 #bbbbcf09`,
                  borderRadius: "2.1rem",
                  minHeight: 148,
                  marginBottom: 0,
                }}
              >
                <span
                  className="text-2xl font-bold mb-2 text-center"
                  style={{
                    fontFamily: fredoka.style.fontFamily,
                    letterSpacing: "0.017em",
                    color: "hsl(var(--foreground))",
                    textShadow: "0 2px 12px #eaeaea24"
                  }}
                >
                  {loc.location}
                </span>
                <span
                  className="px-5 py-1 mb-2 rounded-full font-semibold capitalize tracking-wide"
                  style={{
                    background: color,
                    fontFamily: fredoka.style.fontFamily,
                    color: "#f9fafb",
                    fontSize: "1.13rem",
                    boxShadow: `0 3px 12px ${color}22`,
                    letterSpacing: "0.05em",
                  }}
                >
                  {loc.method}
                </span>
                <div
                  className="flex flex-row gap-12 mt-1 text-lg font-medium"
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    fontFamily: fredoka.style.fontFamily,
                  }}
                >
                  {loc.min_level != null && <span>Min Lv: {loc.min_level}</span>}
                  {loc.max_level != null && <span>Max Lv: {loc.max_level}</span>}
                  {loc.rate != null && <span>Rate: {loc.rate}%</span>}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
