"use client";

import { useState, useEffect } from "react";
import { Search, Layers, ListChecks, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import Image from "next/image";
import SearchBar from "./SearchBar";
import TypeFilterChips from "./TypeFilterChips";
import GenerationRadioGroup from "./GenerationRadioGroup";
import { getAllPokemonTypes } from "@/app/utils/api";
import { motion, AnimatePresence } from "framer-motion";

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
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function PokedexSidebar({
  search,
  setSearch,
  selectedTypes,
  setSelectedTypes,
  generation,
  setGeneration,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  onClose,
}: PokedexSidebarProps) {
  const [allTypes, setAllTypes] = useState<string[]>([]);

  useEffect(() => {
    getAllPokemonTypes().then((res) => {
      if (res.data) setAllTypes(res.data);
    });
  }, []);

  const glassStyles = "bg-card/80 backdrop-blur-2xl border-r border-border shadow-2xl";
  const isExpanded = !isCollapsed || isMobileOpen;

  return (
    <motion.aside
      animate={{ width: isExpanded ? "22rem" : "5rem" }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className={`${glassStyles} h-full flex flex-col text-foreground fixed top-0 left-0 z-40 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border flex-shrink-0">
        <Image src="/pokedex.svg" width={32} height={32} alt="Pokédex" />
        <AnimatePresence>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="ml-2 text-xl font-bold tracking-wider select-none font-retro whitespace-nowrap"
            >
              Pokédex
            </motion.span>
          )}
        </AnimatePresence>
        {/* Desktop Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-2 rounded-full hover:bg-accent hidden lg:block"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </button>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="ml-auto p-2 rounded-full hover:bg-accent lg:hidden"
          aria-label="Close filters"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6 px-4 py-6 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="font-retro text-primary text-sm">Search</label>
                <SearchBar value={search} onSearch={setSearch} />
              </div>
              <TypeFilterChips
                allTypes={allTypes}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
              />
              <GenerationRadioGroup
                generations={GENERATIONS}
                selected={generation}
                setSelected={setGeneration}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
