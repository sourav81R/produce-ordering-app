import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = process.env.VERCEL === '1';
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig = {
  allowedDevOrigins,
  ...(isVercel ? {} : { distDir: '.next-web' }),
  ...(isVercel
    ? {}
    : {
        turbopack: {
          root: __dirname,
        },
      }),
};

export default nextConfig;
