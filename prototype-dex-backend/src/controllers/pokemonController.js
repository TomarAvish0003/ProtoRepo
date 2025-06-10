// src/controllers/pokeController.js

import { fetchPokemon, fetchPokemonList } from '../utils/fetchFromPokeAPI.js';
import axios from 'axios';

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

export const getPokemonByGeneration = async (req, res) => {
  try {
    const { genId } = req.params;
    const { data } = await axios.get(`https://pokeapi.co/api/v2/generation/${genId}/`);
    const pokemon = data.pokemon_species.map((p) => ({
      name: p.name,
      id: Number(p.url.split("/").filter(Boolean).pop()),
    }));
    pokemon.sort((a, b) => a.id - b.id);
    res.json(pokemon);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Pokémon for generation', error: err.message });
  }
};
