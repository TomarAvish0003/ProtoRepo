// routes/favorite.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// Add favorite
router.post('/', auth, async (req, res) => {
  const { pokemon } = req.body;
  const user = await User.findById(req.userId);
  if (!user.favorites.includes(pokemon)) user.favorites.push(pokemon);
  await user.save();
  res.json(user.favorites);
});

// Get favorites
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user.favorites);
});

module.exports = router;
