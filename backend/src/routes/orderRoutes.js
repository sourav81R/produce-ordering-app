import express from 'express';
import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getPaymentConfig,
  updateOrderStatus,
  verifyPayment,
} from '../controllers/orderController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, getMyOrders);
router.get('/payment-config', protect, getPaymentConfig);
router.post('/verify-payment', protect, verifyPayment);
router.post('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);

export default router;
