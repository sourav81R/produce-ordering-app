import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ category: 1, name: 1 });
  return res.status(200).json(products);
});

