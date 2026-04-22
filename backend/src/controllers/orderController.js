import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { product, productId, quantity, deliveryDate } = req.body;
  const resolvedProductId = productId || product;

  if (!resolvedProductId || !mongoose.Types.ObjectId.isValid(resolvedProductId)) {
    return res.status(400).json({ message: 'A valid product id is required.' });
  }

  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than 0.' });
  }

  if (!deliveryDate) {
    return res.status(400).json({ message: 'Delivery date is required.' });
  }

  const parsedDeliveryDate = new Date(deliveryDate);

  if (Number.isNaN(parsedDeliveryDate.getTime())) {
    return res.status(400).json({ message: 'Delivery date must be valid.' });
  }

  const productRecord = await Product.findById(resolvedProductId);

  if (!productRecord) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const order = await Order.create({
    userId: req.user._id,
    productId: productRecord._id,
    quantity: parsedQuantity,
    deliveryDate: parsedDeliveryDate,
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('productId', 'name category price unit')
    .populate('userId', 'name email role');

  return res.status(201).json({
    message: 'Order placed successfully.',
    order: populatedOrder,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate('productId', 'name category price unit')
    .sort({ createdAt: -1 });

  return res.status(200).json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['Pending', 'Confirmed', 'Delivered'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Pending, Confirmed, or Delivered.' });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  order.status = status;
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('productId', 'name category price unit')
    .populate('userId', 'name email role');

  return res.status(200).json({
    message: 'Order status updated successfully.',
    order: updatedOrder,
  });
});
