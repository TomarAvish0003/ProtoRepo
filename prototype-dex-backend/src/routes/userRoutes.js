import express from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Favorites
router.get('/favorite', authMiddleware, userController.getFavorites);
router.post('/favorite', authMiddleware, userController.toggleFavorite);
router.delete('/favorite/:pokemon', authMiddleware, userController.removeFavorite);
router.get('/favorite/details', authMiddleware, userController.getFavoriteDetails);

// Caught
router.get('/caught', authMiddleware, userController.getCaught);
router.post('/caught', authMiddleware, userController.toggleCaught);
router.get('/caught/details', authMiddleware, userController.getCaughtDetails);

export default router;
