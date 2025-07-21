import fs from 'fs';
import path from 'path';
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
} from '../utils/fetchFromPokeAPI.js';

// --- Master Data Loader ---
let allPokemonListCache = null;

function loadAllPokemonFromFile() {
  if (allPokemonListCache) {
    return allPokemonListCache;
  }
  try {
    const filePath = path.resolve(process.cwd(), 'src/pokedex-cache.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    allPokemonListCache = JSON.parse(fileContents);
    console.log(`✅ Backend: Loaded ${allPokemonListCache.length} Pokémon from local cache.`);
    return allPokemonListCache;
  } catch (error) {
    console.error("❌ Backend: Could not read 'pokedex-cache.json'. Please run the seed script first with 'node src/scripts/seed.js'");
    return [];
  }
}

// Load the cache as soon as the server starts
const allPokemon = loadAllPokemonFromFile();

// --- API ROUTE HANDLERS ---

export const getPokemonList = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 48;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search?.toLowerCase();
    const types = req.query.types?.split(',');
    
    let filteredPokemon = allPokemon;
    if (search) {
      filteredPokemon = filteredPokemon.filter(p => p.name.includes(search) || String(p.id) === search);
    }
    if (types && types.length > 0) {
      filteredPokemon = filteredPokemon.filter(p => types.every(type => p.types.includes(type)));
    }

    const paginatedResults = filteredPokemon.slice(offset, offset + limit);

    res.json({
      results: paginatedResults,
      count: filteredPokemon.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get Pokémon list', error: err.message });
  }
};

export const getPokemonByGeneration = async (req, res) => {
    try {
      const { genId } = req.params;
      const generationData = await fetchGeneration(genId);
      
      const genPokemonNames = new Set(generationData.pokemon_species.map(p => p.name));
      const enriched = allPokemon.filter(p => genPokemonNames.has(p.name));
      
      res.json(enriched);
    } catch (err) {
      console.error('getPokemonByGeneration error:', err);
      res.status(500).json({ message: 'Failed to fetch Pokémon for generation', error: err.message });
    }
};

export const getPokemonBatch = async (req, res) => {
  const { names } = req.body;
  if (!Array.isArray(names)) {
    return res.status(400).json({ error: "The 'names' field must be an array." });
  }

  try {
    const promises = names.map(name => fetchPokemon(name));
    const results = await Promise.allSettled(promises);

    const pokemons = results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
      return { name: names[index], error: 'Not found' };
    });

    res.json({ pokemons });
  } catch (err) {
    console.error('getPokemonBatch error:', err);
    res.status(500).json({ message: 'Failed to fetch Pokémon batch', error: err.message });
  }
};

const simpleFetchHandler = (fetchFunction, resourceName) => async (req, res) => {
  try {
    const { nameOrId, id } = req.params;
    const data = await fetchFunction(nameOrId || id);
    res.json(data);
  } catch (err) {
    console.error(`Error fetching ${resourceName}:`, err);
    res.status(404).json({ message: `${resourceName} not found` });
  }
};

export const getPokemonDetails = simpleFetchHandler(fetchPokemon, 'Pokémon');
export const getPokemonSpecies = simpleFetchHandler(fetchPokemonSpecies, 'Pokémon species');
export const getPokemonEncounters = simpleFetchHandler(fetchEncounters, 'Pokémon encounters');
export const getEvolutionChain = simpleFetchHandler(fetchEvolutionChain, 'Evolution chain');
export const getType = simpleFetchHandler(fetchType, 'Type');
export const getAbility = simpleFetchHandler(fetchAbility, 'Ability');
export const getMove = simpleFetchHandler(fetchMove, 'Move');
export const getItem = simpleFetchHandler(fetchItem, 'Item');
export const getEggGroup = simpleFetchHandler(fetchEggGroup, 'Egg group');
export const getLocation = simpleFetchHandler(fetchLocation, 'Location');
export const getLocationArea = simpleFetchHandler(fetchLocationArea, 'Location area');
export const getPalParkArea = simpleFetchHandler(fetchPalParkArea, 'Pal Park area');
export const getRegion = simpleFetchHandler(fetchRegion, 'Region');
export const getEvolutionTrigger = simpleFetchHandler(fetchEvolutionTrigger, 'Evolution trigger');
export const getPokedex = simpleFetchHandler(fetchPokedex, 'Pokedex');
export const getVersion = simpleFetchHandler(fetchVersion, 'Version');
export const getVersionGroup = simpleFetchHandler(fetchVersionGroup, 'Version group');

export const getPokemonTypes = async (req, res) => {
  try {
    const data = await fetchFromPokeAPI('type');
    const types = data.results
      .map((t) => t.name)
      .filter((t) => t !== "shadow" && t !== "unknown");
    res.json(types);
  } catch (err) {
    console.error('getPokemonTypes error:', err);
    res.status(500).json({ message: "Failed to fetch Pokémon types" });
  }
};