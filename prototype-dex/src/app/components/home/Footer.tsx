import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-surface-container mt-16">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-inset-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-desktop items-start pb-inset-lg">
          <div className="md:col-span-2 flex flex-col gap-inset-xs">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-primary font-extrabold uppercase">
                protoDex ARCHIVE
              </span>
              <span className="font-caption-label text-[10px] text-[#ba0032] bg-[#ffdada] px-1.5 py-0.5 rounded font-bold">
                v4.2.0
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1">
              Contemporary Naturalis Pokémonic Field Compendium. Formatted and catalogued under modern Japanese typographic disciplines for researchers, collectors, and field rangers.
            </p>
          </div>

          <div className="flex flex-col gap-inset-xs">
            <span className="font-caption-label text-caption-label text-on-surface-variant uppercase font-bold">
              Editorial Registry
            </span>
            <nav className="flex flex-col gap-1.5 font-body-sm text-body-sm">
              <Link href="/pokedex" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Archival Index (全図鑑)
              </Link>
              <Link href="/" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Curated Exhibits (特設展示)
              </Link>
              <Link href="/pokemon/bulbasaur" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Anatomy &amp; Evolution (形態分析)
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-inset-xs">
            <span className="font-caption-label text-caption-label text-on-surface-variant uppercase font-bold">
              Field Telemetry
            </span>
            <nav className="flex flex-col gap-1.5 font-body-sm text-body-sm">
              <Link href="/user/captured" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Expedition Logs (踏査記録)
              </Link>
              <Link href="/team" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Tactical Synergy Lab (戦術試算)
              </Link>
              <Link href="/user/favorites" className="text-on-surface hover:text-primary transition-colors snappy-btn">
                Field Priorities (優先調査)
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-inset-sm pt-inset-md font-caption-label text-caption-label text-on-surface-variant border-t border-surface-container">
          <div className="flex items-center gap-inset-sm">
            <span>ARCHIVAL EDITION 2025</span>
            <span>•</span>
            <span>PUBLISHED IN KYOTO / TOKYO</span>
          </div>
          <span>© POKÉMON ARCHIVE LAB. ALL POKEMON RECORDS CATALOGUED.</span>
        </div>
      </div>
    </footer>
  );
}
