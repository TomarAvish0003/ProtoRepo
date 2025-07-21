"use client";
import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "@/app/utils/api";
import { Pokemon } from "@/app/utils/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";

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

export default function FavoritesTab() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view favorites.");
        setLoading(false);
        return;
      }
      try {
        const favoritesRes = await getFavorites(token);
        if (favoritesRes.error || !favoritesRes.data) {
          setError(favoritesRes.error || "Failed to load favorites");
          setLoading(false);
          return;
        }
        const results: Pokemon[] = [];
        const latestFavorites = favoritesRes.data.slice(-5).reverse();
        for (const nameOrId of latestFavorites) {
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
        setError("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  const handleRemove = async (name: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await removeFavorite(token, name);
    setPokemons((prev) => prev.filter((p) => p.name !== name));
  };

  const handleViewAllFavorites = () => {
    router.push("/favorites");
  };

  return (
    <div
      className="relative p-[2px] rounded-xl"
      style={{
        background: "linear-gradient(270deg, #a855f7, #ec4899, #facc15, #a855f7)",
        backgroundSize: "600% 600%",
        animation: "gradient-move 6s ease infinite",
      }}
    >
      <div className="rounded-xl bg-[rgba(24,24,27,0.85)] backdrop-blur-lg border border-white/10 shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-current" />
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Favorites</h2>
            <span className="bg-red-500/20 text-red-400 rounded-full px-3 py-1 text-xs font-semibold">
              {pokemons.length} of 5
            </span>
          </div>
          <Button 
            onClick={handleViewAllFavorites}
            variant="outline"
            size="sm"
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            View All Favorites <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Pokemon Grid */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {loading && <div className="text-gray-400">Loading favorites...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {!loading && !error && pokemons.length === 0 && (
            <div className="text-gray-400">No favorites yet.</div>
          )}
          {pokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              className="relative rounded-lg bg-[rgba(35,35,38,0.8)] backdrop-blur-sm p-3 flex flex-col items-center shadow-lg group transition hover:bg-[rgba(39,39,42,0.9)] cursor-pointer min-w-[120px] border border-white/10"
              onClick={() => router.push(`/pokemon/${pokemon.name}`)}
              tabIndex={0}
              aria-label={`View details for ${pokemon.name}`}
            >
              <button
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full opacity-80 hover:opacity-100 z-10 transition-all duration-200 hover:scale-105 text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(pokemon.name);
                }}
                aria-label={`Remove ${pokemon.name} from favorites`}
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
            Showing your 5 most recent favorites.
            <Button 
              variant="link" 
              onClick={handleViewAllFavorites}
              className="p-0 h-auto font-normal text-sm ml-1 text-purple-400 hover:text-purple-300"
            >
              View all favorites →
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
