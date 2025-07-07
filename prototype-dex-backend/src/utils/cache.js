// Typed caches (scoped per data type)
export const pokemonCache = new Map(); // for minimal grid objects
export const pokemonDetailCache = new Map(); // for full detail objects
export const speciesCache = new Map();
export const evolutionCache = new Map();
export const typeCache = new Map();

// Generic fallback cache (for any other endpoint)
export const genericCache = new Map();

// Deduplication map for in-flight requests
export const inFlightRequests = new Map();

/**
 * Optional: Clears all caches. Use only in dev or admin tools.
 */
export const clearAllCaches = () => {
  pokemonCache.clear();
  pokemonDetailCache.clear();
  speciesCache.clear();
  evolutionCache.clear();
  typeCache.clear();
  genericCache.clear();
  inFlightRequests.clear();
};
