import express from 'express';
import { getFeaturedShops, getShopBySlug, getShops } from '../controllers/shopController.js';

const router = express.Router();

router.get('/featured', getFeaturedShops);
router.get('/', getShops);
router.get('/:slug', getShopBySlug);

export default router;
