import express from 'express';
import auth from '../middleware/auth.js';
import { fetchPokemon } from '../utils/fetchFromPokeAPI.js';
import User from '../models/user.js';

const router = express.Router();

// Add favorite
router.post('/', auth, async (req, res) => {
  const { pokemon } = req.body;
  const user = await User.findById(req.user.id);
  if (!user.favorites.includes(pokemon)) user.favorites.push(pokemon);
  await user.save();
  res.json(user.favorites);
});

// Get favorites
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.favorites);
});

// Get detailed favorite Pokémon info (throttled)
router.get('/details', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const favorites = user.favorites || [];
    const results = [];

    for (const pokemon of favorites) {
      try {
        const data = await fetchPokemon(pokemon);
        results.push({
          name: data.name,
          id: data.id,
          types: data.types.map(t => t.type.name),
          sprite: data.sprites.front_default,
        });
        // Add a small delay to avoid hitting PokeAPI too quickly
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        results.push({ name: pokemon, error: 'Not found in PokéAPI' });
      }
    }

    res.json({ favorites: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorite Pokémon details' });
  }
});

// Remove favorite
router.delete('/:pokemon', auth, async (req, res) => {
  const { pokemon } = req.params;
  const user = await User.findById(req.user.id);
  const idx = user.favorites.indexOf(pokemon);
  if (idx > -1) {
    user.favorites.splice(idx, 1);
    await user.save();
  }
  res.json(user.favorites);
});

export default router;
