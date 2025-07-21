"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getPokedexList,
  getPokemonByGeneration,
  ApiResponse,
} from "@/app/utils/api";
import { FlatVarietyWithTypes, PokedexListResponse } from "@/app/utils/types";
import PokedexSidebar from "@/app/components/sidebar-pokedex/PokedexSidebar";
import PokemonCard from "@/app/components/PokemonCard";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 48;

export default function PokedexPage() {
  const [generation, setGeneration] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const [flatVarieties, setFlatVarieties] = useState<FlatVarietyWithTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isFetchingMore = useRef(false);

  // This effect handles the initial load and resets the list when filters change.
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      isFetchingMore.current = false;

      try {
        let response: ApiResponse<FlatVarietyWithTypes[] | PokedexListResponse>;

        if (generation) {
          response = await getPokemonByGeneration(generation);
          if (response.data && !response.error) {
            setFlatVarieties(response.data as FlatVarietyWithTypes[]);
            setHasMore(false);
          }
        } else {
          // Pass filters to the API for the initial load
          response = await getPokedexList(PAGE_SIZE, 0, search, selectedTypes);
          if (response.data && !response.error) {
            const paginatedData = response.data as PokedexListResponse;
            setFlatVarieties(paginatedData.results);
            setHasMore(paginatedData.results.length < paginatedData.count);
          }
        }

        if (response.error) {
            setError(response.error);
            setFlatVarieties([]);
            setHasMore(false);
        }

      } catch  {
        setError("Failed to fetch Pokémon data.");
        setFlatVarieties([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [generation, search, selectedTypes]);


  // This function fetches the next page of items.
  const loadMoreItems = useCallback(async () => {
    if (isFetchingMore.current || generation || !hasMore) return;
    isFetchingMore.current = true;
    
    const offset = flatVarieties.length;
    
    const response = await getPokedexList(PAGE_SIZE, offset, search, selectedTypes);

    if (response.data && !response.error) {
      const paginatedData = response.data as PokedexListResponse;
      if (paginatedData.results.length > 0) {
        setFlatVarieties((prev) => [...prev, ...paginatedData.results]);
        setHasMore(flatVarieties.length + paginatedData.results.length < paginatedData.count);
      } else {
        setHasMore(false);
      }
    }
    
    isFetchingMore.current = false;
  }, [flatVarieties, generation, hasMore, search, selectedTypes]);


  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMoreItems();
        }
      },
      { rootMargin: "200px" }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading, loadMoreItems]);

  const filteredVarieties = flatVarieties;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PokedexSidebar
        search={search}
        setSearch={setSearch}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        generation={generation}
        setGeneration={setGeneration}
      />

      <main className="flex-1 ml-[450px] w-full">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Pokédex</h1>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-full max-w-[200px]">
                  <div className="relative group block p-4 h-full w-full">
                    <div className="absolute inset-0 h-full w-full pointer-events-none">
                      <div className="bg-neutral-200 dark:bg-slate-800/[0.8] rounded-3xl h-full w-full" />
                    </div>
                    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
                      <Skeleton className="h-20 w-20 rounded-full bg-muted" />
                      <Skeleton className="h-4 w-[100px] bg-muted" />
                      <Skeleton className="h-3 w-[60px] bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : filteredVarieties.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No Pokémon found for this search/filter.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center place-content-center">
                {filteredVarieties.map((poke, index) => (
                  <div key={`${poke.id}-${poke.name}-${index}`} className="w-full max-w-[200px]">
                    <PokemonCard
                      id={poke.id}
                      name={poke.name}
                      sprite={poke.sprite}
                      types={poke.types}
                    />
                  </div>
                ))}
              </div>
              <div ref={loaderRef} className="h-16 flex justify-center items-center mt-8">
                {hasMore && !loading && (
                  <span className="text-muted-foreground">Loading more...</span>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}