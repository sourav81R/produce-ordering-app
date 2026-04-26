import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed.'));
    },
    credentials: true,
  })
);
console.log('CORS configured with allowed origins:', allowedOrigins.length > 0 ? allowedOrigins : 'All origins allowed'); 
app.use(express.json());
app.use('/product-images', express.static(path.join(publicDir, 'product-images')));

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'GoVigi Produce Ordering API is running.',
    docs: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      cart: '/api/cart',
      favorites: '/api/favorites',
      wallet: '/api/wallet',
    },
  });
});

app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Use the route groups below to access the GoVigi API.',
    routes: [
      '/api/health',
      '/api/auth',
      '/api/products',
      '/api/orders',
      '/api/cart',
      '/api/favorites',
      '/api/wallet',
    ],
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Produce Ordering API is running.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/wallet', walletRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
