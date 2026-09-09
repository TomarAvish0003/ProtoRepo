import React from "react";
import type { Metadata } from "next";
import TeamBuilderClient from "./page.client";
import localPokedexData from "@/app/data/pokedex-data.json";
import localMovesData from "@/app/data/pokemon_moves.json";

export const metadata: Metadata = {
  title: "Competitive Team Builder & Damage Calculator | PrototypeDex",
  description:
    "Engineering-grade competitive Pokémon team builder featuring 18x6 dense defense matrices, bipartite offensive coverage with greedy set cover, speed tier interval graph, and deterministic 16-roll damage calculator.",
};

export default function TeamBuilderPage() {
  return (
    <TeamBuilderClient
      pokedexData={localPokedexData}
      movesData={localMovesData}
    />
  );
}

