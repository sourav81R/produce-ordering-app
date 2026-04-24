import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import { Order } from '../src/models/Order.js';
import { Product } from '../src/models/Product.js';

dotenv.config();

const products = [
  {
    name: 'Cherry Tomatoes',
    category: 'Vegetable',
    price: 60,
    unit: 'kg',
    emoji: '🍅',
    color: '#FF6B6B',
    tag: 'bestseller',
    description: 'Sweet vine-ripened cherry tomatoes.',
  },
  {
    name: 'Baby Spinach',
    category: 'Vegetable',
    price: 45,
    unit: 'kg',
    emoji: '🥬',
    color: '#51CF66',
    tag: 'organic',
    description: 'Fresh tender baby spinach, ready to use.',
  },
  {
    name: 'Baby Potatoes',
    category: 'Vegetable',
    price: 35,
    unit: 'kg',
    emoji: '🥔',
    color: '#F4A261',
    tag: null,
    description: 'Creamy baby potatoes, great for roasting.',
  },
  {
    name: 'Purple Cabbage',
    category: 'Vegetable',
    price: 40,
    unit: 'kg',
    emoji: '🫐',
    color: '#9775FA',
    tag: 'seasonal',
    description: 'Crunchy purple cabbage, rich in antioxidants.',
  },
  {
    name: 'Broccoli',
    category: 'Vegetable',
    price: 80,
    unit: 'kg',
    emoji: '🥦',
    color: '#2F9E44',
    tag: 'new',
    description: 'Fresh green broccoli, packed with vitamins.',
  },
  {
    name: 'Carrots',
    category: 'Vegetable',
    price: 30,
    unit: 'kg',
    emoji: '🥕',
    color: '#FF922B',
    tag: null,
    description: 'Crunchy sweet carrots, great raw or cooked.',
  },
  {
    name: 'Green Capsicum',
    category: 'Vegetable',
    price: 55,
    unit: 'kg',
    emoji: '🫑',
    color: '#40C057',
    tag: null,
    description: 'Firm green bell peppers, ideal for stir fries.',
  },
  {
    name: 'Sweet Corn',
    category: 'Vegetable',
    price: 25,
    unit: 'piece',
    emoji: '🌽',
    color: '#FAB005',
    tag: 'seasonal',
    description: 'Fresh sweet corn cobs, juicy and great for grilling.',
  },
  {
    name: 'Alphonso Mango',
    category: 'Fruit',
    price: 120,
    unit: 'kg',
    emoji: '🥭',
    color: '#FFA94D',
    tag: 'bestseller',
    description: 'The king of mangoes, rich creamy and aromatic.',
  },
  {
    name: 'Cavendish Banana',
    category: 'Fruit',
    price: 40,
    unit: 'piece',
    emoji: '🍌',
    color: '#FFE066',
    tag: null,
    description: 'Perfectly ripe bananas, great for smoothies.',
  },
  {
    name: 'Strawberries',
    category: 'Fruit',
    price: 150,
    unit: 'kg',
    emoji: '🍓',
    color: '#FF6B6B',
    tag: 'seasonal',
    description: 'Plump bright red strawberries, sweet with a tang.',
  },
  {
    name: 'Watermelon',
    category: 'Fruit',
    price: 20,
    unit: 'kg',
    emoji: '🍉',
    color: '#F03E3E',
    tag: 'new',
    description: 'Seedless watermelon, the best summer refresher.',
  },
  {
    name: 'Green Grapes',
    category: 'Fruit',
    price: 90,
    unit: 'kg',
    emoji: '🍇',
    color: '#8CE99A',
    tag: null,
    description: 'Crisp seedless green grapes, sweet and refreshing.',
  },
  {
    name: 'Pomegranate',
    category: 'Fruit',
    price: 100,
    unit: 'piece',
    emoji: '❤️',
    color: '#C92A2A',
    tag: 'organic',
    description: 'Juicy pomegranate, rich in antioxidants.',
  },
  {
    name: 'Kiwi',
    category: 'Fruit',
    price: 180,
    unit: 'kg',
    emoji: '🥝',
    color: '#74C476',
    tag: 'new',
    description: 'Tangy-sweet kiwi loaded with vitamin C.',
  },
  {
    name: 'Dragon Fruit',
    category: 'Fruit',
    price: 200,
    unit: 'piece',
    emoji: '🐉',
    color: '#E64980',
    tag: 'premium',
    description: 'Exotic pink dragon fruit with mild sweet flavour.',
  },
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
      vegetables: products.filter((product) => product.category === 'Vegetable').length,
      fruits: products.filter((product) => product.category === 'Fruit').length,
    });
    process.exit(0);
  } catch (error) {
    console.error(`Failed to seed products: ${error.message}`);
    process.exit(1);
  }
};

await seedProducts();
