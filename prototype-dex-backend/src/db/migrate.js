import { client } from './index.js';

async function migrate() {
  console.log('🔄 Running migrations for Turso / libSQL...');

  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS user_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pokemon TEXT NOT NULL,
      created_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_pokemon ON user_favorites(pokemon);

    CREATE TABLE IF NOT EXISTS user_caught (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pokemon TEXT NOT NULL,
      created_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_caught_user ON user_caught(user_id);
    CREATE INDEX IF NOT EXISTS idx_caught_pokemon ON user_caught(pokemon);

    CREATE TABLE IF NOT EXISTS pokemon (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      types TEXT NOT NULL,
      sprite TEXT,
      height INTEGER,
      weight INTEGER,
      hp INTEGER,
      atk INTEGER,
      def INTEGER,
      spa INTEGER,
      spd INTEGER,
      spe INTEGER,
      bst INTEGER,
      generation INTEGER,
      details TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name);
    CREATE INDEX IF NOT EXISTS idx_pokemon_gen ON pokemon(generation);

    CREATE TABLE IF NOT EXISTS moves (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      accuracy INTEGER,
      pp INTEGER,
      power INTEGER,
      priority INTEGER DEFAULT 0,
      type TEXT NOT NULL,
      damage_class TEXT,
      generation TEXT,
      short_description TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_moves_name ON moves(name);

    CREATE TABLE IF NOT EXISTS api_cache (
      cache_key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER
    );
  `;

  await client.executeMultiple(ddl);
  console.log('✅ Migration complete: all tables and indexes verified.');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
