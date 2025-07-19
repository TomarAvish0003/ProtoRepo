// src/routes/pokeRoutes.js

import express from "express";
import {
  getPokemonDetails,
  getPokemonList,
  getPokemonByGeneration,
  getPokemonTypes,
  getPokemonSpecies,
  getEvolutionChain,
  getType,
  getAbility,
  getMove,
  getItem,
  getEggGroup,
  getLocation,
  getLocationArea,
  getPalParkArea,
  getRegion,
  getEvolutionTrigger,
  getPokedex,
  getVersion,
  getVersionGroup,
  getPokemonEncounters
} from "../controllers/pokemonController.js";
import { fetchPokemon } from "../utils/fetchFromPokeAPI.js";
import { getMovesBatch } from "../controllers/moveController.js";

const router = express.Router();

// Core Pokémon endpoints
router.get("/", getPokemonList); // /api/pokemon
router.get("/generation/:genId", getPokemonByGeneration); // /api/pokemon/generation/:genId
router.get("/types", getPokemonTypes); // /api/pokemon/types

// Advanced endpoints
// Move batch endpoint
router.post("/moves/batch", getMovesBatch);
router.get("/species/:nameOrId", getPokemonSpecies); // /api/pokemon/species/:nameOrId
router.get("/evolution-chain/:id", getEvolutionChain); // /api/pokemon/evolution-chain/:id
router.get("/type/:nameOrId", getType); // /api/pokemon/type/:nameOrId
router.get("/ability/:nameOrId", getAbility); // /api/pokemon/ability/:nameOrId
router.get("/move/:nameOrId", getMove); // /api/pokemon/move/:nameOrId
router.get("/item/:nameOrId", getItem); // /api/pokemon/item/:nameOrId
router.get("/egg-group/:nameOrId", getEggGroup); // /api/pokemon/egg-group/:nameOrId
router.get("/location/:nameOrId", getLocation); // /api/pokemon/location/:nameOrId
router.get("/location-area/:nameOrId", getLocationArea); // /api/pokemon/location-area/:nameOrId
router.get("/pal-park-area/:nameOrId", getPalParkArea); // /api/pokemon/pal-park-area/:nameOrId
router.get("/region/:nameOrId", getRegion); // /api/pokemon/region/:nameOrId
router.get("/evolution-trigger/:nameOrId", getEvolutionTrigger); // /api/pokemon/evolution-trigger/:nameOrId
router.get("/pokedex/:nameOrId", getPokedex); // /api/pokemon/pokedex/:nameOrId
router.get("/version/:nameOrId", getVersion); // /api/pokemon/version/:nameOrId
router.get("/version-group/:nameOrId", getVersionGroup); // /api/pokemon/version-group/:nameOrId
router.get("/:nameOrId/encounters", getPokemonEncounters); // /api/pokemon/:nameOrId/encounters


// Batch fetch endpoint (optional: move to controller for consistency)
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


// This should be the last route to avoid conflicts with above routes
router.get("/:nameOrId", getPokemonDetails); // /api/pokemon/:nameOrId

export default router;
