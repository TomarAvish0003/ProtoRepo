// src/middleware/rateLimiter.js

import rateLimit from 'express-rate-limit';

// Limit general API usage (e.g. 100 requests per 15 mins)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP. Please try again later.',
});

// Stricter limiter for sensitive endpoints like auth
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login/signup attempts. Please try again later.',
});
