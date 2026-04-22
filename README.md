# Foodooza Foundation

This repository began as a produce-ordering assessment app and is now being migrated into a Foodooza-style food delivery platform.

The current implementation delivers a real phase-1 foundation:

- multi-role backend user model: `user`, `restaurant`, `delivery`, `admin`
- cookie-compatible and bearer-token-compatible JWT auth
- restaurant and menu domain models: `Shop`, `Item`
- customer order model with address, payment method, totals, and optional scheduling
- Foodooza-style customer web app:
  - discovery landing page
  - featured restaurants
  - featured dishes
  - restaurant menu page
  - single-shop cart
  - checkout flow
  - orders page

## Repo Layout

```text
produce-ordering-app/
  backend/
  web/
  mobile/
  Foodooza Migration · MD
  README.md
```

## Current Stack

- `backend`: Node.js, Express, MongoDB, Mongoose, JWT, Firebase Admin verification
- `web`: Next.js, React, Axios, Firebase Web SDK
- `mobile`: Expo React Native app from the earlier phase, still present in the repo

## Current Backend Modules

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/firebase-login`
- `GET /api/shops`
- `GET /api/shops/featured`
- `GET /api/shops/:slug`
- `GET /api/items/featured`
- `POST /api/orders`
- `GET /api/orders`

Legacy `products` endpoints are still present for compatibility with the original project structure.

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

```bash
cd ../web
npm install
```

```bash
cd ../mobile
npm install
```

### 2. Configure environment files

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace-with-a-secure-secret
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=optional-service-account-email
FIREBASE_PRIVATE_KEY="optional-private-key"
```

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
```

Create `mobile/.env` if you want to continue using the mobile app:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
```

## Run the Apps

Start backend:

```bash
cd backend
npm run dev
```

Seed sample Foodooza data:

```bash
cd backend
npm run seed
```

Start web:

```bash
cd web
npm run dev
```

Open `http://localhost:3000`.

## Seed Data

The seed script now inserts:

- sample restaurant owners
- featured restaurants
- featured menu items
- legacy produce data for backward compatibility

Important: the seed script clears existing seeded shops, items, orders, and legacy products before inserting fresh sample data.

## Current Scope

Implemented now:

- customer discovery and checkout on web
- upgraded backend food domain foundation
- migration planning doc in [Foodooza Migration · MD](</d:/produce-ordering-app/Foodooza Migration · MD>)

Planned next:

- restaurant dashboard and menu management
- delivery workflow and earnings
- admin moderation
- realtime tracking
- payments, coupons, wallet, reviews, notifications

## Notes

- The mobile app remains in the repo, but the main Foodooza migration work completed in this phase is backend + web.
- Google auth still depends on correct Firebase project setup.
- There is no full automated test suite yet.
