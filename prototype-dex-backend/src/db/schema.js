import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar').default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const userFavorites = sqliteTable('user_favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pokemon: text('pokemon').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const userCaught = sqliteTable('user_caught', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pokemon: text('pokemon').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const pokemon = sqliteTable('pokemon', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  types: text('types', { mode: 'json' }).notNull(),
  sprite: text('sprite'),
  height: integer('height'),
  weight: integer('weight'),
  hp: integer('hp'),
  atk: integer('atk'),
  def: integer('def'),
  spa: integer('spa'),
  spd: integer('spd'),
  spe: integer('spe'),
  bst: integer('bst'),
  generation: integer('generation'),
  details: text('details', { mode: 'json' }),
});

export const moves = sqliteTable('moves', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  accuracy: integer('accuracy'),
  pp: integer('pp'),
  power: integer('power'),
  priority: integer('priority').default(0),
  type: text('type').notNull(),
  damageClass: text('damage_class'),
  generation: text('generation'),
  shortDescription: text('short_description'),
});

export const apiCache = sqliteTable('api_cache', {
  cacheKey: text('cache_key').primaryKey(),
  data: text('data', { mode: 'json' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
