// src/controllers/pokeController.js

import { fetchPokemon, fetchPokemonList } from '../utils/fetchFromPokeAPI.js';

export const getPokemonDetails = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchPokemon(nameOrId);
    res.json(data);
  } catch (err) {
    res.status(404).json({ message: 'Pokémon not found' });
  }
};

export const getPokemonList = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const data = await fetchPokemonList(limit, offset);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Pokémon list' });
  }
};
