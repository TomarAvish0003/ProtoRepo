import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { generalLimiter, favoritesLimiter, pokemonAPILimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pokeRoutes from './routes/pokeRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';
import { client } from './db/index.js';

dotenv.config();
const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://proto-repo.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(generalLimiter);
app.use('/api/user', favoritesLimiter);
app.use('/api/pokemon', pokemonAPILimiter);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/pokemon', pokeRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ProtoDex API operational' });
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

client
  .execute('SELECT 1')
  .then(() => {
    console.log('Database connection established');
    app.listen(PORT, () => {
      console.log(`ProtoDex API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });