import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, userFavorites, userCaught } from '../db/schema.js';
import { tokenBlocklist } from '../controllers/authController.js';

export default async function auth(req, res, next) {
  let token = req.cookies?.protodex_token || req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session or token found.' });
  }

  if (tokenBlocklist.has(token)) {
    return res.status(401).json({ error: 'Session has been invalidated. Please log in again.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'secret-jwt-key';
    const decoded = jwt.verify(token, jwtSecret);
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'User session not found or expired.' });
    }

    const favRows = await db
      .select({ pokemon: userFavorites.pokemon })
      .from(userFavorites)
      .where(eq(userFavorites.userId, user.id));
    const caughtRows = await db
      .select({ pokemon: userCaught.pokemon })
      .from(userCaught)
      .where(eq(userCaught.userId, user.id));

    user.favorites = favRows.map((r) => r.pokemon);
    user.caught = caughtRows.map((r) => r.pokemon);

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

