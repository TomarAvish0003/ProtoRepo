import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { generalLimiter, authLimiter, favoritesLimiter, pokemonAPILimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pokeRoutes from './routes/pokeRoutes.js';
import favoriteRoutes from './routes/favouriteRoutes.js';

import { connectDB } from './config/db.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/favorites', favoritesLimiter);
app.use('/api/pokemon', pokemonAPILimiter);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/pokemon', pokeRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to DB', err);
});
