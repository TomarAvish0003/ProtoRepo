"use client";
import { useEffect, useState } from "react";
import { getCaught, removeCaught } from "@/app/utils/api";
import { Pokemon } from "@/app/utils/types";
import { Heart } from "lucide-react";

function isPokemon(data: unknown): data is Pokemon {
  return (
    !!data &&
    typeof data === "object" &&
    "id" in data &&
    "name" in data &&
    "sprites" in data &&
    "types" in data
  );
}

export default function CaughtTab() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCaught = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view caught Pokémon.");
        setLoading(false);
        return;
      }
      try {
        const caughtRes = await getCaught(token);
        if (caughtRes.error || !caughtRes.data) {
          setError(caughtRes.error || "Failed to load caught Pokémon");
          setLoading(false);
          return;
        }
        const results: Pokemon[] = [];
        const latestCaught = caughtRes.data.slice(-5).reverse();
        for (const nameOrId of latestCaught) {
          try {
            const res = await fetch(`/api/pokemon/${nameOrId}`);
            if (res.ok) {
              const data = await res.json();
              if (isPokemon(data)) {
                results.push(data);
              }
            }
            await new Promise((resolve) => setTimeout(resolve, 300));
          } catch {}
        }
        setPokemons(results);
      } catch {
        setError("Failed to load caught Pokémon");
      } finally {
        setLoading(false);
      }
    };
    loadCaught();
  }, []);

  const handleRemove = async (name: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await removeCaught(token, name);
    setPokemons((prev) => prev.filter((p) => p.name !== name));
  };

  return (
    <div
      className="relative p-[2px] rounded-xl"
      style={{
        background: "linear-gradient(270deg, #10b981, #06b6d4, #8b5cf6, #10b981)",
        backgroundSize: "600% 600%",
        animation: "gradient-move 6s ease infinite",
      }}
    >
      <div className="rounded-xl bg-[rgba(24,24,27,0.85)] backdrop-blur-lg border border-white/10 shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-green-500 fill-current" />
          <h2 className="text-xl font-bold text-white tracking-tight">Recent Caught</h2>
          <span className="bg-green-500/20 text-green-400 rounded-full px-3 py-1 text-xs font-semibold">
            {pokemons.length} of 5
          </span>
        </div>

        {/* Pokemon Grid */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {loading && <div className="text-gray-400">Loading caught Pokémon...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {!loading && !error && pokemons.length === 0 && (
            <div className="text-gray-400">No caught Pokémon yet.</div>
          )}
          {pokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              className="relative rounded-lg bg-[rgba(35,35,38,0.8)] backdrop-blur-sm p-3 flex flex-col items-center shadow-lg group transition hover:bg-[rgba(39,39,42,0.9)] cursor-pointer min-w-[120px] border border-white/10"
              tabIndex={0}
              aria-label={`View details for ${pokemon.name}`}
            >
              <button
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full opacity-80 hover:opacity-100 z-10 transition-all duration-200 hover:scale-105 text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(pokemon.name);
                }}
                aria-label={`Remove ${pokemon.name} from caught`}
                type="button"
              >
                Remove
              </button>
              <img
                src={pokemon.sprites?.front_default ?? "/pokeball.svg"}
                alt={pokemon.name}
                className="w-16 h-16 mb-2"
              />
              <div className="capitalize font-semibold text-white text-center">{pokemon.name}</div>
              <div className="text-xs text-gray-400 text-center">
                {pokemon.types?.map((t) => t.type?.name).join(", ")}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Showing your 5 most recent caught Pokémon.
          </p>
        </div>
      </div>
    </div>
  );
}
