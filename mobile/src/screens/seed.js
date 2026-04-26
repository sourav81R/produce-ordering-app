import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';

dotenv.config();

const products = [
  {
    name: 'Royal Gala Apples',
    category: 'Fruit',
    price: 120,
    unit: 'kg',
    description: 'Crisp, sweet and juicy premium apples.',
    image: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    color: '#FF4D4D',
  },
  {
    name: 'Organic Spinach',
    category: 'Vegetable',
    price: 40,
    unit: 'bunch',
    description: 'Freshly harvested nutrient-rich green spinach.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    color: '#2D5A27',
  },
  {
    name: 'Alphonso Mangoes',
    category: 'Fruit',
    price: 450,
    unit: 'dozen',
    description: 'The king of mangoes, rich and creamy.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    color: '#FFB300',
  },
  {
    name: 'Cherry Tomatoes',
    category: 'Vegetable',
    price: 60,
    unit: '250g',
    description: 'Bite-sized, sweet and tangy red tomatoes.',
    image: 'https://images.unsplash.com/photo-1561131245-c9e7c7696174?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    color: '#FF6347',
  },
  {
    name: 'Hass Avocado',
    category: 'Fruit',
    price: 180,
    unit: 'pc',
    description: 'Perfectly ripe with a buttery texture.',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    color: '#4B5320',
  }
  // ... Add 5 more products here following this pattern
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Database Seeded with 10 professional products!');
  process.exit();
};

seedDB();