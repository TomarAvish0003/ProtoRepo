"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import HeroSection from "@/app/components/home/HeroSection";
import { getPokemon } from "@/app/utils/api";
import type { Pokemon } from "@/app/utils/types";
import { useAuth } from "@/app/context/AuthContext";
import SearchBar from "@/app/components/home/SearchBar";
import { PokemonCard as PokemonCardType, shufflePokemon } from "@/app/utils/pokemon";
import PokemonCard from "@/app/components/PokemonCard";
import { toast } from "sonner";

const pokemonNames = [
  "dialga", "palkia", "giratina-altered", "venusaur", "blastoise", "charizard",
  "kyogre", "groudon", "rayquaza", "reshiram", "kyurem", "zekrom",
] as const;

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

export default function HomePage(): React.JSX.Element {
  const [featured, setFeatured] = useState<Pokemon[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchBarRef = useRef<HTMLInputElement>(null);
  const toastShownRef = useRef(false);

  // --- FIX: Add state for the search bar ---
  const [searchTerm, setSearchTerm] = useState("");

  // Scroll/focus on hash change
  useEffect(() => {
    if (window.location.hash === "#search" && searchBarRef.current) {
      searchBarRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      searchBarRef.current.focus();
    }
  }, []);

  // Show welcome toast when user logs in
  useEffect(() => {
    if (user && !toastShownRef.current) {
      toast.success(`Welcome back, ${user.email}!`, {
        description: "You're now logged in to your Pokédex account",
        duration: 5000,
        position: "top-center",
        style: {
          background: "hsl(222.2 47.4% 11.2%)",
          color: "white",
          border: "1px solid hsl(217.2 32.6% 17.5%)",
          fontSize: "0.875rem",
        },
      });
      toastShownRef.current = true;
    }
  }, [user]);

  // Enhanced fetch with better 429 handling
  const fetchWithRetry = useCallback(
    async (name: string, retries = 5): Promise<Pokemon | null> => {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const res = await getPokemon(name);
          if (res.data && isPokemon(res.data)) {
            return res.data;
          }
          if (res.error?.includes('429') || res.error?.includes('Too Many Requests')) {
            const delay = Math.min(3000 * (attempt + 1), 15000);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        } catch (error) {
          console.warn(`Attempt ${attempt + 1} failed for ${name}:`, error);
        }
        const delay = Math.min(2000 * 2 ** attempt + Math.random() * 1000, 15000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      console.error(`Failed to fetch ${name} after ${retries} attempts`);
      return null;
    },
    []
  );

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let isActive = true;

    const loadFeatured = async () => {
      setFeaturedLoading(true);
      setLoadingProgress(0);
      const results: Pokemon[] = [];
      
      for (let i = 0; i < pokemonNames.length; i++) {
        if (!isActive || abortControllerRef.current?.signal.aborted) break;
        
        const name = pokemonNames[i];
        
        const data = await fetchWithRetry(name);
        if (data) {
          results.push(data);
        }
        
        setLoadingProgress(((i + 1) / pokemonNames.length) * 100);
        
        if (i < pokemonNames.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
      
      if (isActive && !abortControllerRef.current?.signal.aborted) {
        setFeatured(results);
        setFeaturedLoading(false);
        setLoadingProgress(100);
      }
    };

    loadFeatured();

    return () => {
      isActive = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchWithRetry]);

  const featuredCards: PokemonCardType[] = shufflePokemon(
    featured.map((p) => ({
      id: p.id,
      name: p.name,
      sprite: p.sprites?.front_default ?? "",
      types: (p.types ?? []).map((t) => t.type?.name ?? "").filter(Boolean),
    }))
  ).slice(0, 3);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroSection />
      
      <section className="max-w-2xl mx-auto px-4 py-4">
        {!user && (
          <div className="mb-4 text-muted-foreground">
            Welcome!{" "}
            <a href="/login" className="text-accent underline hover:text-accent-foreground">
              Login
            </a>{" "}
            or{" "}
            <a href="/register" className="text-accent underline hover:text-accent-foreground">
              Register
            </a>{" "}
            to save favorites and build teams.
          </div>
        )}

        {/* --- FIX: Connect the SearchBar to the page's state --- */}
        <SearchBar 
          ref={searchBarRef} 
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <h2 className="text-xl font-semibold mb-2 mt-8">Featured Pokémon</h2>
      </section>

      <section className="w-full px-4 py-4">
        {featuredLoading ? (
          <div className="text-center max-w-md mx-auto">
            <div>
              Loading featured Pokémon... ({Math.round(loadingProgress)}%)
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        ) : featuredCards.length === 0 ? (
          <div className="text-center">No Pokémon found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto justify-items-center">
            {featuredCards.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                id={pokemon.id}
                name={pokemon.name}
                sprite={pokemon.sprite}
                types={pokemon.types}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}