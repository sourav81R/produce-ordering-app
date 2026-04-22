import express from 'express';
import { getFeaturedItems } from '../controllers/itemController.js';

const router = express.Router();

router.get('/featured', getFeaturedItems);

export default router;
