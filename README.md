# GoVigi Produce Ordering App

Full-stack produce ordering platform with a Node/Express API, a Next.js web storefront, and an Expo React Native mobile app.

The repository currently includes:

- `backend`: Express 5 + MongoDB + JWT auth + Razorpay + Firebase token verification
- `web`: Next.js Pages Router app with SSR on `/products`
- `mobile`: Expo/React Native app with Android build and Expo OTA update support
- seeded catalogue data, real product images, and shared cart/favorites/order flows

## What is implemented

- Retailer registration and login with JWT-based auth
- Google sign-in on the web app through Firebase, verified by the backend
- Product catalogue with 16 seeded fruit and vegetable products
- Product images served from the backend and mirrored into the web app
- Cart management, favorites, wallet balance, and checkout
- Payment methods: cash on delivery, Razorpay, and wallet balance
- Order cancellation with refund handling for wallet and Razorpay payments
- Order tracking with the required status flow: `Pending -> Confirmed -> Delivered`
- Mobile OTA updates through Expo Updates and EAS Update
- Dummy product fallbacks so the web and mobile catalogue do not render blank when the API is unavailable

## Repo structure

```text
produce-ordering-app/
|-- backend/   Express API, MongoDB models, seed scripts, static product images
|-- web/       Next.js storefront and retailer portal
|-- mobile/    Expo React Native app, Android project, EAS config
|-- scripts/   Repo-level utilities such as product image import
```

## Tech stack

| Area | Stack |
| --- | --- |
| Backend | Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt, Razorpay, Firebase Admin |
| Web | Next.js 16, React 19, Axios, Firebase Auth |
| Mobile | Expo 54, React Native 0.81, React Navigation, AsyncStorage, Expo Updates, Razorpay native SDK |

## Architecture notes

- The backend exposes REST APIs under `/api`.
- The backend also serves product images from `/product-images`.
- Web auth stores the JWT in `localStorage` and also benefits from the backend auth cookie.
- Mobile auth stores the JWT and user profile in `AsyncStorage`.
- `/products` on the web app uses `getServerSideProps`, which preserves the SSR requirement.
- The backend supports an admin-only `PATCH /api/orders/:id/status` route, but there is no separate admin UI in this repo.
- Orders above `Rs 500` get free delivery; otherwise the delivery fee is `Rs 30`.

## Main user flows

### Web

- Landing page: `/`
- Login: `/login` and `/auth/login`
- Register: `/register` and `/auth/register`
- Products: `/products`
- Favorites: `/favorites`
- Cart: `/cart`
- Checkout: `/checkout`
- Orders: `/orders`

### Mobile

- Login
- Register
- Products
- Cart
- Favorites
- Checkout
- My Orders

## API overview

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Register a retailer or admin user |
| `POST` | `/api/auth/login` | No | Log in with email and password |
| `POST` | `/api/auth/google` | No | Exchange a Firebase Google ID token for app auth |
| `GET` | `/api/products` | No | Fetch available products |
| `GET` | `/api/cart` | Yes | Fetch cart items |
| `POST` | `/api/cart` | Yes | Add an item to cart |
| `PUT` | `/api/cart/:productId` | Yes | Update cart quantity |
| `DELETE` | `/api/cart/:productId` | Yes | Remove a cart item |
| `DELETE` | `/api/cart` | Yes | Clear the cart |
| `GET` | `/api/favorites` | Yes | Fetch favorite products |
| `POST` | `/api/favorites/toggle` | Yes | Toggle a favorite |
| `POST` | `/api/orders` | Yes | Place an order |
| `GET` | `/api/orders` | Yes | Fetch the current user's orders |
| `GET` | `/api/orders/payment-config` | Yes | Get the public Razorpay key/config state |
| `POST` | `/api/orders/verify-payment` | Yes | Verify a Razorpay payment |
| `POST` | `/api/orders/:id/cancel` | Yes | Cancel an order and refund when applicable |
| `PATCH` | `/api/orders/:id/status` | Yes, admin | Update order status |
| `GET` | `/api/wallet` | Yes | Fetch wallet balance and history |

## Prerequisites

- Recent Node.js LTS
- npm
- MongoDB connection string
- Razorpay test credentials if you want to exercise online payments
- Expo tooling through `npx expo`

## Quick start

### 1. Install dependencies

```bash
cd backend
npm install

cd ../web
npm install

cd ../mobile
npm install
```

### 2. Configure environment variables

#### Backend: `backend/.env`

Copy `backend/.env.example` and fill in:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/produce-ordering-app
MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8
JWT_SECRET=replace-with-a-secure-secret
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:3000
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Notes:

- `FRONTEND_URL` is optional. If omitted, the backend allows all origins. If you set it, use a comma-separated list of allowed web/mobile origins for your environment.
- The Firebase variables are only needed if you want backend-managed Firebase Admin verification. If they are missing, the server can still verify Google ID tokens with Google's public keys as long as `FIREBASE_PROJECT_ID` is set.

#### Web: `web/.env.local`

Create `web/.env.local` using `web/.env.local.example` as a base, then add:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
```

Notes:

- `NEXT_PUBLIC_FIREBASE_CONFIG` is optional. If omitted, the app falls back to the Firebase config already checked into `web/lib/firebase.js`.
- In local development, the web app falls back to `http://localhost:5000/api` when needed.

#### Mobile: `mobile/.env`

Copy `mobile/.env.example` and fill in:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR-LAN-IP:5000
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_EAS_PROJECT_ID=
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
APP_VERSION=1.0.0
ANDROID_VERSION_CODE=1
IOS_BUILD_NUMBER=1
```

Notes:

- For physical devices, do not use `localhost`; use your machine's LAN IP.
- If `EXPO_PUBLIC_EAS_PROJECT_ID` is unset, Expo OTA updates are disabled for release builds.
- The current mobile app uses email/password auth in the UI. Google auth env vars are mentioned in [mobile/DEPLOYMENT.md](mobile/DEPLOYMENT.md) for future/native auth setup, but they are not part of the current mobile sign-in flow.

### 3. Seed the catalogue

```bash
cd backend
npm run seed
```

This clears `orders`, `cartitems`, `favorites`, and `products`, then inserts the 16 seeded products used by the apps.

### 4. Start the backend

```bash
cd backend
npm run dev
```

API base URL: `http://localhost:5000/api`

### 5. Start the web app

```bash
cd web
npm run dev
```

Open `http://localhost:3000/products`.

### 6. Start the mobile app

```bash
cd mobile
npm run start
```

Then open the Expo app, emulator, or run:

```bash
npm run android
```

## Mobile builds and OTA

The mobile project already contains:

- `eas.json` build profiles for preview, installable APK, and production
- `app.config.js` runtime versioning tied to `APP_VERSION`
- `expo-updates` startup checks and automatic reload after update download

Useful commands:

```bash
cd mobile
npm run build:apk
npm run build:preview-apk
npm run build:android
npm run update:preview
npm run update:production
```

See [mobile/DEPLOYMENT.md](mobile/DEPLOYMENT.md) for the full release and OTA workflow.

## Seed data and assets

- The seed script creates 16 storefront-ready products with supplier, origin, pack size, stock, and delivery-window metadata.
- Real product photos live in `backend/public/product-images` and `web/public/product-images`.
- Image source attributions are documented in [PRODUCT_IMAGE_CREDITS.md](PRODUCT_IMAGE_CREDITS.md).
- The repo-level script [scripts/generate-product-images.ps1](scripts/generate-product-images.ps1) can be used to import product images into both backend and web public folders.

## Operational details

- The backend has a MongoDB DNS fallback for `mongodb+srv://` connections when the local DNS resolver is loopback-only.
- Web and mobile both fall back to dummy product data if the catalogue API is empty or unreachable.
- Mobile Razorpay checkout depends on the native `react-native-razorpay` integration being present in the build. If it is unavailable, the app falls back to COD or wallet payments.
- Order cancellation preserves the required order status enum while storing cancellation metadata separately.

## Current gaps

- No automated test suite is configured in the repo right now.
- No admin dashboard is included, even though admin-capable backend routes exist.
- The repo contains generated/build artifacts and native Android files alongside source code.
