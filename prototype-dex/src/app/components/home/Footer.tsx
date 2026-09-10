import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-border-crisp mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-inset-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-desktop items-start pb-inset-lg">
          <div className="md:col-span-2 flex flex-col gap-inset-xs">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-primary font-extrabold uppercase">
                ProtoDex
              </span>
              <span className="font-caption-label text-[10px] text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded font-bold">
                v1.0
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1">
              A modern Pokédex, tournament team builder, and damage calculator for competitive Pokémon trainers and players.
            </p>
          </div>

          <div className="flex flex-col gap-inset-xs">
            <span className="font-caption-label text-caption-label text-on-surface-variant uppercase font-bold">
              Navigation
            </span>
            <nav className="flex flex-col gap-1.5 font-body-sm text-body-sm">
              <Link href="/pokedex" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Pokédex (全国図鑑)
              </Link>
              <Link href="/" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Home (ホーム)
              </Link>
              <Link href="/builder" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Team Builder (チーム編成)
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-inset-xs">
            <span className="font-caption-label text-caption-label text-on-surface-variant uppercase font-bold">
              Trainer Tools
            </span>
            <nav className="flex flex-col gap-1.5 font-body-sm text-body-sm">
              <Link href="/caught" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Caught Pokémon (捕獲)
              </Link>
              <Link href="/favorites" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Favorite Pokémon (お気に入り)
              </Link>
              <Link href="/profile" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Trainer Profile (トレーナー情報)
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-inset-sm pt-inset-md font-caption-label text-caption-label text-on-surface-variant border-t border-border-crisp">
          <div className="flex items-center gap-inset-sm">
            <span>PROTODEX • GENERATION I–IX</span>
          </div>
          <span>Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak, and Creatures Inc.</span>
        </div>
      </div>
    </footer>
  );
}
