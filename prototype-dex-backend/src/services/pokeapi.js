// services/pokeapi.js
const axios = require('axios');

async function getPokemon(nameOrId) {
  const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
  return response.data;
}

module.exports = { getPokemon };
