import { CartItem } from '../models/CartItem.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveProductImageUrl } from '../utils/productImages.js';

const productSummaryFields =
  'name price unit emoji color category tag description isAvailable imageUrl imageAlt supplier origin packSize stockLevel minOrderQty deliveryWindow qualityGrade isOrganic';

export const getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ user: req.user._id })
    .populate('product', productSummaryFields)
    .lean();

  return res.status(200).json({
    success: true,
    items: items.map((item) => ({
      ...item,
      product: item.product
        ? {
            ...item.product,
            imageUrl: resolveProductImageUrl(req, item.product),
          }
        : item.product,
    })),
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const parsedQuantity = Number(quantity);

  if (!productId) {
    return res.status(400).json({ message: 'productId is required.' });
  }

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1.' });
  }

  const product = await Product.findById(productId).lean();

  if (!product || !product.isAvailable) {
    return res.status(400).json({ message: 'Product not available.' });
  }

  const item = await CartItem.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { $inc: { quantity: parsedQuantity } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
    .populate('product', productSummaryFields)
    .lean();

  return res.status(200).json({
    success: true,
    item: {
      ...item,
      product: item.product
        ? {
            ...item.product,
            imageUrl: resolveProductImageUrl(req, item.product),
          }
        : item.product,
    },
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1.' });
  }

  const product = await Product.findById(req.params.productId).lean();

  if (!product || !product.isAvailable) {
    return res.status(400).json({ message: 'Product not available.' });
  }

  const item = await CartItem.findOneAndUpdate(
    { user: req.user._id, product: req.params.productId },
    { quantity: parsedQuantity },
    { new: true }
  )
    .populate('product', productSummaryFields)
    .lean();

  if (!item) {
    return res.status(404).json({ message: 'Cart item not found.' });
  }

  return res.status(200).json({
    success: true,
    item: {
      ...item,
      product: item.product
        ? {
            ...item.product,
            imageUrl: resolveProductImageUrl(req, item.product),
          }
        : item.product,
    },
  });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  await CartItem.findOneAndDelete({ user: req.user._id, product: req.params.productId });
  return res.status(200).json({ success: true, message: 'Item removed.' });
});

export const clearCart = asyncHandler(async (req, res) => {
  await CartItem.deleteMany({ user: req.user._id });
  return res.status(200).json({ success: true, message: 'Cart cleared.' });
});
