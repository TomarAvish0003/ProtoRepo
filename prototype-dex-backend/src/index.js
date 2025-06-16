import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { generalLimiter, authLimiter, favoritesLimiter, pokemonAPILimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pokeRoutes from './routes/pokeRoutes.js';
// Remove favoriteRoutes import to avoid conflicts
// import favoriteRoutes from './routes/favouriteRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';

import { connectDB } from './config/db.js';

dotenv.config();
const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
app.use(generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/favorite', favoritesLimiter);
app.use('/api/caught', favoritesLimiter); // Add rate limiting for caught endpoints
app.use('/api/pokemon', pokemonAPILimiter);

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // Mount userRoutes at /api instead of /api/user
app.use('/api/pokemon', pokeRoutes);
// Remove favoriteRoutes mounting since userRoutes handles favorites
// app.use('/api/favorite', favoriteRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'ProtoDex API is running!',
    endpoints: {
      auth: '/api/auth',
      favorite: '/api/favorite',
      caught: '/api/caught',
      profile: '/api/profile',
      pokemon: '/api/pokemon',
      cloudinary: '/api/cloudinary'
    }
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/auth/*',
      '/api/favorite',
      '/api/caught', 
      '/api/profile',
      '/api/pokemon/*',
      '/api/cloudinary/*'
    ]
  });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Available routes:`);
    console.log(`   POST /api/favorite - Add/toggle favorite`);
    console.log(`   GET  /api/favorite - Get favorites`);
    console.log(`   DELETE /api/favorite/:pokemon - Remove favorite`);
    console.log(`   POST /api/caught - Add/toggle caught`);
    console.log(`   GET  /api/caught - Get caught Pokemon`);
    console.log(`   GET  /api/profile - Get user profile`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to DB', err);
});
