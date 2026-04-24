import crypto from 'crypto';
import { getRazorpayInstance, hasRazorpayConfig } from '../config/razorpay.js';
import { CartItem } from '../models/CartItem.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const DELIVERY_FEE = 30;

const buildLineItem = (product, quantity) => ({
  product: product._id,
  name: product.name,
  category: product.category,
  emoji: product.emoji,
  unit: product.unit,
  price: product.price,
  quantity,
});

const populateOrder = (query) =>
  query.populate('retailer', 'name email role').populate(
    'items.product',
    'name category price unit emoji color tag description isAvailable'
  );

const resolveOrderItems = async ({ payloadItems, productId, productAlias, quantity }) => {
  if (Array.isArray(payloadItems) && payloadItems.length) {
    const lines = [];

    for (const item of payloadItems) {
      const requestedProductId = item.productId || item.product || item._id;
      const requestedQuantity = Number(item.quantity);

      if (!requestedProductId || !Number.isFinite(requestedQuantity) || requestedQuantity < 1) {
        const error = new Error('Each cart item requires a valid product and quantity.');
        error.status = 400;
        throw error;
      }

      const product = await Product.findById(requestedProductId).lean();

      if (!product || !product.isAvailable) {
        const error = new Error(`${item.name || 'A product'} is not available right now.`);
        error.status = 400;
        throw error;
      }

      lines.push(buildLineItem(product, requestedQuantity));
    }

    return lines;
  }

  const resolvedProductId = productId || productAlias;
  const parsedQuantity = Number(quantity);

  if (!resolvedProductId) {
    const error = new Error('productId is required.');
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    const error = new Error('Quantity must be at least 1.');
    error.status = 400;
    throw error;
  }

  const product = await Product.findById(resolvedProductId).lean();

  if (!product || !product.isAvailable) {
    const error = new Error('Product not found.');
    error.status = 404;
    throw error;
  }

  return [buildLineItem(product, parsedQuantity)];
};

const getSubtotal = (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const getPrimaryOrderFields = (items) => ({
  product: items[0]?.product,
  quantity: items.reduce((sum, item) => sum + item.quantity, 0),
});

const clearUserCart = async (userId, payloadItems, orderItems) => {
  if (Array.isArray(payloadItems) && payloadItems.length) {
    await CartItem.deleteMany({ user: userId });
    return;
  }

  if (orderItems.length === 1) {
    await CartItem.findOneAndDelete({ user: userId, product: orderItems[0].product });
  }
};

export const getPaymentConfig = asyncHandler(async (_req, res) => {
  return res.status(200).json({
    keyId: process.env.RAZORPAY_KEY_ID || '',
    enabled: hasRazorpayConfig(),
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const { product, productId, quantity, deliveryDate, paymentMethod = 'cod', items } = req.body;

  if (!deliveryDate) {
    return res.status(400).json({ message: 'deliveryDate is required.' });
  }

  const parsedDeliveryDate = new Date(deliveryDate);

  if (Number.isNaN(parsedDeliveryDate.getTime())) {
    return res.status(400).json({ message: 'Delivery date must be valid.' });
  }

  const orderItems = await resolveOrderItems({
    payloadItems: items,
    productId,
    productAlias: product,
    quantity,
  });
  const subtotal = getSubtotal(orderItems);
  const deliveryFee = subtotal >= 500 ? 0 : DELIVERY_FEE;
  const totalAmount = subtotal + deliveryFee;

  if (paymentMethod === 'wallet') {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance.' });
    }

    user.walletBalance -= totalAmount;
    user.walletHistory.push({
      type: 'debit',
      amount: totalAmount,
      reason: 'GoVigi produce order payment',
    });
    await user.save();

    const order = await Order.create({
      retailer: req.user._id,
      items: orderItems,
      deliveryDate: parsedDeliveryDate,
      status: 'Confirmed',
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      ...getPrimaryOrderFields(orderItems),
    });

    await clearUserCart(req.user._id, items, orderItems);

    return res.status(201).json({ success: true, order });
  }

  if (paymentMethod === 'razorpay') {
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `govigi_${Date.now()}`,
    });

    const order = await Order.create({
      retailer: req.user._id,
      items: orderItems,
      deliveryDate: parsedDeliveryDate,
      status: 'Pending',
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      ...getPrimaryOrderFields(orderItems),
    });

    return res.status(201).json({
      success: true,
      order,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  }

  const order = await Order.create({
    retailer: req.user._id,
    items: orderItems,
    deliveryDate: parsedDeliveryDate,
    status: 'Pending',
    subtotal,
    deliveryFee,
    totalAmount,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    ...getPrimaryOrderFields(orderItems),
  });

  await clearUserCart(req.user._id, items, orderItems);

  return res.status(201).json({ success: true, order });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: 'Razorpay verification data is required.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: 'Payment verification failed.' });
  }

  const order = await Order.findOneAndUpdate(
    { razorpayOrderId, retailer: req.user._id },
    {
      razorpayPaymentId,
      razorpaySignature,
      paymentStatus: 'paid',
      status: 'Confirmed',
    },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  if (order.items.length > 1) {
    await CartItem.deleteMany({ user: req.user._id });
  } else if (order.product) {
    await CartItem.findOneAndDelete({ user: req.user._id, product: order.product });
  }

  return res.status(200).json({ success: true, order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await populateOrder(
    Order.find({ retailer: req.user._id }).sort({ createdAt: -1 })
  ).lean();

  return res.status(200).json({ success: true, orders });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, retailer: req.user._id });

  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  if (order.cancelledAt) {
    return res.status(400).json({ message: 'Order has already been cancelled.' });
  }

  if (order.status === 'Delivered') {
    return res.status(400).json({ message: 'Cannot cancel a delivered order.' });
  }

  order.cancelledAt = new Date();
  order.cancelReason = req.body?.reason?.trim() || 'Cancelled by retailer';

  if (order.paymentStatus === 'paid') {
    if (order.paymentMethod === 'wallet') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { walletBalance: order.totalAmount },
        $push: {
          walletHistory: {
            type: 'credit',
            amount: order.totalAmount,
            reason: 'GoVigi order refund',
          },
        },
      });
      order.paymentStatus = 'refunded';
    } else if (order.paymentMethod === 'razorpay' && order.razorpayPaymentId) {
      try {
        const razorpay = getRazorpayInstance();
        await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(order.totalAmount * 100),
        });
        order.paymentStatus = 'refunded';
      } catch (_error) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { walletBalance: order.totalAmount },
          $push: {
            walletHistory: {
              type: 'credit',
              amount: order.totalAmount,
              reason: 'GoVigi order refund fallback',
            },
          },
        });
        order.paymentStatus = 'refunded';
      }
    }
  }

  await order.save();

  return res.status(200).json({ success: true, order, message: 'Order cancelled.' });
});

export const getWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('walletBalance walletHistory').lean();

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.status(200).json({
    success: true,
    balance: user.walletBalance,
    history: user.walletHistory || [],
  });
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

  const updatedOrder = await populateOrder(Order.findById(order._id)).lean();

  return res.status(200).json({
    message: 'Order status updated successfully.',
    order: updatedOrder,
  });
});
