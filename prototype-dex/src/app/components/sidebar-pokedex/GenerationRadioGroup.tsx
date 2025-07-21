"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Fredoka, Press_Start_2P } from "next/font/google";
import clsx from "clsx";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "700"] });
const pressStart = Press_Start_2P({ subsets: ["latin"], weight: "400" });

interface Generation {
  id: number | null;
  label: string;
}

interface GenerationTimelineProps {
  generations: { id: number; label: string }[];
  selected: number | null;
  setSelected: (id: number | null) => void;
  collapsed?: boolean;
}

export default function GenerationTimeline({
  generations,
  selected,
  setSelected,
  collapsed,
}: GenerationTimelineProps) {
  if (collapsed) return null;

  const allGenerations: Generation[] = [
    { id: null, label: "All Generations" },
    ...generations,
  ];

  const pokeballMap: Record<number | "all", string> = {
    all: "/pokeballs/masteball.svg",
    1: "/pokeballs/pokeball.svg",
    2: "/pokeballs/gsball.svg",
    3: "/pokeballs/ultraball.svg",
    4: "/pokeballs/luxuryball.svg",
    5: "/pokeballs/quickball.svg",
    6: "/pokeballs/premierball.svg",
    7: "/pokeballs/fastball.svg",
    8: "/pokeballs/greatball.svg",
    9: "/pokeballs/timerball.svg",
  };

  const getPokeballIcon = (id: number | null): string => {
    if (id === null) return pokeballMap["all"];
    return pokeballMap[id] || "/icons/pokeball.svg";
  };

  return (
    <div
      className={clsx(
        "max-w-[450px] rounded-2xl p-4 mt-4 bg-black/70 border border-white/20 shadow-xl backdrop-blur-2xl",
        fredoka.className
      )}
    >
      <div
        className={clsx(
          "text-xs text-white mb-4 tracking-widest font-extrabold",
          pressStart.className
        )}
        style={{ letterSpacing: ".16em" }}
      >
        GENERATION
      </div>

      <div className="flex flex-col gap-6">
        {allGenerations.map((gen, idx) => {
          const isSelected = selected === gen.id;
          const ballIcon = getPokeballIcon(gen.id);

          return (
            <motion.div
              key={String(gen.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelected(gen.id)}
              className="grid grid-cols-[32px_2px_1fr] gap-4 items-center cursor-pointer group relative"
            >
              {/* Pokéball icon */}
              <div className="w-6 h-6 relative z-10">
                <Image
                  src={ballIcon}
                  alt="Pokéball"
                  width={24}
                  height={24}
                  className={clsx(
                    "transition-transform duration-200",
                    isSelected
                      ? "scale-110 drop-shadow-[0_0_8px_#38bdf8cc]"
                      : "opacity-60 group-hover:scale-105"
                  )}
                />
              </div>

              {/* Vertical line in its own column */}
              <div className="h-full w-[2px] bg-white/30 mx-auto" />

              {/* Generation label */}
              <div
                className={clsx(
                  "text-white text-sm transition-colors duration-200",
                  isSelected
                    ? "font-bold text-blue-300"
                    : "opacity-80 group-hover:opacity-100"
                )}
              >
                {gen.label}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
