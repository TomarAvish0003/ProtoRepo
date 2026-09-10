"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, Database, AlertOctagon } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime exception encountered:", error);
  }, [error]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 text-on-surface">
      <div className="w-full max-w-xl bg-charcoal-surface border border-border-crisp rounded-2xl p-6 sm:p-10 flex flex-col items-center text-center shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Subtle Cyber Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/40 rounded-tl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/40 rounded-br-2xl pointer-events-none" />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 text-[11px] font-mono font-bold tracking-wider uppercase mb-4">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>SYSTEM EXCEPTION // TERMINAL INTERRUPTION</span>
        </div>

        <h1 className="font-headline-sm text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Connection or Render Interruption
        </h1>
        <p className="font-subhead-kana text-xs sm:text-sm text-on-surface-variant/80 mt-1">
          システム内部エラーが発生しました。再試行してください。
        </p>

        <p className="font-body-sm text-sm text-on-surface-variant max-w-md mt-4">
          An unexpected error occurred during client synchronization. You can attempt to re-establish the connection or return to the main interface.
        </p>

        {error.digest && (
          <span className="font-mono text-[10px] text-on-surface-variant/60 bg-surface-container-low px-2 py-1 rounded mt-2">
            Digest: {error.digest}
          </span>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-caption-label text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg snappy-btn"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
          <Link
            href="/pokedex"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-border-crisp text-on-surface font-caption-label text-xs font-bold tracking-wider uppercase transition-all snappy-btn"
          >
            <Database className="w-4 h-4 text-on-surface-variant" />
            <span>Pokédex</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-border-crisp text-on-surface font-caption-label text-xs font-bold tracking-wider uppercase transition-all snappy-btn"
          >
            <Home className="w-4 h-4 text-on-surface-variant" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
