import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find({ isAvailable: true }).sort({ category: 1, name: 1 }).lean();
  return res.status(200).json({ success: true, products });
});
