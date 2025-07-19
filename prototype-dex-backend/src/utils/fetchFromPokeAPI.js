import axios from "axios";
import {
  pokemonCache,
  pokemonDetailCache,
  speciesCache,
  typeCache,
  evolutionCache,
  genericCache,
  inFlightRequests,
} from "./cache.js";

const BASE_URL = "https://pokeapi.co/api/v2";
let lastRequestTime = 0;
const MIN_INTERVAL = 1000; // 1 second between requests

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchFromPokeAPI = async (endpoint, params = {}, retries = 3) => {
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`.toLowerCase();
  if (genericCache.has(cacheKey)) return genericCache.get(cacheKey);
  if (inFlightRequests.has(cacheKey)) return inFlightRequests.get(cacheKey);

  const fetchPromise = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const now = Date.now();
      const wait = Math.max(0, MIN_INTERVAL - (now - lastRequestTime));
      if (wait > 0) await delay(wait);
      lastRequestTime = Date.now();

      try {
        const { data } = await axios.get(`${BASE_URL}/${endpoint}`, { params });
        genericCache.set(cacheKey, data);
        return data;
      } catch (err) {
        if (err.response?.status === 429 && attempt < retries) {
          await delay(2000 * (attempt + 1)); // exponential backoff
        } else {
          throw err;
        }
      }
    }
    throw new Error("Too many requests to PokeAPI");
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  try {
    const result = await fetchPromise;
    return result;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
};

// --- Pokémon Core ---

// Minimal object fetcher for grid/list
export const fetchPokemonGridMinimal = async (nameOrId) => {
  const key = nameOrId.toLowerCase();
  if (pokemonCache.has(key)) return pokemonCache.get(key);

  const data = await fetchFromPokeAPI(`pokemon/${key}`);

  const minimal = {
    id: data.id,
    name: data.name,
    types: Array.isArray(data.types) ? data.types.map(t => t.type.name) : [],
    sprite:
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`
  };

  pokemonCache.set(key, minimal);
  return minimal;
};

// Full object fetcher for detail pages
export const fetchPokemon = async (nameOrId) => {
  const key = nameOrId.toLowerCase();
  if (pokemonDetailCache.has(key)) return pokemonDetailCache.get(key);

  const data = await fetchFromPokeAPI(`pokemon/${key}`);

  pokemonDetailCache.set(key, data);
  return data;
};

// Other fetchers remain unchanged
export const fetchPokemonSpecies = async (nameOrId) => {
  const key = nameOrId.toLowerCase();
  if (speciesCache.has(key)) return speciesCache.get(key);
  const data = await fetchFromPokeAPI(`pokemon-species/${key}`);
  speciesCache.set(key, data);
  return data;
};

export const fetchPokemonList = (limit = 20, offset = 0) =>
  fetchFromPokeAPI("pokemon", { limit, offset });

export const fetchType = async (nameOrId) => {
  const key = nameOrId.toLowerCase();
  if (typeCache.has(key)) return typeCache.get(key);
  const data = await fetchFromPokeAPI(`type/${key}`);
  typeCache.set(key, data);
  return data;
};

export const fetchGeneration = async (genId) =>
  fetchFromPokeAPI(`generation/${genId}`);

export const fetchEvolutionChain = async (id) => {
  const key = String(id);
  if (evolutionCache.has(key)) return evolutionCache.get(key);
  const data = await fetchFromPokeAPI(`evolution-chain/${key}`);
  evolutionCache.set(key, data);
  return data;
};

export const fetchAbility = (nameOrId) =>
  fetchFromPokeAPI(`ability/${nameOrId.toLowerCase()}`);

export const fetchMove = (nameOrId) =>
  fetchFromPokeAPI(`move/${nameOrId.toLowerCase()}`);

export const fetchItem = (nameOrId) =>
  fetchFromPokeAPI(`item/${nameOrId.toLowerCase()}`);

export const fetchEggGroup = (nameOrId) =>
  fetchFromPokeAPI(`egg-group/${nameOrId.toLowerCase()}`);

export const fetchLocation = (nameOrId) =>
  fetchFromPokeAPI(`location/${nameOrId.toLowerCase()}`);

export const fetchLocationArea = (nameOrId) =>
  fetchFromPokeAPI(`location-area/${nameOrId.toLowerCase()}`);

export const fetchPalParkArea = (nameOrId) =>
  fetchFromPokeAPI(`pal-park-area/${nameOrId.toLowerCase()}`);

export const fetchRegion = (nameOrId) =>
  fetchFromPokeAPI(`region/${nameOrId.toLowerCase()}`);

export const fetchEvolutionTrigger = (nameOrId) =>
  fetchFromPokeAPI(`evolution-trigger/${nameOrId.toLowerCase()}`);

export const fetchPokedex = (nameOrId) =>
  fetchFromPokeAPI(`pokedex/${nameOrId.toLowerCase()}`);

export const fetchVersion = (nameOrId) =>
  fetchFromPokeAPI(`version/${nameOrId.toLowerCase()}`);

export const fetchVersionGroup = (nameOrId) =>
  fetchFromPokeAPI(`version-group/${nameOrId.toLowerCase()}`);

// In fetchFromPokeAPI.js

export const fetchEncounters = async (nameOrId) => {
  const key = String(nameOrId).toLowerCase();
  // Optionally cache this in genericCache
  const cacheKey = `pokemon-encounters-${key}`;
  if (genericCache.has(cacheKey)) return genericCache.get(cacheKey);
  const data = await fetchFromPokeAPI(`pokemon/${key}/encounters`);
  genericCache.set(cacheKey, data);
  return data;
};
