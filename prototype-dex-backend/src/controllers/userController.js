import User from '../models/user.js';
import { fetchPokemon } from '../utils/fetchFromPokeAPI.js';
import bcrypt from 'bcryptjs';

// --- FAVORITES ---

// Get all favorites
export const getFavorites = async (req, res) => {
  try {
    res.json(req.user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
};

// Toggle favorite (add if not present, remove if present)
export const toggleFavorite = async (req, res) => {
  try {
    const { pokemon } = req.body;
    if (!pokemon) return res.status(400).json({ error: "Missing Pokémon name or ID" });

    const favorites = req.user.favorites || [];
    const index = favorites.indexOf(pokemon);

    if (index > -1) {
      favorites.splice(index, 1); // Remove
    } else {
      favorites.push(pokemon); // Add
    }

    await req.user.save();
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
};

// Remove a favorite by name or ID
export const removeFavorite = async (req, res) => {
  try {
    const { pokemon } = req.params;
    let favorites = req.user.favorites || [];
    favorites = favorites.filter(fav => fav !== pokemon);
    req.user.favorites = favorites;
    await req.user.save();
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite.' });
  }
};

// Get detailed favorite Pokémon info
export const getFavoriteDetails = async (req, res) => {
  try {
    const favorites = req.user.favorites || [];
    const details = await Promise.all(
      favorites.map(async (pokemon) => {
        try {
          const data = await fetchPokemon(pokemon);
          return {
            name: data.name,
            id: data.id,
            types: data.types.map(t => t.type.name),
            sprite: data.sprites.front_default,
          };
        } catch {
          return { name: pokemon, error: 'Not found in PokéAPI' };
        }
      })
    );
    res.json({ favorites: details });
  } catch {
    res.status(500).json({ error: 'Failed to fetch favorite Pokémon details.' });
  }
};

// --- CAUGHT ---

// Get all caught Pokémon
export const getCaught = async (req, res) => {
  try {
    res.json(req.user.caught || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch caught Pokémon.' });
  }
};

// Toggle caught (add if not present, remove if present)
export const toggleCaught = async (req, res) => {
  try {
    const { pokemon } = req.body;
    if (!pokemon) return res.status(400).json({ error: "Missing Pokémon name or ID" });

    const caught = req.user.caught || [];
    const index = caught.indexOf(pokemon);

    if (index > -1) {
      caught.splice(index, 1); // Remove
    } else {
      caught.push(pokemon); // Add
    }

    await req.user.save();
    res.json(caught);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle caught Pokémon.' });
  }
};

// Get detailed caught Pokémon info
export const getCaughtDetails = async (req, res) => {
  try {
    const caught = req.user.caught || [];
    const details = await Promise.all(
      caught.map(async (pokemon) => {
        try {
          const data = await fetchPokemon(pokemon);
          return {
            name: data.name,
            id: data.id,
            types: data.types.map(t => t.type.name),
            sprite: data.sprites.front_default,
          };
        } catch {
          return { name: pokemon, error: 'Not found in PokéAPI' };
        }
      })
    );
    res.json({ caught: details });
  } catch {
    res.status(500).json({ error: 'Failed to fetch caught Pokémon details.' });
  }
};

// --- PROFILE ---

// Get user profile
export const getProfile = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
      avatar: req.user.avatar,
      favorites: req.user.favorites || [],
      caught: req.user.caught || []
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { email, username, password, avatar } = req.body;
    const user = req.user;

    if (email) user.email = email;
    if (username) user.username = username;
    if (password) user.password = password; // Should hash password in real apps
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      avatar: user.avatar
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    await req.user.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete account" });
  }
};
