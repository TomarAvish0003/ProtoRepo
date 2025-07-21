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
  getPokemonEncounters,
  getPokemonBatch,
} from "../controllers/pokemonController.js";
import { getMovesBatch } from "../controllers/moveController.js";

const router = express.Router();

// Core Pokémon endpoints
router.get("/", getPokemonList);
router.get("/generation/:genId", getPokemonByGeneration);
router.get("/types", getPokemonTypes);

// Batch fetch endpoints
router.post("/batch", getPokemonBatch);
router.post("/moves/batch", getMovesBatch);

// Advanced endpoints
router.get("/species/:nameOrId", getPokemonSpecies);
router.get("/evolution-chain/:id", getEvolutionChain);
router.get("/type/:nameOrId", getType);
router.get("/ability/:nameOrId", getAbility);
router.get("/move/:nameOrId", getMove);
router.get("/item/:nameOrId", getItem);
router.get("/egg-group/:nameOrId", getEggGroup);
router.get("/location/:nameOrId", getLocation);
router.get("/location-area/:nameOrId", getLocationArea);
router.get("/pal-park-area/:nameOrId", getPalParkArea);
router.get("/region/:nameOrId", getRegion);
router.get("/evolution-trigger/:nameOrId", getEvolutionTrigger);
router.get("/pokedex/:nameOrId", getPokedex);
router.get("/version/:nameOrId", getVersion);
router.get("/version-group/:nameOrId", getVersionGroup);
router.get("/:nameOrId/encounters", getPokemonEncounters);

// This must be the last GET route with a parameter in this segment
router.get("/:nameOrId", getPokemonDetails);

export default router;