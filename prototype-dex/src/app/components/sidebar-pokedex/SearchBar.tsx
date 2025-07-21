"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

// FIX: The generic constraint `...args: any[]` is the standard and correct way to type a generic
// function wrapper like debounce. It allows it to accept any function and its arguments,
// which resolves the TypeScript error.
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;

  // This will now correctly infer the types of the arguments from the passed function (F).
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      // The result of func(...args) is cast to the expected return type.
      timeout = setTimeout(() => resolve(func(...args) as ReturnType<F>), waitFor);
    });
}

interface SearchBarProps {
  value: string;
  onSearch: (val: string) => void;
}

export default function SearchBar({ value, onSearch }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnSearch = useCallback(debounce(onSearch, 300), [onSearch]);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setInputValue(newTerm);
    debouncedOnSearch(newTerm.trim().toLowerCase());
  };
  
  const handleClear = () => {
    setInputValue("");
    onSearch(""); // Call immediately on clear
  };

  return (
    <div
      className="relative flex items-center bg-white/10 border border-white/20 shadow-lg backdrop-blur-md rounded-xl transition focus-within:ring-2 focus-within:ring-pink-400"
    >
      <Search className="absolute left-3 text-white/60 pointer-events-none" size={20} />
      <input
        type="text"
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-transparent text-white placeholder:text-slate-200/80 font-semibold tracking-wide focus-outline-none"
        placeholder="Search Pokémon..."
        value={inputValue}
        aria-label="Search Pokémon"
        onChange={handleChange}
      />
      {inputValue && (
        <button
          className="absolute right-2 p-1 text-white/60 hover:text-pink-300 transition rounded-full"
          aria-label="Clear search"
          onClick={handleClear}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
