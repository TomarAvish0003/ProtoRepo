"use client";

import { useState, useEffect } from "react";
import { Search, Layers, ListChecks } from "lucide-react";
import Image from "next/image";
import SearchBar from "./SearchBar";
import TypeFilterChips from "./TypeFilterChips";
import GenerationRadioGroup from "./GenerationRadioGroup";
import { getAllPokemonTypes } from "@/app/utils/api";

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group flex justify-center">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow-md transition group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

const GENERATIONS = [
  { id: 1, label: "Gen 1 (Kanto)" }, { id: 2, label: "Gen 2 (Johto)" },
  { id: 3, label: "Gen 3 (Hoenn)" }, { id: 4, label: "Gen 4 (Sinnoh)" },
  { id: 5, label: "Gen 5 (Unova)" }, { id: 6, label: "Gen 6 (Kalos)" },
  { id: 7, label: "Gen 7 (Alola)" }, { id: 8, label: "Gen 8 (Galar)" },
  { id: 9, label: "Gen 9 (Paldea)" },
];

interface PokedexSidebarProps {
  search: string;
  setSearch: (val: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  generation: number | null;
  setGeneration: (id: number | null) => void;
}

export default function PokedexSidebar({
  search,
  setSearch,
  selectedTypes,
  setSelectedTypes,
  generation,
  setGeneration,
}: PokedexSidebarProps) {
  const [isCollapsed, setCollapsed] = useState(false);
  const [allTypes, setAllTypes] = useState<string[]>([]);

  useEffect(() => {
    getAllPokemonTypes().then((res) => {
      if (res.data) setAllTypes(res.data);
    });
  }, []);

  const glassStyles = "bg-black/90 backdrop-blur-2xl border-r border-white/15 shadow-2xl";

  return (
    <aside
      className={`${glassStyles} h-screen transition-all duration-300 ${isCollapsed ? "w-16" : "w-[430px]"} fixed top-0 left-0 z-40 flex flex-col text-white`}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <Image src="/pokedex.svg" width={32} height={32} alt="Pokédex" />
        {!isCollapsed && (
          <span className="ml-2 text-[1.25rem] font-bold tracking-wider select-none font-retro">
            Pokédex
          </span>
        )}
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="ml-auto p-2 rounded-full hover:bg-white/10 transition"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Image src="/sidebar.svg" alt="Toggle sidebar" width={28} height={28} className="transition-transform filter-white-svg" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-5 px-3 py-6 overflow-y-auto">
        {isCollapsed ? (
          <Tooltip label="Search">
            <div className="my-2"><Search className="mx-auto text-white/80" size={22} /></div>
          </Tooltip>
        ) : (
          <div className="mb-1">
            <SearchBar value={search} onSearch={setSearch} />
          </div>
        )}

        {isCollapsed ? (
          <Tooltip label="Filter by Type">
            <div className="my-2"><Layers className="mx-auto text-yellow-300" size={22} /></div>
          </Tooltip>
        ) : (
          <TypeFilterChips
            allTypes={allTypes}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
          />
        )}

        {isCollapsed ? (
          <Tooltip label="Filter by Generation">
            <div className="my-2"><ListChecks className="mx-auto text-pink-400" size={22} /></div>
          </Tooltip>
        ) : (
          <div className="mt-2">
            <GenerationRadioGroup
              generations={GENERATIONS}
              selected={generation}
              setSelected={setGeneration}
            />
          </div>
        )}
      </div>
    </aside>
  );
}