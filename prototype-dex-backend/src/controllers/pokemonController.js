import { eq, or, and, gte, lte, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { pokemon, apiCache } from "../db/schema.js";
import {
  fetchFromPokeAPI,
  fetchPokemon,
  fetchType,
  fetchPokemonSpecies,
  fetchEvolutionChain,
  fetchAbility,
  fetchMove,
  fetchItem,
  fetchEggGroup,
  fetchLocation,
  fetchLocationArea,
  fetchPalParkArea,
  fetchRegion,
  fetchEvolutionTrigger,
  fetchPokedex,
  fetchVersion,
  fetchVersionGroup,
  fetchGeneration,
  fetchEncounters,
} from "../utils/fetchFromPokeAPI.js";

const GENERATION_RANGES = {
  1: { start: 1, end: 151 },
  2: { start: 152, end: 251 },
  3: { start: 252, end: 386 },
  4: { start: 387, end: 493 },
  5: { start: 494, end: 649 },
  6: { start: 650, end: 721 },
  7: { start: 722, end: 809 },
  8: { start: 810, end: 905 },
  9: { start: 906, end: 1025 },
};

// In-memory cache for static Pokémon table to avoid frequent cloud database roundtrips
let cachedAllPokemon = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

async function getAllPokemonCached() {
  const now = Date.now();
  if (cachedAllPokemon && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedAllPokemon;
  }
  const all = await db.select().from(pokemon);
  cachedAllPokemon = all;
  lastCacheTime = now;
  return all;
}

export const getPokemonList = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 48;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search?.toLowerCase().trim();
    const types = req.query.types
      ? req.query.types.split(",").map((t) => t.toLowerCase().trim()).filter(Boolean)
      : [];

    let all = await getAllPokemonCached();

    if (search) {
      const cleanSearch = search.replace(/^#/, "");
      all = all.filter(
        (p) =>
          p.name.includes(cleanSearch) ||
          String(p.id) === cleanSearch ||
          String(p.id).padStart(4, "0") === cleanSearch
      );
    }

    if (types.length > 0) {
      all = all.filter((p) =>
        types.some((t) => p.types.map((x) => x.toLowerCase()).includes(t))
      );
    }

    const paginatedResults = all.slice(offset, offset + limit);

    res.json({
      results: paginatedResults,
      count: all.length,
    });
  } catch (err) {
    console.error("getPokemonList error:", err);
    res.status(500).json({ message: "Failed to get Pokémon list", error: err.message });
  }
};

export const getPokemonByGeneration = async (req, res) => {
  try {
    const genNum = parseInt(req.params.genId, 10);
    const range = GENERATION_RANGES[genNum];
    if (range) {
      const genPokemon = await db
        .select()
        .from(pokemon)
        .where(and(gte(pokemon.id, range.start), lte(pokemon.id, range.end)));
      return res.json(genPokemon);
    }

    // Fallback if genId is not 1-9
    const generationData = await fetchGeneration(req.params.genId);
    const genPokemonNames = new Set(generationData.pokemon_species.map((p) => p.name));
    const all = await getAllPokemonCached();
    const enriched = all.filter((p) => genPokemonNames.has(p.name));
    res.json(enriched);
  } catch (err) {
    console.error("getPokemonByGeneration error:", err);
    res.status(500).json({ message: "Failed to fetch Pokémon for generation", error: err.message });
  }
};

export const getPokemonBatch = async (req, res) => {
  const { names } = req.body;
  if (!Array.isArray(names)) {
    return res.status(400).json({ error: "The 'names' field must be an array." });
  }

  try {
    const cleanNames = names.map((n) => String(n).toLowerCase().trim());
    const numericIds = cleanNames.map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));

    const conditions = [];
    if (numericIds.length > 0) conditions.push(inArray(pokemon.id, numericIds));
    if (cleanNames.length > 0) conditions.push(inArray(pokemon.name, cleanNames));

    const pokemons = await db
      .select()
      .from(pokemon)
      .where(conditions.length > 1 ? or(...conditions) : conditions[0]);

    res.json({ pokemons });
  } catch (err) {
    console.error("getPokemonBatch error:", err);
    res.status(500).json({ message: "Failed to fetch Pokémon batch", error: err.message });
  }
};

export const getPokemonDetails = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const clean = String(nameOrId).toLowerCase().trim().replace(/^#/, "");
    const numId = parseInt(clean, 10);

    // 1. Check if we have cached details in the database
    const [row] = await db
      .select()
      .from(pokemon)
      .where(isNaN(numId) ? eq(pokemon.name, clean) : eq(pokemon.id, numId))
      .limit(1);

    if (row && row.details) {
      return res.json(row.details);
    }

    // 2. Fetch from PokeAPI
    const data = await fetchPokemon(clean);
    if (data && row) {
      // Async cache details in DB so subsequent requests are instant
      db.update(pokemon)
        .set({ details: data })
        .where(eq(pokemon.id, row.id))
        .catch(() => {});
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching Pokémon details:", err);
    res.status(404).json({ message: "Pokémon not found" });
  }
};

const simpleFetchHandler = (fetchFunction, resourceName, cachePrefix) => async (req, res) => {
  try {
    const { nameOrId, id } = req.params;
    const target = String(nameOrId || id).toLowerCase().trim();
    const key = `${cachePrefix}:${target}`;

    // 1. Check persistent SQLite/Turso cache first
    const [cached] = await db
      .select()
      .from(apiCache)
      .where(eq(apiCache.cacheKey, key))
      .limit(1);

    if (cached && cached.data) {
      return res.json(cached.data);
    }

    // 2. Fetch from PokeAPI if not yet in database
    const data = await fetchFunction(nameOrId || id);
    if (data) {
      db.insert(apiCache)
        .values({ cacheKey: key, data, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: apiCache.cacheKey,
          set: { data, updatedAt: new Date() },
        })
        .catch(() => {});
    }

    res.json(data);
  } catch (err) {
    console.error(`Error fetching ${resourceName}:`, err);
    res.status(404).json({ message: `${resourceName} not found` });
  }
};

export const getPokemonSpecies = simpleFetchHandler(fetchPokemonSpecies, "Pokémon species", "species");
export const getPokemonEncounters = simpleFetchHandler(fetchEncounters, "Pokémon encounters", "encounters");
export const getEvolutionChain = simpleFetchHandler(fetchEvolutionChain, "Evolution chain", "evolution");
export const getType = simpleFetchHandler(fetchType, "Type", "type");
export const getAbility = simpleFetchHandler(fetchAbility, "Ability", "ability");
export const getMove = simpleFetchHandler(fetchMove, "Move", "move");
export const getItem = simpleFetchHandler(fetchItem, "Item", "item");
export const getEggGroup = simpleFetchHandler(fetchEggGroup, "Egg group", "egggroup");
export const getLocation = simpleFetchHandler(fetchLocation, "Location", "location");
export const getLocationArea = simpleFetchHandler(fetchLocationArea, "Location area", "locarea");
export const getPalParkArea = simpleFetchHandler(fetchPalParkArea, "Pal Park area", "palpark");
export const getRegion = simpleFetchHandler(fetchRegion, "Region", "region");
export const getEvolutionTrigger = simpleFetchHandler(fetchEvolutionTrigger, "Evolution trigger", "evotrigger");
export const getPokedex = simpleFetchHandler(fetchPokedex, "Pokedex", "pokedex");
export const getVersion = simpleFetchHandler(fetchVersion, "Version", "version");
export const getVersionGroup = simpleFetchHandler(fetchVersionGroup, "Version group", "versiongroup");

export const getPokemonTypes = async (req, res) => {
  try {
    const data = await fetchFromPokeAPI("type");
    const types = data.results
      .map((t) => t.name)
      .filter((t) => t !== "shadow" && t !== "unknown");
    res.json(types);
  } catch (err) {
    console.error("getPokemonTypes error:", err);
    res.status(500).json({ message: "Failed to fetch Pokémon types" });
  }
};
