export const pokemonCache = new Map();
export const pokemonDetailCache = new Map();
export const speciesCache = new Map();
export const evolutionCache = new Map();
export const typeCache = new Map();
export const genericCache = new Map();
export const inFlightRequests = new Map();

export const clearAllCaches = () => {
  pokemonCache.clear();
  pokemonDetailCache.clear();
  speciesCache.clear();
  evolutionCache.clear();
  typeCache.clear();
  genericCache.clear();
  inFlightRequests.clear();
};
