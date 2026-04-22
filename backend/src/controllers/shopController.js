import { Item } from '../models/Item.js';
import { Shop } from '../models/Shop.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getFeaturedShops = asyncHandler(async (_req, res) => {
  const shops = await Shop.find({ isFeatured: true }).sort({ rating: -1, name: 1 }).limit(6);
  return res.status(200).json(shops);
});

export const getShops = asyncHandler(async (req, res) => {
  const { city = '', q = '' } = req.query;
  const filters = {};

  if (city.trim()) {
    filters.city = new RegExp(city.trim(), 'i');
  }

  if (q.trim()) {
    filters.$or = [
      { name: new RegExp(q.trim(), 'i') },
      { cuisineTags: new RegExp(q.trim(), 'i') },
      { description: new RegExp(q.trim(), 'i') },
    ];
  }

  const shops = await Shop.find(filters).sort({ isFeatured: -1, rating: -1, name: 1 });
  return res.status(200).json(shops);
});

export const getShopBySlug = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ slug: req.params.slug }).populate('owner', 'name email');

  if (!shop) {
    return res.status(404).json({ message: 'Shop not found.' });
  }

  const items = await Item.find({ shop: shop._id }).sort({ category: 1, name: 1 });
  return res.status(200).json({ shop, items });
});
