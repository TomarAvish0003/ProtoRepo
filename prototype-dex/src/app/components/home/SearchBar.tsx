"use client";

import React, { forwardRef } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (searchTerm: string) => void;
}

// Forward ref to input element
const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onSearch }, ref) => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) {
        if (onSearch) onSearch(trimmed);
        router.push(`/pokemon/${trimmed.toLowerCase()}`);
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-xl mx-auto p-4 rounded-xl shadow bg-card"
      >
        <input
          ref={ref}
          type="text"
          placeholder="Search Pokémon by name or ID"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border border-border rounded px-3 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition"
          style={{ fontFamily: "var(--font-sans)" }}
          aria-label="Search Pokémon by name or ID"
        />

        <button
          type="submit"
          className="bg-primary text-primary-foreground py-2 rounded font-semibold hover:bg-primary/90 transition-colors duration-200"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Search
        </button>
      </form>
    );
  }
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
