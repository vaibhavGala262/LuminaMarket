import express from 'express';
import { getUserOrders } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// Get user's order history
router.get('/', getUserOrders);

export default router;
