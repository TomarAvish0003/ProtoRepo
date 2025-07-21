"use client";

import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "@/app/utils/api";
import { Pokemon } from "@/app/utils/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import SearchBar from "@/app/components/home/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import GradientGlassyTextBg from "@/app/components/ui/GradientGlassyTextBg";

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

export default function FavoritesPage() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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
        const results: Pokemon[] = await Promise.all(
          favoritesRes.data.map(async (nameOrId: string) => {
            try {
              const res = await fetch(`/api/pokemon/${nameOrId}`);
              if (res.ok) {
                const data = await res.json();
                if (isPokemon(data)) return data;
              }
            } catch {}
            return null;
          })
        ).then((arr) => arr.filter((p): p is Pokemon => p !== null));
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

  const filteredPokemons = pokemons.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="relative min-h-screen bg-animated-gradient bg-fixed bg-cover bg-center">
      <GradientGlassyTextBg text="Favorites" />
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-96 h-[28rem] rounded-xl" />
            ))}
          </div>
        )}
        {error && (
          <div className="text-destructive text-center text-base font-semibold">
            {error}
          </div>
        )}
        {!loading && !error && filteredPokemons.length === 0 && (
          <div className="text-muted-foreground text-center text-base">
            No favorites found.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPokemons.map((pokemon) => (
            <BackgroundGradient
              key={pokemon.id}
              className="rounded-xl w-full h-full"
              containerClassName="transition-transform hover:scale-105"
              animate
            >
              <div
                className="
                  relative w-96 max-w-full
                  rounded-2xl
                  border border-white/30
                  shadow-2xl
                  flex flex-col items-center p-8 cursor-pointer group
                  backdrop-blur-xl
                  transition
                  bg-white/20
                "
                style={{
                  background: "rgba(255,255,255,0.18)",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                  border: "1.5px solid rgba(255,255,255,0.30)",
                }}
                onClick={() => router.push(`/pokemon/${pokemon.name}`)}
                tabIndex={0}
                aria-label={`View details for ${pokemon.name}`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(pokemon.name);
                  }}
                  className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded text-xs font-medium hover:bg-destructive/90 transition"
                  aria-label={`Remove ${pokemon.name} from favorites`}
                  type="button"
                >
                  Remove
                </button>
                <div className="relative w-40 h-40 mb-4">
                  <Image
                    src={pokemon.sprites?.front_default ?? "/pokeball.svg"}
                    alt={pokemon.name}
                    fill
                    sizes="160px"
                    className="object-contain"
                    priority={false}
                  />
                </div>
                <h2 className="text-2xl font-bold capitalize text-card-foreground mb-3">
                  {pokemon.name}
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {pokemon.types.map((t) => (
                    <span
                      key={t.type.name}
                      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                      style={{
                        background: TYPE_COLORS[t.type.name] ?? "#eee",
                        color: "#fff",
                      }}
                    >
                      <Image
                        src={`/icons/${t.type.name}.svg`}
                        alt={t.type.name}
                        width={20}
                        height={20}
                        className="mr-2"
                        style={{ filter: "brightness(0) invert(1)" }}
                      />
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </BackgroundGradient>
          ))}
        </div>
      </div>
    </main>
  );
}
 