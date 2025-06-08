import { fetchPokemon } from '../utils/fetchFromPokeAPI.js';

export const getFavorites = async (req, res) => {
  res.json({ favorites: req.user.favorites });
};

export const toggleFavorite = async (req, res) => {
  const { pokemon } = req.body;
  const favorites = req.user.favorites;

  if (!pokemon) return res.status(400).json({ message: "Missing Pokémon name or ID" });

  const index = favorites.indexOf(pokemon);
  if (index > -1) {
    favorites.splice(index, 1); // remove
  } else {
    favorites.push(pokemon); // add
  }

  await req.user.save();
  res.json({ favorites });
};

export const removeFavorite = async (req, res) => {
  const { pokemon } = req.params;
  const favorites = req.user.favorites;
  const index = favorites.indexOf(pokemon);
  if (index > -1) {
    favorites.splice(index, 1);
    await req.user.save();
  }
  res.json({ favorites });
};

export const getFavoriteDetails = async (req, res) => {
  try {
    const { favorites } = req.user;

    const detailPromises = favorites.map(async (pokemon) => {
      try {
        const data = await fetchPokemon(pokemon);
        return {
          name: data.name,
          id: data.id,
          types: data.types.map(t => t.type.name),
          sprite: data.sprites.front_default,
        };
      } catch (err) {
        return { name: pokemon, error: 'Not found in PokéAPI' };
      }
    });

    const detailedFavorites = await Promise.all(detailPromises);
    res.json({ favorites: detailedFavorites });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch favorite Pokémon details' });
  }
};

// Caught routes
export const getCaught = async (req, res) => {
  res.json({ caught: req.user.caught });
};

export const toggleCaught = async (req, res) => {
  const { pokemon } = req.body;
  const caught = req.user.caught;

  if (!pokemon) return res.status(400).json({ message: "Missing Pokémon name or ID" });

  const index = caught.indexOf(pokemon);
  if (index > -1) {
    caught.splice(index, 1); // remove
  } else {
    caught.push(pokemon); // add
  }

  await req.user.save();
  res.json({ caught });
};

export const getCaughtDetails = async (req, res) => {
  try {
    const { caught } = req.user;

    const detailPromises = caught.map(async (pokemon) => {
      try {
        const data = await fetchPokemon(pokemon);
        return {
          name: data.name,
          id: data.id,
          types: data.types.map(t => t.type.name),
          sprite: data.sprites.front_default,
        };
      } catch (err) {
        return { name: pokemon, error: 'Not found in PokéAPI' };
      }
    });

    const detailedCaught = await Promise.all(detailPromises);
    res.json({ caught: detailedCaught });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch caught Pokémon details' });
  }
};
