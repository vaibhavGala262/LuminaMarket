import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

// Create order from cart (checkout)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userEmail = req.user.email;

    // 1. Find the user's cart
    const cart = await Cart.findOne({ userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 2. Calculate total
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // 3. Create the Order Record with userId
    const newOrder = new Order({
      userId,
      userEmail,
      items: cart.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image
      })),
      totalAmount,
      status: 'completed' // Order is complete immediately after checkout
    });

    await newOrder.save();

    // 4. Clear the Cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: newOrder._id,
      order: newOrder
    });

  } catch (error) {
    console.error('Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
};

// Get user's order history
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};