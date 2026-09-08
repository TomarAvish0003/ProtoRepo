import bcrypt from 'bcryptjs';
import { eq, and, or, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, userFavorites, userCaught, pokemon } from '../db/schema.js';
import {
  pokemonActionSchema,
  syncDataSchema,
  updateProfileSchema,
} from '../validators/authValidator.js';

const formatZodError = (err) => (err.issues || err.errors || [{}])[0]?.message || 'Invalid input';

// --- FAVORITES ---

export const getFavorites = async (req, res) => {
  try {
    const rows = await db
      .select({ pokemon: userFavorites.pokemon })
      .from(userFavorites)
      .where(eq(userFavorites.userId, req.user.id));
    res.json(rows.map((r) => r.pokemon));
  } catch (err) {
    console.error('getFavorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const parseResult = pokemonActionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: formatZodError(parseResult.error) });
    }

    const key = parseResult.data.pokemon;

    // Strict row-level isolation
    const [existing] = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, req.user.id), eq(userFavorites.pokemon, key)))
      .limit(1);

    if (existing) {
      await db
        .delete(userFavorites)
        .where(and(eq(userFavorites.userId, req.user.id), eq(userFavorites.pokemon, key)));
    } else {
      await db.insert(userFavorites).values({
        userId: req.user.id,
        pokemon: key,
      });
    }

    const rows = await db
      .select({ pokemon: userFavorites.pokemon })
      .from(userFavorites)
      .where(eq(userFavorites.userId, req.user.id));

    res.json({
      action: existing ? 'removed' : 'added',
      pokemon: key,
      favorites: rows.map((r) => r.pokemon),
    });
  } catch (err) {
    console.error('toggleFavorite error:', err);
    res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const parseResult = pokemonActionSchema.safeParse({ pokemon: req.params.pokemon });
    if (!parseResult.success) {
      return res.status(400).json({ error: formatZodError(parseResult.error) });
    }

    const key = parseResult.data.pokemon;
    await db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, req.user.id), eq(userFavorites.pokemon, key)));

    const rows = await db
      .select({ pokemon: userFavorites.pokemon })
      .from(userFavorites)
      .where(eq(userFavorites.userId, req.user.id));

    res.json(rows.map((r) => r.pokemon));
  } catch (err) {
    console.error('removeFavorite error:', err);
    res.status(500).json({ error: 'Failed to remove favorite.' });
  }
};

export const getFavoriteDetails = async (req, res) => {
  try {
    const favRows = await db
      .select({ pokemon: userFavorites.pokemon })
      .from(userFavorites)
      .where(eq(userFavorites.userId, req.user.id));

    const keys = favRows.map((r) => r.pokemon);
    if (keys.length === 0) return res.json({ favorites: [] });

    const numericIds = keys.map((k) => parseInt(k, 10)).filter((n) => !isNaN(n));
    const nameKeys = keys.map((k) => k.toLowerCase());

    const conditions = [];
    if (numericIds.length > 0) conditions.push(inArray(pokemon.id, numericIds));
    if (nameKeys.length > 0) conditions.push(inArray(pokemon.name, nameKeys));

    const details = await db
      .select()
      .from(pokemon)
      .where(conditions.length > 1 ? or(...conditions) : conditions[0]);

    res.json({ favorites: details });
  } catch (err) {
    console.error('getFavoriteDetails error:', err);
    res.status(500).json({ error: 'Failed to fetch favorite Pokémon details.' });
  }
};

// --- CAUGHT ---

export const getCaught = async (req, res) => {
  try {
    const rows = await db
      .select({ pokemon: userCaught.pokemon })
      .from(userCaught)
      .where(eq(userCaught.userId, req.user.id));
    res.json(rows.map((r) => r.pokemon));
  } catch (err) {
    console.error('getCaught error:', err);
    res.status(500).json({ error: 'Failed to fetch caught Pokémon.' });
  }
};

export const toggleCaught = async (req, res) => {
  try {
    const parseResult = pokemonActionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: formatZodError(parseResult.error) });
    }

    const key = parseResult.data.pokemon;

    // Strict row-level isolation
    const [existing] = await db
      .select()
      .from(userCaught)
      .where(and(eq(userCaught.userId, req.user.id), eq(userCaught.pokemon, key)))
      .limit(1);

    if (existing) {
      await db
        .delete(userCaught)
        .where(and(eq(userCaught.userId, req.user.id), eq(userCaught.pokemon, key)));
    } else {
      await db.insert(userCaught).values({
        userId: req.user.id,
        pokemon: key,
      });
    }

    const rows = await db
      .select({ pokemon: userCaught.pokemon })
      .from(userCaught)
      .where(eq(userCaught.userId, req.user.id));

    res.json({
      action: existing ? 'removed' : 'added',
      pokemon: key,
      caught: rows.map((r) => r.pokemon),
    });
  } catch (err) {
    console.error('toggleCaught error:', err);
    res.status(500).json({ error: 'Failed to toggle caught Pokémon.' });
  }
};

export const removeCaught = async (req, res) => {
  try {
    const parseResult = pokemonActionSchema.safeParse({ pokemon: req.params.pokemon });
    if (!parseResult.success) {
      return res.status(400).json({ error: formatZodError(parseResult.error) });
    }

    const key = parseResult.data.pokemon;
    await db
      .delete(userCaught)
      .where(and(eq(userCaught.userId, req.user.id), eq(userCaught.pokemon, key)));

    const rows = await db
      .select({ pokemon: userCaught.pokemon })
      .from(userCaught)
      .where(eq(userCaught.userId, req.user.id));

    res.json(rows.map((r) => r.pokemon));
  } catch (err) {
    console.error('removeCaught error:', err);
    res.status(500).json({ error: 'Failed to remove caught Pokémon.' });
  }
};

export const getCaughtDetails = async (req, res) => {
  try {
    const caughtRows = await db
      .select({ pokemon: userCaught.pokemon })
      .from(userCaught)
      .where(eq(userCaught.userId, req.user.id));

    const keys = caughtRows.map((r) => r.pokemon);
    if (keys.length === 0) return res.json({ caught: [] });

    const numericIds = keys.map((k) => parseInt(k, 10)).filter((n) => !isNaN(n));
    const nameKeys = keys.map((k) => k.toLowerCase());

    const conditions = [];
    if (numericIds.length > 0) conditions.push(inArray(pokemon.id, numericIds));
    if (nameKeys.length > 0) conditions.push(inArray(pokemon.name, nameKeys));

    const details = await db
      .select()
      .from(pokemon)
      .where(conditions.length > 1 ? or(...conditions) : conditions[0]);

    res.json({ caught: details });
  } catch (err) {
    console.error('getCaughtDetails error:', err);
    res.status(500).json({ error: 'Failed to fetch caught Pokémon details.' });
  }
};

// --- BATCH GUEST MIGRATION / CLOUD SYNC ---

export const syncUserData = async (req, res) => {
  try {
    const parseResult = syncDataSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: formatZodError(parseResult.error) });
    }

    const { favorites: incomingFavorites, caught: incomingCaught } = parseResult.data;

    // 1. Fetch currently stored items
    const existingFavRows = await db
      .select({ pokemon: userFavorites.pokemon })
      .from(userFavorites)
      .where(eq(userFavorites.userId, req.user.id));
    const existingFavSet = new Set(existingFavRows.map((r) => r.pokemon));

    const existingCaughtRows = await db
      .select({ pokemon: userCaught.pokemon })
      .from(userCaught)
      .where(eq(userCaught.userId, req.user.id));
    const existingCaughtSet = new Set(existingCaughtRows.map((r) => r.pokemon));

    // 2. Insert missing favorites
    const newFavorites = incomingFavorites.filter((f) => !existingFavSet.has(f));
    for (const fav of newFavorites) {
      await db.insert(userFavorites).values({
        userId: req.user.id,
        pokemon: fav,
      });
    }

    // 3. Insert missing caught items
    const newCaught = incomingCaught.filter((c) => !existingCaughtSet.has(c));
    for (const c of newCaught) {
      await db.insert(userCaught).values({
        userId: req.user.id,
        pokemon: c,
      });
    }

    // 4. Return complete lists
    const finalFavRows = await db
      .select({ pokemon: userFavorites.pokemon })
      .from(userFavorites)
      .where(eq(userFavorites.userId, req.user.id));
    const finalCaughtRows = await db
      .select({ pokemon: userCaught.pokemon })
      .from(userCaught)
      .where(eq(userCaught.userId, req.user.id));

    res.json({
      message: 'Data synced successfully',
      syncedFavoritesCount: newFavorites.length,
      syncedCaughtCount: newCaught.length,
      favorites: finalFavRows.map((r) => r.pokemon),
      caught: finalCaughtRows.map((r) => r.pokemon),
    });
  } catch (err) {
    console.error('syncUserData error:', err);
    res.status(500).json({ error: 'Failed to sync user data.' });
  }
};

// --- PROFILE ---

export const getProfile = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      avatar: req.user.avatar || '',
      createdAt: req.user.createdAt,
      favorites: req.user.favorites || [],
      caught: req.user.caught || [],
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: formatZodError(parseResult.error) });
    }

    const { email, username, password, avatar } = parseResult.data;
    const updates = { updatedAt: new Date() };

    if (email) updates.email = email;
    if (username) updates.username = username;
    if (password) updates.password = await bcrypt.hash(password, 12);
    if (avatar !== undefined) updates.avatar = avatar;

    await db.update(users).set(updates).where(eq(users.id, req.user.id));

    const [updatedUser] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    res.json(updatedUser);
  } catch (error) {
    console.error('updateProfile error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await db.delete(users).where(eq(users.id, req.user.id));
    res.clearCookie('protodex_token');
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
