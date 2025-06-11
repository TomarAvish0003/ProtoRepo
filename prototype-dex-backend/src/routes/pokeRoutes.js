// src/routes/pokeRoutes.js

import express from "express";
import {
  getPokemonDetails,
  getPokemonList,
  getPokemonByGeneration, // <-- add this
} from "../controllers/pokemonController.js";

const router = express.Router();

router.get("/", getPokemonList); // /api/pokemon
router.get("/generation/:genId", getPokemonByGeneration); // <-- add this line
router.get("/:nameOrId", getPokemonDetails); // /api/pokemon/pikachu
// src/routes/pokeRoutes.js
router.post("/batch", async (req, res) => {
  const { names } = req.body; // names: string[]
  if (!Array.isArray(names)) {
    return res.status(400).json({ error: "names must be an array" });
  }
  const results = [];
  for (const name of names) {
    try {
      // Throttle to 1 request/sec to PokeAPI
      await new Promise(resolve => setTimeout(resolve, 1100));
      const data = await fetchPokemon(name);
      results.push(data);
    } catch (err) {
      results.push({ name, error: "Not found or rate-limited" });
    }
  }
  res.json({ pokemons: results });
});


export default router;
