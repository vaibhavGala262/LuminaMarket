import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';

const router = express.Router();

router.get('/:sessionId', getCart);
router.post('/:sessionId', addToCart);
router.put('/:sessionId/:productId', updateCartItem);
router.delete('/:sessionId/:productId', removeFromCart);
router.delete('/:sessionId', clearCart);

export default router;

