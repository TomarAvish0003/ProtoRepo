"use client";

import CardCarousel from "@/app/components/tcg/CardCrousel";
import { Pokemon, EvolutionStage, Move, Ability, FlavorTextEntry, PokemonEncounter, PokemonForm } from "@/app/utils/types";

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
  encounters,
  availableVersions,
  availableEncounterVersions, // 1. ADD THE PROP HERE
  forms,
}: PokemonDetailClientProps) {
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-background to-card/80 text-foreground py-4 px-0 flex flex-col items-center">
      <div className="w-full mx-auto pt-8">
        <CardCarousel
          pokemon={pokemon}
          evoChain={evoChain}
          flavorTexts={flavorTexts}
          abilities={abilities}
          moves={moves}
          encounters={encounters}
          availableVersions={availableVersions}
          availableEncounterVersions={availableEncounterVersions} // 2. PASS THE PROP HERE
          forms={forms}
        />
      </div>
    </main>
  );
}