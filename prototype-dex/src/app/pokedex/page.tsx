"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getPokedexList,
  getPokemonByGeneration,
  ApiResponse,
} from "@/app/utils/api";
import {
  FlatVarietyWithTypes,
  PokedexListResponse
} from "@/app/utils/types";
import PokedexSidebar from "@/app/components/sidebar-pokedex/PokedexSidebar";
import PokemonCard from "@/app/components/PokemonCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Press_Start_2P } from "next/font/google";

const PAGE_SIZE = 48;

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-retro",
});

export default function PokedexPage() {
  const [generation, setGeneration] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [flatVarieties, setFlatVarieties] = useState<FlatVarietyWithTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isFetchingMore = useRef(false);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSidebarCollapsed(window.innerWidth < 1280);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Effect for fetching data when filters change
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
      } catch {
        setError("Failed to fetch Pokémon data.");
        setFlatVarieties([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [generation, search, selectedTypes]);

  // Function for infinite scrolling
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
  }, [flatVarieties.length, generation, hasMore, search, selectedTypes]);

  // Intersection Observer for triggering infinite scroll
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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PokedexSidebar
        search={search}
        setSearch={setSearch}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        generation={generation}
        setGeneration={setGeneration}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <motion.main
        className="flex-1 w-full"
        animate={{
          // Animate margin based on sidebar state on large screens
          marginLeft: isSidebarCollapsed ? '5rem' : '22rem'
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden fixed top-4 right-4 z-20 p-2 bg-card rounded-md border"
            aria-label="Open filters"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-3xl font-retro mb-8 text-center">Pokédex</h1>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-full">
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : flatVarieties.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No Pokémon found for this search/filter.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {flatVarieties.map((poke, index) => (
                  <PokemonCard
                    key={`${poke.id}-${poke.name}-${index}`}
                    id={poke.id}
                    name={poke.name}
                    sprite={poke.sprite}
                    types={poke.types}
                  />
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
      </motion.main>
    </div>
  );
}
