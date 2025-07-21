"use client";
import { useState, useRef } from "react";
import { getFavorites, getCaught, addFavorite, addCaught } from "@/app/utils/api";

export default function ExportImportSection() {
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const [favRes, caughtRes] = await Promise.all([
      getFavorites(token),
      getCaught(token),
    ]);
    if (favRes.data && caughtRes.data) {
      const data = {
        favorites: favRes.data,
        caught: caughtRes.data,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pokemon-profile.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportMsg(null);
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.favorites) || !Array.isArray(data.caught)) {
        setImportError("Invalid file format.");
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        setImportError("You must be logged in.");
        return;
      }
      let favAdded = 0, caughtAdded = 0;
      for (const name of data.favorites) {
        await addFavorite(token, name);
        favAdded++;
      }
      for (const name of data.caught) {
        await addCaught(token, name);
        caughtAdded++;
      }
      setImportMsg(`Imported ${favAdded} favorites and ${caughtAdded} caught Pokémon!`);
    } catch {
      setImportError("Failed to import. Please check your file.");
    }
  };

  return (
    <div
      className="relative p-[2px] rounded-xl h-full"
      style={{
        background: "linear-gradient(270deg, #facc15, #a855f7, #06b6d4, #facc15)",
        backgroundSize: "600% 600%",
        animation: "gradient-move 6s ease infinite",
      }}
    >
      <div className="rounded-xl bg-[rgba(24,24,27,0.85)] backdrop-blur-lg border border-white/10 shadow-xl p-6 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight mb-4">Export / Import</h3>
          <div className="flex flex-col gap-3 mb-4">
            <button
              className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-green-700 transition font-medium"
              onClick={handleExport}
            >
              Export Profile (JSON)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
              aria-label="Import profile JSON"
            />
            <button
              className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition font-medium"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Profile (JSON)
            </button>
          </div>
        </div>
        <div>
          {importMsg && <div className="text-green-400 text-sm mb-2">{importMsg}</div>}
          {importError && <div className="text-red-400 text-sm mb-2">{importError}</div>}
        </div>
      </div>
    </div>
  );
}
