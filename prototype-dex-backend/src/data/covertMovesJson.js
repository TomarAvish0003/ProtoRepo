import fs from 'fs';

// Read the array-style JSON file
const movesArray = JSON.parse(fs.readFileSync('pokemon_moves.json', 'utf8'));

// Convert to object-style JSON with lowercased, dash-separated keys
const movesObject = movesArray.reduce((acc, move) => {
  const { name, ...rest } = move;
  const key = name.toLowerCase().replace(/\s+/g, '-');
  acc[key] = rest;
  return acc;
}, {});

// Write the result to a new file
fs.writeFileSync('pokemon_moves_object.json', JSON.stringify(movesObject, null, 2));

console.log('Conversion complete! Output saved as pokemon_moves_object.json');
