"use client";

import { useEffect, useState } from "react";
import { getFavorites, removeFavorite, getPokemon } from "@/app/utils/api";
import { Pokemon, RawPokemonType } from "@/app/utils/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SearchBar from "@/app/components/home/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import GradientGlassyTextBg from "@/app/components/ui/GradientGlassyTextBg";
import RemoveButton from "@/app/components/ui/RemoveButton";

const BLOCK = 48;
const GAP = 6;

// Green L-shaped Tetris (bottom-left, 3 vertical, 3 horizontal for asymmetry)
const TetrisLCornerGreen = () => (
  <svg
    width={BLOCK * 3 + GAP * 2}
    height={BLOCK * 3 + GAP * 2}
    viewBox={`0 0 ${BLOCK * 3 + GAP * 2} ${BLOCK * 3 + GAP * 2}`}
    className="fixed bottom-0 left-0 z-50"
    style={{ pointerEvents: "none" }}
  >
    {/* Vertical bar (3 blocks) */}
    <rect x="0" y={0} width={BLOCK} height={BLOCK} fill="#EF8200" />
    <rect x="0" y={BLOCK + GAP} width={BLOCK} height={BLOCK} fill="#EF8200" />
    <rect x="0" y={2 * (BLOCK + GAP)} width={BLOCK} height={BLOCK} fill="#EF8200" />
    {/* Horizontal bar (3 blocks, bottom) */}
    <rect x={BLOCK + GAP} y={2 * (BLOCK + GAP)} width={BLOCK} height={BLOCK} fill="#EF8200" />
    <rect x={2 * (BLOCK + GAP)} y={2 * (BLOCK + GAP)} width={BLOCK} height={BLOCK} fill="#EF8200" />
  </svg>
);

// Charmander peeking from the left corner (face/upper body only)
const CharmanderPeek = () => (
  <img
    src="/charmader-2.svg"
    alt="Charmander peeking"
    className="fixed bottom-0 left-0 z-40 select-none pointer-events-none"
    style={{
      width: 72,
      height: 72,
      objectFit: "contain",
      filter: "drop-shadow(0 4px 16px #0008)",
      marginLeft: BLOCK / 2 + 5 * GAP,
      marginBottom: BLOCK / 2 + GAP + 2,
    }}
  />
);

// Orange (yellow) L-shaped Tetris (bottom-right, as before)
const TetrisLCornerOrange = () => (
  <svg
    width={BLOCK * 2 + GAP}
    height={BLOCK * 3 + GAP * 2}
    viewBox={`0 0 ${BLOCK * 2 + GAP} ${BLOCK * 3 + GAP * 2}`}
    className="fixed bottom-0 right-0 z-50"
    style={{ pointerEvents: "none" }}
  >
    <rect x={BLOCK + GAP} y={BLOCK + GAP} width={BLOCK} height={BLOCK} fill="#F8D51F" />
    <rect x={BLOCK + GAP} y={2 * (BLOCK + GAP)} width={BLOCK} height={BLOCK} fill="#F8D51F" />
    <rect x={0} y={2 * (BLOCK + GAP)} width={BLOCK} height={BLOCK} fill="#F8D51F" />
  </svg>
);

// Pikachu peeking from the right corner, as before
const PikachuPeek = () => (
  <img
    src="/5.svg"
    alt="Pikachu peeking"
    className="fixed bottom-0 right-0 z-40 select-none pointer-events-none"
    style={{
      width: 72,
      height: 72,
      objectFit: "contain",
      marginRight: BLOCK / 2 + 2 * GAP,
      marginBottom: BLOCK / 2 + GAP + 2,
    }}
  />
);

const TYPE_COLORS: Record<string, string> = {
  dragon: "#036DC5", poison: "#923FCC", normal: "#9FA29F",
  fighting: "#FF8100", flying: "#82BAEF", ground: "#92501B",
  rock: "#B0A981", bug: "#92A212", ghost: "#703F70",
  steel: "#5FA2BA", fire: "#E72324", water: "#2481EF",
  grass: "#3DA224", electric: "#FAC100", psychic: "#EF3F7A",
  ice: "#3DD9FF", dark: "#4F3F3D", fairy: "#EF70EF",
};

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

        const promises = favoritesRes.data.map(nameOrId => getPokemon(nameOrId));
        const results = await Promise.all(promises);
        
        const successfulPokemons = results
          .map(res => res.data)
          .filter((p): p is Pokemon => p !== null);

        setPokemons(successfulPokemons);
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
    <main className="relative min-h-screen bg-background bg-fixed bg-cover overflow-hidden">
      <TetrisLCornerGreen />
      <CharmanderPeek />
      <TetrisLCornerOrange />
      <PikachuPeek />
      
      <GradientGlassyTextBg text="FAVORITES" />
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-96 h-[28rem] rounded-2xl" />
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
          {filteredPokemons.map((pokemon) => {
            const typeColor =
              TYPE_COLORS[pokemon.types[0].type.name] ?? "#FF0000";
            return (
              <div
                key={pokemon.id}
                className="glass-card-outer group relative"
                tabIndex={0}
                aria-label={`View details for ${pokemon.name}`}
                style={{
                  border: `3px solid ${typeColor}`,
                  boxShadow: `0 8px 32px 0 ${typeColor}33, 0 2px 8px 0 #0002`,
                  background: "rgba(24,24,27,0.65)",
                  borderRadius: "1.5rem",
                  minHeight: "28rem",
                  padding: "2rem",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  transition: "box-shadow 0.25s, transform 0.25s",
                }}
                onClick={() => router.push(`/pokemon/${pokemon.name}`)}
              >
                <div className="relative w-40 h-40 mb-4 mx-auto">
                  <Image
                    src={pokemon.sprites?.front_default ?? "/pokeball.svg"}
                    alt={pokemon.name}
                    fill
                    sizes="160px"
                    className="object-contain"
                    priority={false}
                  />
                </div>
                <h2
                  className="text-2xl font-bold capitalize text-center mb-3"
                  style={{ color: "#fff" }}
                >
                  {pokemon.name}
                </h2>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {pokemon.types.map((t: RawPokemonType) => (
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
                <div className="flex justify-center mt-2">
                  <RemoveButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(pokemon.name);
                    }}
                    typeColor={typeColor}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
