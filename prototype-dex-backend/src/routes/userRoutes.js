import express from "express";
import * as userController from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Favorites
router.get("/favorite", auth, userController.getFavorites);
router.get("/favorites", auth, userController.getFavorites);
router.post("/favorite", auth, userController.toggleFavorite);
router.delete("/favorite/:pokemon", auth, userController.removeFavorite);
router.get("/favorite/details", auth, userController.getFavoriteDetails);

// Caught
router.get("/caught", auth, userController.getCaught);
router.post("/caught", auth, userController.toggleCaught);
router.delete("/caught/:pokemon", auth, userController.removeCaught);
router.get("/caught/details", auth, userController.getCaughtDetails);

// Guest Migration / Cloud Sync
router.post("/sync", auth, userController.syncUserData);

// Profile
router.get("/profile", auth, userController.getProfile);
router.patch("/profile", auth, userController.updateProfile);
router.delete("/profile", auth, userController.deleteAccount);

export default router;
