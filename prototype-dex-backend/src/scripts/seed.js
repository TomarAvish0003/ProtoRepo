import fs from 'fs';
import path from 'path';
import { fetchPokemon, fetchPokemonList } from '../utils/fetchFromPokeAPI.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSeed() {
  console.log("Starting seed script...");
  console.log("This will fetch details for all Pokémon and may take several minutes.");

  try {
    const list = await fetchPokemonList(1025, 0); 
    const allPokemon = [];
    const BATCH_SIZE = 15;

    for (let i = 0; i < list.results.length; i += BATCH_SIZE) {
      const batch = list.results.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(list.results.length / BATCH_SIZE)}...`);

      const promises = batch.map(p => fetchPokemon(p.name).then(data => {
        if (!data || !data.is_default || data.id > 1025) return null;
        return {
          id: data.id,
          name: data.name,
          types: data.types.map(t => t.type.name),
          sprite: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default
        };
      }));

      const batchResults = (await Promise.all(promises)).filter(Boolean);
      allPokemon.push(...batchResults);

      // Pause for 1 second between batches to be polite to the API
      if (i + BATCH_SIZE < list.results.length) {
        await delay(1000);
      }
    }
    
    const sortedPokemon = allPokemon.sort((a, b) => a.id - b.id);
    
    const outputPath = path.resolve(process.cwd(), 'src/pokedex-cache.json');
    fs.writeFileSync(outputPath, JSON.stringify(sortedPokemon, null, 2));

    console.log(`✅ Success! Saved ${sortedPokemon.length} Pokémon to pokedex-cache.json`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

runSeed();