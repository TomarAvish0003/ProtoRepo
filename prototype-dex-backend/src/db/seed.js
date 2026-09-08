import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from './index.js';
import { pokemon, moves } from './schema.js';

const getGeneration = (id) => {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
};

async function seedPokemon() {
  console.log('📦 Seeding Pokémon catalog into database...');
  const cachePath = path.resolve(process.cwd(), 'src/pokedex-cache.json');
  const rawData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const rows = rawData.map((p) => ({
    id: p.id,
    name: p.name.toLowerCase(),
    types: p.types,
    sprite: p.sprite || null,
    height: p.height ?? null,
    weight: p.weight ?? null,
    hp: p.stats?.hp ?? null,
    atk: p.stats?.atk ?? null,
    def: p.stats?.def ?? null,
    spa: p.stats?.spa ?? null,
    spd: p.stats?.spd ?? null,
    spe: p.stats?.spe ?? null,
    bst: p.stats?.bst ?? null,
    generation: getGeneration(p.id),
  }));

  // Batch insert in chunks of 100
  const CHUNK_SIZE = 100;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    await db.insert(pokemon).values(chunk).onConflictDoNothing();
  }

  console.log(`✅ Seeded ${rows.length} Pokémon.`);
}

async function seedMoves() {
  console.log('📦 Seeding Pokémon moves from metadata_pokemon_moves.csv...');
  const csvPath = path.resolve(process.cwd(), 'src/config/metadata_pokemon_moves.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('⚠️ metadata_pokemon_moves.csv not found, skipping moves seed.');
    return;
  }

  const moveRows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (!row.id || !row.name) return;
        moveRows.push({
          id: parseInt(row.id, 10),
          name: row.name.toLowerCase().trim().replace(/\s+/g, '-'),
          accuracy: row.accuracy ? Math.round(parseFloat(row.accuracy)) : null,
          pp: row.pp ? parseInt(row.pp, 10) : null,
          power: row.power ? Math.round(parseFloat(row.power)) : null,
          priority: row.priority ? parseInt(row.priority, 10) : 0,
          type: (row.type || 'normal').toLowerCase().trim(),
          damageClass: (row.damage_class || '').toLowerCase().trim(),
          generation: row.generation || null,
          shortDescription: row.short_descripton || row.short_description || '',
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Batch insert in chunks of 100
  const CHUNK_SIZE = 100;
  for (let i = 0; i < moveRows.length; i += CHUNK_SIZE) {
    const chunk = moveRows.slice(i, i + CHUNK_SIZE);
    await db.insert(moves).values(chunk).onConflictDoNothing();
  }

  console.log(`✅ Seeded ${moveRows.length} moves.`);
}

async function main() {
  const start = Date.now();
  await seedPokemon();
  await seedMoves();
  console.log(`🎉 Database seed completed in ${((Date.now() - start) / 1000).toFixed(2)}s.`);
}

main().catch((err) => {
  console.error('❌ Database seed failed:', err);
  process.exit(1);
});
