import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import { Product } from '../src/models/Product.js';

dotenv.config();

const products = [
  { name: 'Tomato', category: 'Veg', price: 2.5, unit: 'kg' },
  { name: 'Potato', category: 'Veg', price: 1.8, unit: 'kg' },
  { name: 'Spinach', category: 'Veg', price: 1.2, unit: 'piece' },
  { name: 'Apple', category: 'Fruit', price: 3.4, unit: 'kg' },
  { name: 'Banana', category: 'Fruit', price: 0.4, unit: 'piece' },
  { name: 'Orange', category: 'Fruit', price: 2.9, unit: 'kg' },
];

const seedProducts = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment.');
    }

    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Products seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Failed to seed products: ${error.message}`);
    process.exit(1);
  }
};

await seedProducts();
