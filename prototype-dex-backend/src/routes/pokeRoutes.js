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

export default router;
