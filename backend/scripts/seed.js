import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import { Order } from '../src/models/Order.js';
import { Product } from '../src/models/Product.js';

dotenv.config();

const products = [
  { name: 'Tomato', category: 'Vegetable', price: 30, unit: 'kg' },
  { name: 'Potato', category: 'Vegetable', price: 18, unit: 'kg' },
  { name: 'Spinach', category: 'Vegetable', price: 24, unit: 'kg' },
  { name: 'Onion', category: 'Vegetable', price: 28, unit: 'kg' },
  { name: 'Carrot', category: 'Vegetable', price: 40, unit: 'kg' },
  { name: 'Banana', category: 'Fruit', price: 40, unit: 'piece' },
  { name: 'Apple', category: 'Fruit', price: 120, unit: 'kg' },
  { name: 'Orange', category: 'Fruit', price: 90, unit: 'kg' },
  { name: 'Mango', category: 'Fruit', price: 80, unit: 'kg' },
  { name: 'Papaya', category: 'Fruit', price: 55, unit: 'piece' },
];

const seedProducts = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment.');
    }

    await connectDB();

    await Order.deleteMany({});
    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log('Produce Ordering sample products seeded successfully.');
    console.table({
      products: products.length,
      categories: 2,
    });
    process.exit(0);
  } catch (error) {
    console.error(`Failed to seed products: ${error.message}`);
    process.exit(1);
  }
};

await seedProducts();
