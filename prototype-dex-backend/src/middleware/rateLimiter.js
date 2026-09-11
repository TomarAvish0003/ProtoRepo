import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: 'Too many requests from this IP. Please try again later.',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many login/signup attempts. Please try again later.',
});

export const favoritesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Too many favorites requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const pokemonAPILimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5000,
  message: 'Too many Pokémon requests. Please try again later.',
});
