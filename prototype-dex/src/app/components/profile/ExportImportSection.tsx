"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { syncGuestData } from "@/app/utils/api";
import { toast } from "sonner";
import { Download, Upload, FileText, Loader2 } from "lucide-react";

export default function ExportImportSection() {
  const { user, favorites, caught, refreshProfile } = useAuth();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      app: "protoDex",
      version: "1.0",
      user: user?.username || "guest",
      exportedAt: new Date().toISOString(),
      favorites,
      caught,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `protodex-${user?.username || "guest"}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Pokédex backup exported!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const favsToImport = Array.isArray(parsed.favorites) ? parsed.favorites : [];
      const caughtToImport = Array.isArray(parsed.caught) ? parsed.caught : [];

      if (favsToImport.length === 0 && caughtToImport.length === 0) {
        toast.error("File does not contain valid favorites or caught Pokémon data.");
        setImporting(false);
        return;
      }

      if (user) {
        // Sync directly with cloud database
        const res = await syncGuestData(favsToImport, caughtToImport);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(
            `Imported ${res.data?.syncedFavoritesCount || favsToImport.length} favorites and ${res.data?.syncedCaughtCount || caughtToImport.length} caught Pokémon!`
          );
          await refreshProfile();
        }
      } else {
        // Guest mode: merge into local storage
        const currentFavsRaw = localStorage.getItem("protodex_guest_favorites");
        const currentCaughtRaw = localStorage.getItem("protodex_guest_caught");
        const currentFavs: string[] = currentFavsRaw ? JSON.parse(currentFavsRaw) : [];
        const currentCaught: string[] = currentCaughtRaw ? JSON.parse(currentCaughtRaw) : [];

        const mergedFavs = Array.from(new Set([...currentFavs, ...favsToImport]));
        const mergedCaught = Array.from(new Set([...currentCaught, ...caughtToImport]));

        localStorage.setItem("protodex_guest_favorites", JSON.stringify(mergedFavs));
        localStorage.setItem("protodex_guest_caught", JSON.stringify(mergedCaught));

        toast.success(`Imported ${favsToImport.length} favorites & ${caughtToImport.length} caught Pokémon into local session!`);
        window.location.reload();
      }
    } catch {
      toast.error("Failed to parse JSON file. Please ensure it is a valid ProtoDex export.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-6 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 pb-4 border-b border-border-crisp mb-4">
          <div className="w-8 h-8 rounded-lg bg-surface-container-low border border-border-crisp flex items-center justify-center text-primary">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Archival Backup
            </h2>
            <p className="font-caption-label text-[11px] text-on-surface-variant">
              EXPORT / IMPORT PORTABLE POKÉDEX DATA
            </p>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
          Export your complete registry (favorites and caught Pokémon) as an open JSON archive, or import an existing backup to restore your data.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 pt-2">
        <button
          onClick={handleExport}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-slate-panel border border-border-crisp text-xs font-caption-label font-bold uppercase tracking-wider text-on-surface transition-colors snappy-btn"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>Export JSON Archive</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-slate-panel border border-border-crisp text-xs font-caption-label font-bold uppercase tracking-wider text-on-surface transition-colors snappy-btn"
        >
          {importing ? (
            <Loader2 className="w-4 h-4 animate-spin text-secondary" />
          ) : (
            <Upload className="w-4 h-4 text-secondary" />
          )}
          <span>Import JSON Archive</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  );
}
