// src/utils/fetchFromPokeAPI.js

import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemon = async (nameOrId) => {
  const url = `${BASE_URL}/pokemon/${nameOrId.toLowerCase()}`;
  const { data } = await axios.get(url);
  return data;
};

export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
  const { data } = await axios.get(url);
  return data;
};
