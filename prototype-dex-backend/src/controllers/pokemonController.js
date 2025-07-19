import {
  fetchPokemon,
  fetchPokemonList,
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
} from '../utils/fetchFromPokeAPI.js';

import { pokemonCache, typeCache } from '../utils/cache.js';

// Optional: track in-flight fetches
const inFlight = new Map();

async function getPokemonData(name) {
  if (pokemonCache.has(name)) {
    return pokemonCache.get(name);
  }

  if (inFlight.has(name)) {
    return inFlight.get(name);
  }

  const promise = (async () => {
    try {
      const data = await fetchPokemon(name);
      const id = Number(data.id);

      if (!data.is_default || id > 1010) return null;

      const types = Array.isArray(data.types)
        ? data.types.map((t) => t.type.name)
        : [];

      const sprite =
        data.sprites?.other?.['official-artwork']?.front_default ||
        data.sprites?.front_default ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

      // Only return minimal fields!
      const enriched = { id, name: data.name, types, sprite };
      pokemonCache.set(name, enriched);
      return enriched;
    } catch (err) {
      console.error(`Failed to fetch data for ${name}:`, err.message);
      return null;
    } finally {
      inFlight.delete(name);
    }
  })();

  inFlight.set(name, promise);
  return promise;
}

// Helper
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- API ROUTES ---

// GET /api/pokemon
export const getPokemonList = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 48, 100);
    const offset = parseInt(req.query.offset) || 0;

    const data = await fetchPokemonList(limit, offset);
    const BATCH_SIZE = 10;
    const enriched = [];

    for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
      const batch = data.results.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((p) => getPokemonData(p.name)));
      enriched.push(...batchResults.filter(Boolean));

      if (i + BATCH_SIZE < data.results.length) {
        await delay(1000);
      }
    }

    // Only return minimal fields in the response!
    res.json({
      results: enriched,
      count: Math.min(data.count, 1010),
      limit,
      offset,
    });
  } catch (err) {
    console.error('getPokemonList error:', err);
    res.status(500).json({ message: 'Failed to fetch Pokémon list', error: err.message });
  }
};

// GET /api/pokemon/generation/:genId
export const getPokemonByGeneration = async (req, res) => {
  try {
    const { genId } = req.params;
    const data = await fetchGeneration(genId);

    let pokemon = data.pokemon_species.map((p) => ({
      name: p.name,
      id: Number(p.url.split("/").filter(Boolean).pop()),
    }));

    pokemon = pokemon.filter(p => p.id <= 1010);
    pokemon.sort((a, b) => a.id - b.id);

    const BATCH_SIZE = 10;
    const enriched = [];

    for (let i = 0; i < pokemon.length; i += BATCH_SIZE) {
      const batch = pokemon.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((p) => getPokemonData(p.name)));
      enriched.push(...batchResults.filter(Boolean));

      if (i + BATCH_SIZE < pokemon.length) {
        await delay(1000);
      }
    }

    res.json(enriched);
  } catch (err) {
    console.error('getPokemonByGeneration error:', err);
    res.status(500).json({ message: 'Failed to fetch Pokémon for generation', error: err.message });
  }
};

// ... (other endpoints unchanged, as above) ...
// GET /api/pokemon/:nameOrId/encounters
export const getPokemonEncounters = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchEncounters(nameOrId);
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ message: "No encounter data found for this Pokémon." });
    }
    res.json(data);
  } catch (err) {
    console.error("getPokemonEncounters error:", err);
    res.status(500).json({ message: "Failed to fetch Pokémon encounter data" });
  }
};

// GET /api/pokemon/types
export const getPokemonTypes = async (req, res) => {
  try {
    const data = await fetchType('');
    const types = data.results
      .map((t) => t.name)
      .filter((t) => t !== "shadow" && t !== "unknown");
    res.json(types);
  } catch (err) {
    console.error('getPokemonTypes error:', err);
    res.status(500).json({ message: "Failed to fetch Pokémon types" });
  }
};

// GET /api/pokemon/:nameOrId
export const getPokemonDetails = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchPokemon(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getPokemonDetails error:', err);
    res.status(404).json({ message: 'Pokémon not found' });
  }
};

// GET /api/pokemon/species/:nameOrId
export const getPokemonSpecies = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchPokemonSpecies(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getPokemonSpecies error:', err);
    res.status(404).json({ message: 'Pokémon species not found' });
  }
};

// --- Remaining routes unchanged ---
export const getEvolutionChain = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchEvolutionChain(id);
    res.json(data);
  } catch (err) {
    console.error('getEvolutionChain error:', err);
    res.status(404).json({ message: 'Evolution chain not found' });
  }
};

export const getType = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchType(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getType error:', err);
    res.status(404).json({ message: 'Type not found' });
  }
};

export const getAbility = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchAbility(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getAbility error:', err);
    res.status(404).json({ message: 'Ability not found' });
  }
};

export const getMove = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchMove(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getMove error:', err);
    res.status(404).json({ message: 'Move not found' });
  }
};

export const getItem = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchItem(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getItem error:', err);
    res.status(404).json({ message: 'Item not found' });
  }
};

export const getEggGroup = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchEggGroup(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getEggGroup error:', err);
    res.status(404).json({ message: 'Egg group not found' });
  }
};

export const getLocation = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchLocation(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getLocation error:', err);
    res.status(404).json({ message: 'Location not found' });
  }
};

export const getLocationArea = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchLocationArea(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getLocationArea error:', err);
    res.status(404).json({ message: 'Location area not found' });
  }
};

export const getPalParkArea = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchPalParkArea(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getPalParkArea error:', err);
    res.status(404).json({ message: 'Pal Park area not found' });
  }
};

export const getRegion = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchRegion(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getRegion error:', err);
    res.status(404).json({ message: 'Region not found' });
  }
};

export const getEvolutionTrigger = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchEvolutionTrigger(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getEvolutionTrigger error:', err);
    res.status(404).json({ message: 'Evolution trigger not found' });
  }
};

export const getPokedex = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchPokedex(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getPokedex error:', err);
    res.status(404).json({ message: 'Pokedex not found' });
  }
};

export const getVersion = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchVersion(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getVersion error:', err);
    res.status(404).json({ message: 'Version not found' });
  }
};

export const getVersionGroup = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchVersionGroup(nameOrId);
    res.json(data);
  } catch (err) {
    console.error('getVersionGroup error:', err);
    res.status(404).json({ message: 'Version group not found' });
  }
};
