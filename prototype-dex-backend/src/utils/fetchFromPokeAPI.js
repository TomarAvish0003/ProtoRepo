import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';
let lastRequestTime = 0;
const MIN_INTERVAL = 1000; // 1 second between requests

export const fetchPokemon = async (nameOrId, retries = 3) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const now = Date.now();
    const wait = Math.max(0, MIN_INTERVAL - (now - lastRequestTime));
    if (wait > 0) await new Promise(res => setTimeout(res, wait));
    lastRequestTime = Date.now();

    const url = `${BASE_URL}/pokemon/${nameOrId.toLowerCase()}`;
    try {
      const { data } = await axios.get(url);
      return data;
    } catch (err) {
      if (err.response && err.response.status === 429 && attempt < retries) {
        // Wait even longer before retrying
        await new Promise(res => setTimeout(res, 2000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Too many requests to PokeAPI");
};

export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
  const { data } = await axios.get(url);
  return data;
};
