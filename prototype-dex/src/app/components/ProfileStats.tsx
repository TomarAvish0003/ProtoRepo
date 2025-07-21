"use client";
import { useEffect, useState } from "react";
import { getFavorites, getCaught, getPokedexList } from "@/app/utils/api";
import { Star, CheckCircle2, Database } from "lucide-react"; // Lucide icons

export default function ProfileStats() {
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);
  const [caughtCount, setCaughtCount] = useState<number | null>(null);
  const [totalPokemon, setTotalPokemon] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getFavorites(token).then((res) => {
      if (res.data) setFavoriteCount(res.data.length);
    });
    getCaught(token).then((res) => {
      if (res.data) setCaughtCount(res.data.length);
    });
    getPokedexList(0, 0).then((res) => {
      if (res.data) setTotalPokemon(res.data.count);
      else setTotalPokemon(1025);
    });
  }, []);

  const percent = (caughtCount && totalPokemon)
    ? Math.round((caughtCount / totalPokemon) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 mt-2 w-full">
      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
        <span className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          <Star className="w-4 h-4 text-yellow-500" /> Favorites: {favoriteCount ?? "—"}
        </span>
        <span className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600" /> Caught: {caughtCount ?? "—"}
        </span>
        <span className="flex items-center gap-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          <Database className="w-4 h-4 text-gray-500" /> Total: {totalPokemon ?? "—"}
        </span>
      </div>
      <div className="mt-1 w-full">
        <div className="flex justify-between text-xs mb-1 px-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">Completion</span>
          <span className="font-bold text-green-700 dark:text-green-300">
            {caughtCount !== null && totalPokemon ? `${percent}%` : "—"}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
