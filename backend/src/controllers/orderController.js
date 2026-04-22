import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Item } from '../models/Item.js';
import { Shop } from '../models/Shop.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { shopId, items, deliveryAddress, paymentMethod = 'cod', scheduledFor = null } = req.body;

  if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
    return res.status(400).json({ message: 'A valid shop id is required.' });
  }

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'At least one item is required to place an order.' });
  }

  if (!deliveryAddress?.line1?.trim() || !deliveryAddress?.city?.trim()) {
    return res.status(400).json({ message: 'Delivery address and city are required.' });
  }

  const shop = await Shop.findById(shopId);
  if (!shop) {
    return res.status(404).json({ message: 'Shop not found.' });
  }

  const requestedItemIds = items.map((entry) => entry.itemId).filter(Boolean);
  if (!requestedItemIds.every((itemId) => mongoose.Types.ObjectId.isValid(itemId))) {
    return res.status(400).json({ message: 'Every cart item must reference a valid item id.' });
  }

  const dbItems = await Item.find({
    _id: { $in: requestedItemIds },
    shop: shop._id,
  });

  if (dbItems.length !== requestedItemIds.length) {
    return res.status(400).json({ message: 'Some items are unavailable for this shop.' });
  }

  const dbItemsMap = new Map(dbItems.map((item) => [item._id.toString(), item]));
  const normalizedItems = [];

  for (const entry of items) {
    const matchedItem = dbItemsMap.get(entry.itemId);
    const parsedQuantity = Number(entry.quantity);

    if (!matchedItem || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Each order item must include a valid quantity.' });
    }

    normalizedItems.push({
      item: matchedItem._id,
      name: matchedItem.name,
      price: matchedItem.price,
      quantity: parsedQuantity,
    });
  }

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = shop.deliveryFee || 0;
  const total = subtotal + deliveryFee;
  const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;

  if (scheduledFor && Number.isNaN(scheduledDate?.getTime())) {
    return res.status(400).json({ message: 'Scheduled time must be a valid date.' });
  }

  const order = await Order.create({
    customer: req.user._id,
    shop: shop._id,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress: {
      label: deliveryAddress.label?.trim() || 'Home',
      line1: deliveryAddress.line1.trim(),
      city: deliveryAddress.city.trim(),
      notes: deliveryAddress.notes?.trim() || '',
    },
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    scheduledFor: scheduledDate,
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('shop', 'name slug city coverImage etaMinutes')
    .populate('customer', 'name email role');

  return res.status(201).json({
    message: 'Order placed successfully.',
    order: populatedOrder,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate('shop', 'name slug city coverImage etaMinutes')
    .sort({ createdAt: -1 });

  return res.status(200).json(orders);
});
