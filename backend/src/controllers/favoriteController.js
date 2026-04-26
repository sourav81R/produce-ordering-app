import { Favorite } from '../models/Favorite.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveProductImageUrl } from '../utils/productImages.js';

const productSummaryFields =
  'name price unit emoji color category tag description isAvailable imageUrl imageAlt supplier origin packSize stockLevel minOrderQty deliveryWindow qualityGrade isOrganic';

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate('product', productSummaryFields)
    .lean();

  return res.status(200).json({
    success: true,
    favorites: favorites
      .map((favorite) =>
        favorite.product
          ? {
              ...favorite.product,
              imageUrl: resolveProductImageUrl(req, favorite.product),
            }
          : favorite.product
      )
      .filter(Boolean),
  });
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'productId is required.' });
  }

  const product = await Product.findById(productId).lean();

  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const existing = await Favorite.findOne({ user: req.user._id, product: productId });

  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ success: true, isFavorite: false });
  }

  await Favorite.create({ user: req.user._id, product: productId });
  return res.status(201).json({ success: true, isFavorite: true });
});
