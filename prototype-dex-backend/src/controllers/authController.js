import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, userFavorites, userCaught } from '../db/schema.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

// In-memory token blocklist for immediate revocation
const tokenBlocklist = new Set();

const COOKIE_NAME = 'protodex_token';
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'secret-jwt-key';
  return jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: '7d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = (parseResult.error.issues || parseResult.error.errors || [])
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({ error: errorMsg });
    }

    const { username, email, password } = parseResult.data;

    // Check uniqueness
    const [existing] = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      return res.status(400).json({ error: `A trainer with this ${field} already exists.` });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      username,
      email,
      password: hashed,
      avatar: '',
    });

    const token = generateToken(userId);
    const cookieOpts = getCookieOptions();
    res.cookie(COOKIE_NAME, token, cookieOpts);

    const safeUser = {
      id: userId,
      username,
      email,
      avatar: '',
      favorites: [],
      caught: [],
    };

    res.status(201).json({
      message: 'Registration successful',
      user: safeUser,
      token, // Also returned for non-cookie / CLI clients
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = (parseResult.error.issues || parseResult.error.errors || [])
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({ error: errorMsg });
    }

    const { email, password } = parseResult.data;

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    const cookieOpts = getCookieOptions();
    res.cookie(COOKIE_NAME, token, cookieOpts);

    // Fetch user favorites and caught
    const favRows = await db
      .select({ pokemon: userFavorites.pokemon })
      .from(userFavorites)
      .where(eq(userFavorites.userId, user.id));
    const caughtRows = await db
      .select({ pokemon: userCaught.pokemon })
      .from(userCaught)
      .where(eq(userCaught.userId, user.id));

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || '',
      createdAt: user.createdAt,
      favorites: favRows.map((r) => r.pokemon),
      caught: caughtRows.map((r) => r.pokemon),
    };

    res.status(200).json({
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const logoutUser = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.protodex_token;

    if (token) {
      tokenBlocklist.add(token);
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is already populated and sanitized by the auth middleware
    res.status(200).json({
      user: req.user,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Failed to retrieve session user' });
  }
};

export const isTokenBlocklisted = (req, res, next) => {
  const token = req.cookies?.protodex_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (token && tokenBlocklist.has(token)) {
    return res.status(401).json({ error: 'Session has been invalidated. Please log in again.' });
  }
  next();
};
