import { fetchPokemonList, fetchPokemon } from './fetchFromPokeAPI.js';
import { pokemonCache } from '../cache/pokemonCache.js';
import pLimit from 'p-limit';
import axios from 'axios';

const typeCache = new Map();
const limitConcurrency = pLimit(8); // max 8 requests at a time

async function getPokemonTypes(name) {
  if (typeCache.has(name)) return typeCache.get(name);
  try {
    const res = await fetchPokemon(name);
    const types = res?.types?.map((t) => t.type.name) || [];
    typeCache.set(name, types);
    return types;
  } catch (e) {
    console.warn(`[TypeFetch] Failed for ${name}: ${e.code || e.message}`);
    return [];
  }
}

export async function preloadAllPokemon(limit = 1008) {
  console.log("[Cache] 🔄 Preloading full Pokémon list...");

  const list = await fetchPokemonList(limit, 0);
  if (!list || !Array.isArray(list.results)) {
    console.error("[Cache] ❌ Failed to fetch Pokémon list.");
    return;
  }

  const enriched = await Promise.all(
    list.results.map((p) =>
      limitConcurrency(async () => {
        const id = Number(p.url.split("/").filter(Boolean).pop());
        const types = await getPokemonTypes(p.name);
        return { name: p.name, id, types };
      })
    )
  );

  pokemonCache.all = enriched;
  pokemonCache.lastUpdated = new Date();
  pokemonCache.byGeneration = {};

  console.log(`[Cache] ✅ Cached ${enriched.length} Pokémon.`);

  // Preload generation subsets
  try {
    const generations = Array.from({ length: 9 }, (_, i) => i + 1);
    for (const genId of generations) {
      const { data } = await axios.get(
        `https://pokeapi.co/api/v2/generation/${genId}/`
      );
      const speciesSet = new Set(data.pokemon_species.map((p) => p.name));
      pokemonCache.byGeneration[genId] = enriched.filter((p) =>
        speciesSet.has(p.name)
      );
    }
    console.log(`[Cache] ✅ Built subsets for all generations.`);
  } catch (e) {
    console.warn("[Cache] ⚠️ Generation subset preload failed:", e.message);
  }
}
