"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import RadarChart from "../RadarChart";
import EvolutionCardContent from "./EvolutionCardContent";
import MovesCardContent from "./MovesCardContent";
import LocationsCardContent from "./LocationsCardContent";
import Sidebar from "../[nameorid]page/Sidebar";
import {
  Pokemon,
  EvolutionStage,
  Move,
  Ability,
  FlavorTextEntry,
  PokemonEncounter,
  PokemonForm,
} from "@/app/utils/types";
import { Press_Start_2P } from "next/font/google";
import { Fredoka } from "next/font/google";

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
  normal: "#9FA29F",
  fire: "#E72324",
  water: "#2481EF",
  electric: "#FAC100",
  grass: "#3DA224",
  ice: "#3DD9FF",
  fighting: "#FF8100",
  poison: "#923FCC",
  ground: "#92501B",
  flying: "#82BAEF",
  psychic: "#EF3F7A",
  bug: "#92A212",
  rock: "#B0A981",
  ghost: "#703F70",
  dragon: "#036DC5",
  dark: "#4F3F3D",
  steel: "#5FA2BA",
  fairy: "#EF70EF",
};

interface CardCarouselProps {
  pokemon: Pokemon;
  evoChain: EvolutionStage[];
  flavorTexts: FlavorTextEntry[];
  abilities: Ability[];
  moves: Move[];
  encounters: PokemonEncounter[];
  availableVersions: string[];
  availableEncounterVersions: string[];
  forms: PokemonForm[];
}

export default function PokemonDetailPage({
  pokemon,
  evoChain,
  flavorTexts,
  abilities,
  moves,
  encounters,
  availableVersions,
  availableEncounterVersions,
}: CardCarouselProps) {
  const [activeTab, setActiveTab] = useState("about");
  const [isFav, setIsFav] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [pokeballBounce, setPokeballBounce] = useState(false);

  const versions = useMemo(
    () =>
      availableVersions?.length
        ? availableVersions
        : Array.from(new Set(flavorTexts.map((ft) => ft.version))),
    [flavorTexts, availableVersions]
  );

  const [selectedVersion, setSelectedVersion] = useState(
    versions.find((v) => flavorTexts.some((ft) => ft.version === v)) ||
      versions[0] ||
      ""
  );

  const flavorText =
    flavorTexts.find((ft) => ft.version === selectedVersion)?.text ??
    flavorTexts[0]?.text ??
    "";

  const typeColor = TYPE_COLORS[pokemon.types[0].type.name] || "#ccc";
  const lighterTypeColor = `${typeColor}55`;

  function handleCaught() {
    setIsCaught((prev) => !prev);
    setPokeballBounce(true);
    setTimeout(() => setPokeballBounce(false), 700);
  }

  function handleFav() {
    setIsFav((prev) => !prev);
  }

  const dropdownClass =
    "text-sm px-3 py-1 rounded-lg border border-transparent bg-white/75 shadow-lg outline-none transition focus:ring-2 focus:ring-offset-1 focus:ring-primary font-semibold text-zinc-800 hover:bg-white focus:bg-white/90";

  const MAIN_CARD_HEIGHT = 400;
  const META_ABILITIES_HEIGHT = 220;
  const DESC_HEIGHT = 150;
  const RIGHT_COL_WIDTH = 320;
  const ATTR_CARD_HEIGHT = 80;
  const RADAR_CARD_HEIGHT = DESC_HEIGHT * 3;
  const GAP = 32;
  const TOTAL_LEFT_HEIGHT =
    MAIN_CARD_HEIGHT + META_ABILITIES_HEIGHT + DESC_HEIGHT + 2 * GAP;

  const variants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  const officialArtwork =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default;

  return (
    <main
      className={`${pressStart2P.variable} ${fredoka.variable} w-full min-h-screen bg-gradient-to-br from-background to-card/80 text-foreground flex`}
    >
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col items-center py-8 px-2 ml-[60px] md:ml-[200px] transition-all duration-300">
        {activeTab === "about" && (
          <div className="w-full max-w-7xl flex flex-row gap-10 items-start">
            <div className="grid grid-cols-1 gap-8 max-w-[800px] flex-1">
              {/* Main Pokémon Card */}
              <motion.div
                className="relative flex flex-row items-center overflow-visible shadow-lg group rounded-2xl"
                style={{
                  width: "100%",
                  height: MAIN_CARD_HEIGHT,
                  background: `linear-gradient(120deg, ${typeColor}22 0%, #fff8 100%)`,
                  border: "4px rounded solid transparent",
                  borderRadius: "2rem",
                  borderImage:
                    `linear-gradient(110deg, ${typeColor} 60%, #fff6 98%, ${typeColor}88 100%) 1`,
                  boxShadow: `0 0 48px 0 ${typeColor}28`,
                  minHeight: MAIN_CARD_HEIGHT,
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 0 100px 0 ${typeColor}66`,
                }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                {/* LEFT: Info + Controls */}
                <div className="flex-1 flex flex-col justify-center h-full pl-12 pr-5 py-8 z-10">
                  <div className="flex items-center gap-5 mb-3">
                    <span
                      className="rounded-full px-5 py-1 font-fredoka font-extrabold tracking-widest bg-white/95 shadow border"
                      style={{
                        color: typeColor,
                        border: `2px solid ${typeColor}`,
                        fontSize: "1.1rem",
                        letterSpacing: "0.07em",
                      }}
                    >
                      #{pokemon.id}
                    </span>
                    {/* Favorite Star Button */}
                    <motion.button
                      aria-label="Toggle favorite"
                      className={`rounded-full p-2.5 flex items-center justify-center border-2 transition-colors ${
                        isFav
                          ? "border-yellow-400 bg-yellow-200/40"
                          : "border-border bg-white/70"
                      } shadow focus:outline-none`}
                      style={{
                        boxShadow: isFav
                          ? "0 0 24px 3px #ffe06688"
                          : "0 0 8px 0 #fffa",
                        color: isFav ? "#FFD600" : "#c8c8c8",
                        outline: 0,
                      }}
                      onClick={handleFav}
                      whileTap={{
                        scale: 1.23,
                        rotate: [0, -16, 14, 0],
                        transition: { duration: 0.32 },
                      }}
                      animate={{
                        scale: isFav ? 1.13 : 1,
                        filter: isFav
                          ? "drop-shadow(0 0 6px #ffe066cc)"
                          : "none",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 18 }}
                    >
                      <Image
                        src="/star.svg"
                        alt="Favorite"
                        width={29}
                        height={29}
                        className={`transition-all duration-200 ${
                          isFav ? "brightness-110 saturate-150" : "opacity-60"
                        }`}
                        style={{
                          filter: isFav
                            ? "drop-shadow(0 0 8px #ffe066d0)"
                            : "none",
                          transition: "filter 0.23s, opacity 0.23s",
                        }}
                      />
                    </motion.button>
                    {/* Caught Pokéball Button */}
                    <motion.button
                      aria-label="Toggle caught"
                      className={`rounded-full p-2.5 flex items-center justify-center border-2 ${
                        isCaught
                          ? "border-pink-400 bg-red-200/30"
                          : "border-border bg-white/80"
                      } shadow focus:outline-none transition-colors`}
                      onClick={handleCaught}
                      whileTap={{
                        scale: 1.18,
                        rotate: isCaught ? [0, 20, -18, 0] : 0,
                        transition: { duration: 0.45 },
                      }}
                      animate={
                        pokeballBounce
                          ? {
                              scale: [1, 1.16, 0.95, 1.09, 1],
                              rotate: [0, 17, -14, 7, 0],
                            }
                          : { scale: isCaught ? 1.1 : 1 }
                      }
                      transition={{
                        duration: 0.7,
                        type: "spring",
                        stiffness: 450,
                        damping: 22,
                      }}
                    >
                      <Image
                        src="/pokeball-colored.svg"
                        alt="Caught"
                        width={28}
                        height={28}
                        className={`transition-all duration-200 ${
                          isCaught ? "opacity-100 saturate-200" : "opacity-70"
                        }`}
                        style={{
                          filter: isCaught
                            ? "drop-shadow(0 0 8px #f34578aa)"
                            : "none",
                        }}
                      />
                    </motion.button>
                  </div>

                  <h1
                    className="text-5xl leading-tight font-extrabold font-retro capitalize mb-2 tracking-tight"
                    style={{
                      color: typeColor,
                      textShadow: "0 1px 16px #fff6",
                    }}
                  >
                    {pokemon.name}
                  </h1>
                  <div className="flex gap-2 flex-wrap mt-2 mb-1">
                    {pokemon.types.map((t) => (
                      <span
                        key={t.type.name}
                        className="px-4 py-1 rounded-full font-retro uppercase font-bold text-base shadow"
                        style={{
                          background: `linear-gradient(90deg, ${
                            TYPE_COLORS[t.type.name]
                          }cc 67%, #fff3 100%)`,
                          color: "#fff",
                          border: `1.5px solid ${TYPE_COLORS[t.type.name]}`,
                          letterSpacing: "0.05em",
                          textShadow: "0 1px 6px #333a",
                        }}
                      >
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                </div>
                {/* RIGHT: Pokémon Art */}
                <motion.div
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20"
                  style={{
                    height: MAIN_CARD_HEIGHT + 44,
                    width: MAIN_CARD_HEIGHT + 44,
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}
                  initial={{ scale: 1, opacity: 0.97 }}
                  animate={{ scale: 1.11, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18 }}
                >
                  <img
                    src={officialArtwork}
                    alt={pokemon.name}
                    className="object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
                    style={{
                      minWidth: "170px",
                      minHeight: "170px",
                      maxWidth: "265px",
                      maxHeight: MAIN_CARD_HEIGHT + 24,
                      borderRadius: "2rem",
                      background: "transparent",
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Meta Info & Abilities Side-by-Side */}
              <div className="flex flex-row gap-8 w-full" style={{ height: META_ABILITIES_HEIGHT }}>
                <motion.div
                  className="rounded-xl p-6 flex-1 flex flex-col gap-2 h-full min-w-[260px] relative z-10"
                  style={{
                    background: `linear-gradient(135deg, ${lighterTypeColor} 0%, #ffffff08 100%)`,
                    border: `2px rounded solid transparent`,
                    borderRadius: "1rem",
                    borderImage: `linear-gradient(120deg, ${lighterTypeColor}, #fff3, ${lighterTypeColor}) 1`,
                    boxShadow: `0 0 24px 0 ${lighterTypeColor}`,
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: `0 0 40px 0 ${lighterTypeColor}`,
                    borderImage: `linear-gradient(120deg, #fff3, ${lighterTypeColor}, #fff3) 1`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <span className="font-retro text-primary mb-1 tracking-wide text-xl">
                    Meta Info
                  </span>
                  <div className="text-base">
                    <span className="font-retro text-primary">Gender Ratio:</span>{" "}
                    <span>
                      {pokemon.gender_rate === -1
                        ? "Genderless"
                        : pokemon.gender_rate != null
                        ? `${100 - pokemon.gender_rate * 12.5}% ♂ / ${pokemon.gender_rate * 12.5}% ♀`
                        : "—"}
                    </span>
                  </div>
                  <div className="text-base">
                    <span className="font-retro text-primary">Egg Groups:</span>{" "}
                    <span>{pokemon.egg_groups?.join(", ")}</span>
                  </div>
                  <div className="text-base">
                    <span className="font-retro text-primary">Hatch Steps:</span>{" "}
                    <span>
                      {pokemon.hatch_counter
                        ? 255 * (pokemon.hatch_counter + 1)
                        : "—"}
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  className="rounded-xl p-6 flex-1 flex flex-col gap-2 h-full min-w-[260px] relative z-10"
                  style={{
                    background: `linear-gradient(135deg, ${lighterTypeColor} 0%, #ffffff08 100%)`,
                    border: `2px rounded solid transparent`,
                    borderRadius: "1rem",
                    borderImage: `linear-gradient(120deg, ${lighterTypeColor}, #fff3, ${lighterTypeColor}) 1`,
                    boxShadow: `0 0 24px 0 ${lighterTypeColor}`,
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: `0 0 40px 0 ${lighterTypeColor}`,
                    borderImage: `linear-gradient(120deg, #fff3, ${lighterTypeColor}, #fff3) 1`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <span className="font-retro text-primary mb-1 tracking-wide text-xl">
                    Abilities
                  </span>
                  {abilities.map((a) => (
                    <div key={a.name} className="flex flex-col mb-[3px]">
                      <div className="flex items-center gap-2">
                        <span className="font-fredoka font-bold text-[1.05rem]">{a.name}</span>
                        {a.is_hidden && (
                          <motion.span
                            className="ml-2 px-[0.66em] py-[0.14em] rounded-full font-retro text-xs font-bold border-2 border-yellow-400 bg-yellow-300/85 text-yellow-900 shadow relative"
                            initial={{ backgroundColor: "#fde047" }}
                            animate={{ backgroundColor: ["#fde047", "#facc15", "#fde047"] }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut"
                            }}
                          >
                            Hidden
                          </motion.span>
                        )}
                      </div>
                      {a.description && (
                        <span className="text-xs text-muted-foreground font-fredoka block">{a.description}</span>
                      )}
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Pokédex Description with Dropdown */}
              <motion.div
                className="rounded-xl p-6 w-full flex flex-col justify-between overflow-hidden"
                style={{
                  height: DESC_HEIGHT,
                  background: `linear-gradient(135deg, ${lighterTypeColor} 0%, #ffffff08 100%)`,
                  border: `2px rounded solid transparent`,
                  borderRadius: "1rem",
                  borderImage: `linear-gradient(120deg, ${lighterTypeColor}, #fff3, ${lighterTypeColor}) 1`,
                  boxShadow: `0 0 24px 0 ${lighterTypeColor}`,
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 0 40px 0 ${lighterTypeColor}`,
                  borderImage: `linear-gradient(120deg, #fff3, ${lighterTypeColor}, #fff3) 1`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <div className="flex flex-row items-center justify-between mb-2 z-10">
                  <span className="font-retro text-primary tracking-wide text-xl">
                    Pokédex Description
                  </span>
                  {versions.length > 1 && (
                    <div className="relative">
                      <select
                        className={dropdownClass}
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        style={{
                          borderColor: typeColor,
                          color: typeColor,
                          minWidth: 110,
                        }}
                      >
                        {versions.map((version) => (
                          <option key={version} value={version}>
                            {version}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <span className="font-fredoka z-10 text-base leading-relaxed">{flavorText}</span>
              </motion.div>
            </div>

            {/* Right Section: Attributes & Radar Chart */}
            <motion.div
              className="flex flex-col gap-5 min-w-[220px] max-w-xs mx-auto h-full justify-between"
              style={{
                width: RIGHT_COL_WIDTH,
                height: TOTAL_LEFT_HEIGHT,
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ flexShrink: 0 }}>
                {[
                  { label: "Height", value: `${pokemon.height / 10} m` },
                  { label: "Weight", value: `${pokemon.weight / 10} kg` },
                  { label: "Catch Rate", value: pokemon.catch_rate ?? "—" },
                ].map(({ label, value }) => (
                  <motion.div
                    key={label}
                    className="rounded-xl p-4 flex flex-row gap-4 justify-center items-center mb-5 relative overflow-hidden"
                    style={{
                      height: ATTR_CARD_HEIGHT,
                      background: `linear-gradient(135deg, ${lighterTypeColor} 0%, #ffffff08 100%)`,
                      border: `2px rounded solid transparent`,
                      borderRadius: "1rem",
                      borderImage: `linear-gradient(120deg, ${lighterTypeColor}, #fff3, ${lighterTypeColor}) 1`,
                      boxShadow: `0 0 24px 0 ${lighterTypeColor}`,
                    }}
                    whileHover={{
                      scale: 1.045,
                      boxShadow: `0 0 32px 0 ${lighterTypeColor}`,
                      borderImage: `linear-gradient(120deg, #fff3, ${lighterTypeColor}, #fff3) 1`,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <span className="font-retro text-primary z-10 text-lg">
                      {label}
                    </span>
                    <span className="font-fredoka text-lg z-10">{value}</span>
                  </motion.div>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <motion.div
                className="rounded-xl p-4 flex flex-col items-center justify-end overflow-hidden relative"
                style={{
                  height: RADAR_CARD_HEIGHT,
                  width: "100%",
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, ${lighterTypeColor} 0%, #ffffff08 100%)`,
                  border: `2px rounded solid transparent`,
                  borderRadius: "1rem",
                  borderImage: `linear-gradient(120deg, ${lighterTypeColor}, #fff3, ${lighterTypeColor}) 1`,
                  boxShadow: `0 0 24px 0 ${lighterTypeColor}`,
                }}
                whileHover={{
                  scale: 1.045,
                  boxShadow: `0 0 48px 0 ${lighterTypeColor}`,
                  borderImage: `linear-gradient(120deg, #fff3, ${lighterTypeColor}, #fff3) 1`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="font-retro text-primary mb-2 z-10 text-xl">
                  Base Stats
                </span>
                <div className="w-full h-full flex items-center justify-center z-10">
                  <RadarChart pokemon={pokemon} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Other Tabs */}
        <section className="w-full flex-1 px-2 font-fredoka mt-8">
          <AnimatePresence mode="wait">
            {activeTab === "evolution" && (
              <motion.div
                key="evolution"
                initial="enter"
                animate="center"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.3 }}
              >
                <EvolutionCardContent evoChain={evoChain} />
              </motion.div>
            )}
            {activeTab === "moves" && (
              <motion.div
                key="moves"
                initial="enter"
                animate="center"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.3 }}
              >
                <MovesCardContent
                  moves={moves}
                  availableVersions={availableVersions}
                />
              </motion.div>
            )}
            {activeTab === "locations" && (
              <motion.div
                key="locations"
                initial="enter"
                animate="center"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.3 }}
              >
                <LocationsCardContent
                  encounters={encounters}
                  availableGames={availableEncounterVersions}
                  primaryType={pokemon.types[0].type.name}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}