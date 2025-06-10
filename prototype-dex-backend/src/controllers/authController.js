// src/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: '7d'
  });
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashed
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, username: user.username, email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
