import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { product, quantity, deliveryDate } = req.body;

  if (!product || !mongoose.Types.ObjectId.isValid(product)) {
    return res.status(400).json({ message: 'A valid product id is required.' });
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be a number greater than 0.' });
  }

  const parsedDeliveryDate = new Date(deliveryDate);
  if (Number.isNaN(parsedDeliveryDate.getTime())) {
    return res.status(400).json({ message: 'A valid delivery date is required.' });
  }

  const startOfSelectedDate = new Date(parsedDeliveryDate);
  startOfSelectedDate.setHours(0, 0, 0, 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (startOfSelectedDate < startOfToday) {
    return res.status(400).json({ message: 'Delivery date cannot be in the past.' });
  }

  const productExists = await Product.findById(product);
  if (!productExists) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const order = await Order.create({
    user: req.user._id,
    product,
    quantity: parsedQuantity,
    deliveryDate: parsedDeliveryDate,
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('product', 'name category price unit')
    .populate('user', 'name email');

  return res.status(201).json({
    message: 'Order placed successfully.',
    order: populatedOrder,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('product', 'name category price unit')
    .sort({ createdAt: -1 });

  return res.status(200).json(orders);
});

