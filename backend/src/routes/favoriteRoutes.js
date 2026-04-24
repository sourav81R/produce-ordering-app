import express from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/toggle', protect, toggleFavorite);

export default router;
