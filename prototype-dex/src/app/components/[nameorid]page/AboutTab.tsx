"use client";

import { Pokemon, FlavorTextEntry, Ability } from "@/app/utils/types";
import Sidebar from "./Sidebar";
import RadarChart from "../RadarChart";
import TypeChip from "../tcg/TypeChip";
import { Button } from "@/components/ui/button";

// Define the props for the component for type safety
interface AboutTabProps {
  pokemon: Pokemon;
  flavorTexts: FlavorTextEntry[];
  abilities: Ability[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AboutTab({
  pokemon,
  flavorTexts,
  abilities,
  activeTab,
  onTabChange,
}: AboutTabProps) {

  // Helper to calculate and format gender ratio safely
  const getGenderRatio = () => {
    if (pokemon.gender_rate === -1) {
      return "Genderless";
    }
    // FIX: Check if gender_rate is defined before using it
    if (pokemon.gender_rate !== undefined && pokemon.gender_rate !== null) {
      const femalePercentage = pokemon.gender_rate * 12.5;
      const malePercentage = 100 - femalePercentage;
      return `${malePercentage}% ♂ / ${femalePercentage}% ♀`;
    }
    return "Unknown"; // Fallback if data is missing
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-card/80 text-foreground">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 flex flex-col items-center py-8 px-4">
        {/* Top Row: Main Card + Attribute Cards */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
          {/* Main Pokémon Card */}
          <div className="flex-1 glass-card rounded-2xl p-8 flex flex-col items-center shadow-lg">
            <img src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default} alt={pokemon.name} className="w-40 h-40 mb-4" />
            <h1 className="text-4xl font-retro capitalize" style={{ color: `var(--type-${pokemon.types[0].type.name}, var(--color-primary))` }}>
              {pokemon.name}
              <span className="ml-2 text-muted-foreground text-2xl">#{pokemon.id}</span>
            </h1>
            <div className="flex gap-2 mt-2">
              {pokemon.types.map(t => <TypeChip key={t.type.name} type={t.type.name} />)}
            </div>
            <div className="flex gap-4 mt-6">
              <Button variant="secondary">Favorite</Button>
              <Button variant="secondary">Caught</Button>
            </div>
          </div>
          {/* Attribute Cards & Stats Radar (Right, Stacked) */}
          <div className="flex flex-row lg:flex-col gap-4">
            <div className="flex-1 glass-card rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="font-retro text-primary">Height</span>
              <span className="font-fredoka text-lg">{pokemon.height / 10} m</span>
            </div>
            <div className="flex-1 glass-card rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="font-retro text-primary">Weight</span>
              <span className="font-fredoka text-lg">{pokemon.weight / 10} kg</span>
            </div>
            <div className="flex-1 glass-card rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="font-retro text-primary">Catch Rate</span>
              <span className="font-fredoka text-lg">{pokemon.catch_rate ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Middle Row: Stats Radar Chart */}
        <div className="w-full max-w-6xl mt-8">
            <div className="glass-card rounded-xl p-4 flex flex-col items-center">
                <span className="font-retro text-primary mb-2">Base Stats</span>
                <RadarChart pokemon={pokemon} />
            </div>
        </div>

        {/* Bottom Row: Meta Info, Abilities, Description */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Meta Info Card */}
          <div className="glass-card rounded-xl p-6 flex flex-col gap-2">
            <span className="font-retro text-primary mb-1">Meta Info</span>
            <div><span className="font-retro text-sm text-primary">Gender Ratio:</span> <span>{getGenderRatio()}</span></div>
            <div><span className="font-retro text-sm text-primary">Egg Groups:</span> <span>{pokemon.egg_groups?.join(", ") || '—'}</span></div>
            <div><span className="font-retro text-sm text-primary">Hatch Steps:</span> <span>{pokemon.hatch_counter ? 255 * (pokemon.hatch_counter + 1) : "—"}</span></div>
          </div>
          {/* Abilities Card */}
          <div className="glass-card rounded-xl p-6 flex flex-col gap-3">
            <span className="font-retro text-primary mb-1">Abilities</span>
            {abilities.map(a => (
              <div key={a.name} className="flex flex-col">
                <span className="font-fredoka font-medium flex items-center">
                  {a.name}
                  {a.is_hidden && <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-400/80 text-xs font-retro text-white">Hidden</span>}
                </span>
                {a.description && <span className="text-xs text-muted-foreground font-fredoka">{a.description}</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Description Card (Full Width) */}
        <div className="w-full max-w-6xl mt-8">
          <div className="glass-card rounded-xl p-6">
            <span className="font-retro text-primary mb-2 block">Pokédex Description</span>
            <span className="font-fredoka">{flavorTexts[0]?.text || 'No description available.'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
