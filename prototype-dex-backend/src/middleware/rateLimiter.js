// src/middleware/rateLimiter.js

import rateLimit from 'express-rate-limit';

// Limit general API usage (e.g. 100 requests per 15 mins)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: 'Too many requests from this IP. Please try again later.',
});

// Stricter limiter for sensitive endpoints like auth
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login/signup attempts. Please try again later.',
});

// src/middleware/rateLimiter.js
export const favoritesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 30 requests/minute per IP for favorites
  message: 'Too many favorites requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const pokemonAPILimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50, // 15 requests/minute to PokeAPI proxy
  message: 'Too many Pokémon requests. Please try again later.',
});
