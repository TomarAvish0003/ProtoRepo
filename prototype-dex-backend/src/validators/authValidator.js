import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export const pokemonActionSchema = z.object({
  pokemon: z
    .union([z.string(), z.number()])
    .transform((val) => String(val).toLowerCase().trim())
    .refine((val) => val.length > 0 && val.length <= 60, {
      message: 'Invalid Pokémon identifier',
    }),
});

export const syncDataSchema = z.object({
  favorites: z
    .array(z.union([z.string(), z.number()]).transform((val) => String(val).toLowerCase().trim()))
    .max(1025, 'Favorites cannot exceed 1025 Pokémon')
    .default([]),
  caught: z
    .array(z.union([z.string(), z.number()]).transform((val) => String(val).toLowerCase().trim()))
    .max(1025, 'Caught list cannot exceed 1025 Pokémon')
    .default([]),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number')
    .optional(),
  avatar: z.string().max(255).optional(),
});

