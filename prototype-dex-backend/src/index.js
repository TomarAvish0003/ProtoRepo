import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { generalLimiter, authLimiter, favoritesLimiter, pokemonAPILimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pokeRoutes from './routes/pokeRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';

// Local Imports
import { connectDB } from './config/db.js';

// Initialize
dotenv.config();
const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
app.use(generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/favorite', favoritesLimiter);
app.use('/api/caught', favoritesLimiter);
app.use('/api/pokemon', pokemonAPILimiter);

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/pokemon', pokeRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// Root route for API health check
app.get('/', (req, res) => {
  res.json({ message: 'ProtoDex API is running!' });
});

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to the database. Server did not start.', err);
  process.exit(1);
});