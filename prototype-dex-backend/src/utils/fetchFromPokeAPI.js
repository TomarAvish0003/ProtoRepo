import axios from "axios";
import pLimit from "p-limit";
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

// Use p-limit to create a queue that ensures only 1 request is active at a time.
const limit = pLimit(1);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Core fetcher function with caching, in-flight request deduplication, and retries.
export const fetchFromPokeAPI = async (endpoint, params = {}, retries = 3) => {
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`.toLowerCase();
  
  if (genericCache.has(cacheKey)) {
    return genericCache.get(cacheKey);
  }
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const fetchPromise = limit(async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data } = await axios.get(`${BASE_URL}/${endpoint}`, { params });
        genericCache.set(cacheKey, data);
        return data;
      } catch (err) {
        if (err.response?.status === 429 && attempt < retries) {
          await delay(1000 * (attempt + 1));
        } else {
          throw err;
        }
      }
    }
    throw new Error(`Failed to fetch ${endpoint} after ${retries} retries.`);
  });

  inFlightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
};

// --- Specific Data Fetchers ---

export const fetchPokemon = async (nameOrId) => {
  const key = String(nameOrId).toLowerCase();
  if (pokemonDetailCache.has(key)) return pokemonDetailCache.get(key);

  const data = await fetchFromPokeAPI(`pokemon/${key}`);
  if (data) {
    pokemonDetailCache.set(key, data);
  }
  return data;
};

export const fetchPokemonGridMinimal = async (nameOrId) => {
  const key = String(nameOrId).toLowerCase();
  if (pokemonCache.has(key)) return pokemonCache.get(key);

  const data = await fetchPokemon(key);
  if (!data) return null;

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

export const fetchPokemonSpecies = async (nameOrId) => {
  const key = String(nameOrId).toLowerCase();
  if (speciesCache.has(key)) return speciesCache.get(key);
  const data = await fetchFromPokeAPI(`pokemon-species/${key}`);
  if (data) speciesCache.set(key, data);
  return data;
};

export const fetchPokemonList = (limit = 20, offset = 0) =>
  fetchFromPokeAPI("pokemon", { limit, offset });

export const fetchType = async (nameOrId) => {
  const key = String(nameOrId).toLowerCase();
  if (typeCache.has(key)) return typeCache.get(key);
  const data = await fetchFromPokeAPI(`type/${key}`);
  if (data) typeCache.set(key, data);
  return data;
};

export const fetchGeneration = (genId) =>
  fetchFromPokeAPI(`generation/${genId}`);

export const fetchEvolutionChain = async (id) => {
  const key = String(id);
  if (evolutionCache.has(key)) return evolutionCache.get(key);
  const data = await fetchFromPokeAPI(`evolution-chain/${key}`);
  if (data) evolutionCache.set(key, data);
  return data;
};

export const fetchEncounters = (nameOrId) =>
  fetchFromPokeAPI(`pokemon/${String(nameOrId).toLowerCase()}/encounters`);

// --- Generic Fetchers ---
export const fetchAbility = (nameOrId) =>
  fetchFromPokeAPI(`ability/${String(nameOrId).toLowerCase()}`);
export const fetchMove = (nameOrId) =>
  fetchFromPokeAPI(`move/${String(nameOrId).toLowerCase()}`);
export const fetchItem = (nameOrId) =>
  fetchFromPokeAPI(`item/${String(nameOrId).toLowerCase()}`);
export const fetchEggGroup = (nameOrId) =>
  fetchFromPokeAPI(`egg-group/${String(nameOrId).toLowerCase()}`);
export const fetchLocation = (nameOrId) =>
  fetchFromPokeAPI(`location/${String(nameOrId).toLowerCase()}`);
export const fetchLocationArea = (nameOrId) =>
  fetchFromPokeAPI(`location-area/${String(nameOrId).toLowerCase()}`);
export const fetchPalParkArea = (nameOrId) =>
  fetchFromPokeAPI(`pal-park-area/${String(nameOrId).toLowerCase()}`);
export const fetchRegion = (nameOrId) =>
  fetchFromPokeAPI(`region/${String(nameOrId).toLowerCase()}`);
export const fetchEvolutionTrigger = (nameOrId) =>
  fetchFromPokeAPI(`evolution-trigger/${String(nameOrId).toLowerCase()}`);
export const fetchPokedex = (nameOrId) =>
  fetchFromPokeAPI(`pokedex/${String(nameOrId).toLowerCase()}`);
export const fetchVersion = (nameOrId) =>
  fetchFromPokeAPI(`version/${String(nameOrId).toLowerCase()}`);
export const fetchVersionGroup = (nameOrId) =>
  fetchFromPokeAPI(`version-group/${String(nameOrId).toLowerCase()}`);