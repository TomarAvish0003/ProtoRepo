import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:protodex.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
export { schema };
