import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Simple in-memory queue for rate limiting outgoing requests to PokeAPI
let lastRequestTime = 0;
const MIN_INTERVAL = 100; // 100ms between requests (~10/sec)

export const fetchPokemon = async (nameOrId) => {
  // Queue requests to avoid hitting PokeAPI's rate limit
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL - (now - lastRequestTime));
  if (wait > 0) await new Promise(res => setTimeout(res, wait));
  lastRequestTime = Date.now();

  const url = `${BASE_URL}/pokemon/${nameOrId.toLowerCase()}`;
  const { data } = await axios.get(url);
  return data;
};

export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
  const { data } = await axios.get(url);
  return data;
};
