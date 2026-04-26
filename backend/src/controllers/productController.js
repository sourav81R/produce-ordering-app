import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveProductImageUrl } from '../utils/productImages.js';

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isAvailable: true }).sort({ category: 1, name: 1 }).lean();
  const normalizedProducts = products.map((product) => ({
    ...product,
    imageUrl: resolveProductImageUrl(req, product),
  }));

  return res.status(200).json({ success: true, products: normalizedProducts });
});
