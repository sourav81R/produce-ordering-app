import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import { Item } from '../src/models/Item.js';
import { Order } from '../src/models/Order.js';
import { Product } from '../src/models/Product.js';
import { Shop } from '../src/models/Shop.js';
import { User } from '../src/models/User.js';

dotenv.config();

const products = [
  { name: 'Tomato', category: 'Vegetable', price: 30, unit: 'kg' },
  { name: 'Spinach', category: 'Vegetable', price: 20, unit: 'kg' },
  { name: 'Potato', category: 'Vegetable', price: 18, unit: 'kg' },
  { name: 'Mango', category: 'Fruit', price: 80, unit: 'kg' },
  { name: 'Banana', category: 'Fruit', price: 40, unit: 'piece' },
];

const seedProducts = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment.');
    }

    await connectDB();
    await Order.deleteMany({});
    await Item.deleteMany({});
    await Shop.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({
      role: { $in: ['restaurant', 'delivery'] },
    });

    const [pizzaOwner, bowlOwner, burgerOwner] = await User.create([
      {
        name: 'Marco Romano',
        email: 'marco@foodooza.local',
        password: 'password123',
        role: 'restaurant',
      },
      {
        name: 'Aisha Khan',
        email: 'aisha@foodooza.local',
        password: 'password123',
        role: 'restaurant',
      },
      {
        name: 'Riley Carter',
        email: 'riley@foodooza.local',
        password: 'password123',
        role: 'restaurant',
      },
    ]);

    const shops = await Shop.create([
      {
        name: 'Flame & Crust',
        slug: 'flame-and-crust',
        owner: pizzaOwner._id,
        city: 'Kolkata',
        cuisineTags: ['Pizza', 'Italian', 'Late Night'],
        description: 'Wood-fired pizzas, garlic knots, and comfort food built for cozy nights.',
        coverImage:
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
        rating: 4.8,
        etaMinutes: 28,
        deliveryFee: 39,
        minOrder: 199,
        isFeatured: true,
      },
      {
        name: 'Green Bowl Social',
        slug: 'green-bowl-social',
        owner: bowlOwner._id,
        city: 'Kolkata',
        cuisineTags: ['Healthy', 'Bowls', 'Salads'],
        description: 'Balanced bowls, protein plates, and bright dressings with all-day freshness.',
        coverImage:
          'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
        rating: 4.7,
        etaMinutes: 22,
        deliveryFee: 25,
        minOrder: 179,
        isFeatured: true,
      },
      {
        name: 'Stacked Smash',
        slug: 'stacked-smash',
        owner: burgerOwner._id,
        city: 'Kolkata',
        cuisineTags: ['Burgers', 'Fries', 'American'],
        description: 'Smash burgers, hot fries, and shakes for the loudest cravings in town.',
        coverImage:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        rating: 4.6,
        etaMinutes: 25,
        deliveryFee: 35,
        minOrder: 149,
        isFeatured: true,
      },
    ]);

    await Item.insertMany([
      {
        shop: shops[0]._id,
        name: 'Truffle Fire Pizza',
        slug: 'truffle-fire-pizza',
        description: 'Roasted mushrooms, smoked mozzarella, truffle cream, and basil.',
        category: 'Pizza',
        price: 349,
        isVeg: true,
        rating: 4.9,
        prepTimeMinutes: 25,
        imageUrl:
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
        isFeatured: true,
      },
      {
        shop: shops[0]._id,
        name: 'Chili Chicken Slice',
        slug: 'chili-chicken-slice',
        description: 'Spicy chicken, onion jam, and roasted peppers over a crisp slice.',
        category: 'Pizza',
        price: 189,
        isVeg: false,
        rating: 4.7,
        prepTimeMinutes: 18,
        imageUrl:
          'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80',
      },
      {
        shop: shops[0]._id,
        name: 'Garlic Knot Basket',
        slug: 'garlic-knot-basket',
        description: 'Warm knots tossed in garlic butter and parmesan.',
        category: 'Sides',
        price: 129,
        isVeg: true,
        rating: 4.6,
        prepTimeMinutes: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1620374645498-af6bd681a0bd?auto=format&fit=crop&w=900&q=80',
      },
      {
        shop: shops[1]._id,
        name: 'Teriyaki Power Bowl',
        slug: 'teriyaki-power-bowl',
        description: 'Brown rice, chicken, avocado, pickled cucumber, and sesame drizzle.',
        category: 'Bowls',
        price: 299,
        isVeg: false,
        rating: 4.8,
        prepTimeMinutes: 20,
        imageUrl:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
        isFeatured: true,
      },
      {
        shop: shops[1]._id,
        name: 'Green Goddess Salad',
        slug: 'green-goddess-salad',
        description: 'Crisp greens, feta, herbs, toasted seeds, and creamy green dressing.',
        category: 'Salads',
        price: 259,
        isVeg: true,
        rating: 4.7,
        prepTimeMinutes: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
      },
      {
        shop: shops[1]._id,
        name: 'Cold Brew Citrus Tonic',
        slug: 'cold-brew-citrus-tonic',
        description: 'Sparkling tonic with orange peel and slow-steeped cold brew.',
        category: 'Drinks',
        price: 149,
        isVeg: true,
        rating: 4.5,
        prepTimeMinutes: 10,
        imageUrl:
          'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
      },
      {
        shop: shops[2]._id,
        name: 'Double Smash Classic',
        slug: 'double-smash-classic',
        description: 'Two seared patties, cheddar, onions, pickles, and house sauce.',
        category: 'Burgers',
        price: 319,
        isVeg: false,
        rating: 4.8,
        prepTimeMinutes: 18,
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
        isFeatured: true,
      },
      {
        shop: shops[2]._id,
        name: 'Crispy Paneer Melt',
        slug: 'crispy-paneer-melt',
        description: 'Paneer patty, jalapeno mayo, lettuce, and caramelized onions.',
        category: 'Burgers',
        price: 279,
        isVeg: true,
        rating: 4.6,
        prepTimeMinutes: 16,
        imageUrl:
          'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
      },
      {
        shop: shops[2]._id,
        name: 'Loaded Cajun Fries',
        slug: 'loaded-cajun-fries',
        description: 'Fries with cajun spice, cheese sauce, and crispy onions.',
        category: 'Sides',
        price: 159,
        isVeg: true,
        rating: 4.5,
        prepTimeMinutes: 14,
        imageUrl:
          'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80',
      },
    ]);

    await Product.insertMany(products);
    console.log('Foodooza foundation data seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Failed to seed products: ${error.message}`);
    process.exit(1);
  }
};

await seedProducts();
