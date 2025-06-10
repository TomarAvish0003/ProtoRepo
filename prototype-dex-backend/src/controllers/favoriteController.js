import User from '../models/user.js';

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { pokemon } = req.body;
    const user = await User.findById(req.userId);
    if (!user.favorites.includes(pokemon)) {
      user.favorites.push(pokemon);
      await user.save();
    }
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favorite.' });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { pokemon } = req.params;
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(fav => fav !== pokemon);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite.' });
  }
};