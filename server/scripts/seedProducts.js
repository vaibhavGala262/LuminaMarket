import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const products = [
  {
    name: 'Quantum Noise-Cancelling Headphones',
    price: 299.99,
    description: 'Experience silence with our latest active noise cancelling technology. 30-hour battery life and premium comfort.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    rating: 4.8,
    stock: 50,
    isNewArrival: false
  },
  {
    name: 'Minimalist Leather Backpack',
    price: 129.50,
    description: 'Handcrafted from genuine leather. Features a dedicated laptop compartment and water-resistant finish.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    rating: 4.6,
    stock: 30,
    isNewArrival: false
  },
  {
    name: 'Smart Home Hub Display',
    price: 149.00,
    description: 'Control your entire home from one device. Voice activated, touch screen, and compatible with all major smart devices.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1558002038-1091a16627a3?w=800&q=80',
    rating: 4.5,
    stock: 25,
    isNewArrival: false
  },
  {
    name: 'Organic Cotton Summer Dress',
    price: 89.99,
    description: 'Lightweight, breathable, and sustainable. Perfect for warm weather with a classic silhouette.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
    rating: 4.7,
    stock: 40,
    isNewArrival: false
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    price: 45.00,
    description: 'Artisan crafted ceramic dripper and carafe. Designed for the perfect bloom and extraction.',
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80',
    rating: 4.9,
    stock: 60,
    isNewArrival: false
  },
  {
    name: 'Wireless Mechanical Keyboard',
    price: 110.00,
    description: 'Tactile switches with customizable RGB lighting. Connects up to 3 devices simultaneously via Bluetooth.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
    rating: 4.7,
    stock: 35,
    isNewArrival: false
  },
  {
    name: 'Geometric Succulent Planters (Set of 3)',
    price: 34.99,
    description: 'Modern concrete planters with gold accents. Perfect for small succulents and cacti.',
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1459416417445-b3d332787b45?w=800&q=80',
    rating: 4.4,
    stock: 45,
    isNewArrival: false
  },
  {
    name: 'Polarized Aviator Sunglasses',
    price: 159.00,
    description: 'Classic style with modern protection. 100% UV protection and durable metal frames.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    rating: 4.6,
    stock: 55,
    isNewArrival: false
  },
  {
    name: 'Smart Fitness Watch',
    price: 199.99,
    description: 'Track your heart rate, sleep, and workouts. Water-resistant up to 50m with 7-day battery life.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    rating: 4.5,
    stock: 20,
    isNewArrival: true
  },
  {
    name: 'Bamboo Cutting Board Set',
    price: 29.99,
    description: 'Sustainable bamboo boards in three sizes. Durable, knife-friendly, and easy to clean.',
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800&q=80',
    rating: 4.8,
    stock: 70,
    isNewArrival: false
  },
  {
    name: 'Vintage Denim Jacket',
    price: 79.50,
    description: 'Classic washed denim with a relaxed fit. A versatile staple for any wardrobe.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800&q=80',
    rating: 4.3,
    stock: 28,
    isNewArrival: true
  },
  {
    name: 'Aromatherapy Diffuser',
    price: 39.99,
    description: 'Ultrasonic diffuser with ambient LED lighting. Creates a calming atmosphere in any room.',
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?w=800&q=80',
    rating: 4.6,
    stock: 50,
    isNewArrival: true
  }
];

const seedProducts = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lumina-market';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();

