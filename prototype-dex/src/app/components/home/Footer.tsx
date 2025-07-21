// app/components/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-12 border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-primary">Pokédex</span>
          <span className="text-xs text-muted-foreground">by Avish</span>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="hover:underline text-foreground">
            Home
          </Link>
          <Link href="/pokedex" className="hover:underline text-foreground">
            Pokédex
          </Link>
          <Link href="/favorites" className="hover:underline text-foreground">
            Favorites
          </Link>
          <a
            href="https://pokeapi.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-foreground"
          >
            Powered by PokéAPI
          </a>
        </nav>
        <div className="text-xs text-muted-foreground text-center md:text-right">
          &copy; {new Date().getFullYear()} Pokédex App. All rights reserved.
          <br />
          Pokémon and All Respective Names are Trademark &copy; of Nintendo 1996-2025
        </div>
      </div>
    </footer>
  );
}
