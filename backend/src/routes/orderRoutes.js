import express from 'express';
import { createOrder, getMyOrders, updateOrderStatus } from '../controllers/orderController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, getMyOrders);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);

export default router;
