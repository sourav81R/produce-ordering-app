import { Item } from '../models/Item.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getFeaturedItems = asyncHandler(async (_req, res) => {
  const items = await Item.find({ isFeatured: true })
    .populate('shop', 'name slug city rating etaMinutes')
    .sort({ rating: -1, name: 1 })
    .limit(8);

  return res.status(200).json(items);
});
