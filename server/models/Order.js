import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userEmail: {
    type: String
  },
  items: [{
    productName: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'completed' }, // completed, cancelled
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);