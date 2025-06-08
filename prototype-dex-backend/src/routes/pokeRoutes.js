// src/routes/pokeRoutes.js

import express from "express";
import {
  getPokemonDetails,
  getPokemonList,
} from "../controllers/pokemonController.js";

const router = express.Router();

router.get("/", getPokemonList); // /api/pokemon
router.get("/:nameOrId", getPokemonDetails); // /api/pokemon/pikachu

export default router;
