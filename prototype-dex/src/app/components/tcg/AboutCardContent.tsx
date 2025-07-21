import { Pokemon } from "@/app/utils/types";
import RadarChart from "../RadarChart";

interface AboutCardContentProps {
  pokemon: Pokemon;
  flavorTexts: any[];
  abilities: any[];
  availableVersions?: string[];
}

export default function AboutCardContent({
  pokemon,
}: AboutCardContentProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <label className="block font-retro text-lg text-primary mb-2">
        Base Stats
      </label>
      <div className="rounded-lg bg-white/20 p-3 glass-card w-full max-w-md flex justify-center">
        <RadarChart pokemon={pokemon} />
      </div>
    </div>
  );
}
