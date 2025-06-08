import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs';

const url = 'https://pokemondb.net/move/all';

async function scrapeMoves() {
  try {
    const { data: html } = await axios.get(url);
    const $ = load(html);

    const moves = [];

    $('#moves tbody tr').each((i, row) => {
      const cols = $(row).find('td');

      const name = $(cols[0]).text().trim();
      const type = $(cols[1]).text().trim();
      const category = $(cols[2]).find('img').attr('alt') || '';
      const power = $(cols[3]).text().trim();
      const accuracy = $(cols[4]).text().trim();
      const pp = $(cols[5]).text().trim();
      const effect = $(cols[6]).text().trim();
      const probability = $(cols[7]).text().trim();

      moves.push({
        name,
        type,
        category,
        power,
        accuracy,
        pp,
        effect,
        probability,
      });
    });

    fs.writeFileSync('pokemon_moves.json', JSON.stringify(moves, null, 2), 'utf-8');
    console.log(`✅ Scraped ${moves.length} moves to pokemon_moves.json`);
  } catch (error) {
    console.error('❌ Scrape failed:', error.message);
  }
}

scrapeMoves();
