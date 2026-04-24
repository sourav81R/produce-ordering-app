# GoVigi Produce Ordering App

A full-stack produce ordering system built for the GoVigi brief. The required evaluator stack stays intact:

- `backend`: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- `web`: Next.js with SSR on `/products`
- `mobile`: Expo + React Native
- `storage`: JWT in `localStorage` on web and `AsyncStorage` on mobile

Beyond the brief, this version also adds:

- cart management with quantity updates
- favorites
- Razorpay online payments
- wallet payments
- cash on delivery

## Core API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Register with name, email, password |
| `POST` | `/api/auth/login` | No | Login and receive JWT |
| `GET` | `/api/products` | No | Fetch all available products |
| `POST` | `/api/orders` | Yes | Place an order |
| `GET` | `/api/orders` | Yes | Get my orders |
| `GET` | `/api/cart` | Yes | Get cart items |
| `POST` | `/api/cart` | Yes | Add item to cart |
| `PUT` | `/api/cart/:productId` | Yes | Update cart quantity |
| `DELETE` | `/api/cart/:productId` | Yes | Remove cart item |
| `DELETE` | `/api/cart` | Yes | Clear cart |
| `GET` | `/api/favorites` | Yes | Get favorite products |
| `POST` | `/api/favorites/toggle` | Yes | Toggle favorite |
| `GET` | `/api/orders/payment-config` | Yes | Get Razorpay key id |
| `POST` | `/api/orders/verify-payment` | Yes | Verify Razorpay payment |
| `POST` | `/api/orders/:id/cancel` | Yes | Cancel order and refund when applicable |
| `GET` | `/api/wallet` | Yes | Get wallet balance and history |

## Order Statuses

The evaluator-required statuses are preserved exactly:

`Pending → Confirmed → Delivered`

Cancelled orders are tracked with cancellation metadata while keeping the required status enum intact.

## Prerequisites

- Node.js 18+
- MongoDB Atlas account or another MongoDB connection string
- Razorpay account in test mode
- Expo CLI tooling through `npx expo`

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd produce-ordering-app
cd backend && npm install
cd ../web && npm install
cd ../mobile && npm install
```

### 2. Configure environment

Copy and fill the environment files:

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env.local
cp mobile/.env.example mobile/.env
```

### 3. Seed products

```bash
cd backend
npm run seed
```

This clears old products, orders, cart items, and favorites, then inserts 16 sample products.

### 4. Run backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000`.

### 5. Run web portal

```bash
cd web
npm run dev
```

Open `http://localhost:3000/products`.

### 6. Run mobile app

```bash
cd mobile
npm run start
```

Use Expo to launch the app. For native Razorpay checkout on Android/iOS, make sure the native dependency is installed and the build includes `react-native-razorpay`.

## Environment Variables

### Backend: `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/produce-ordering-app
JWT_SECRET=replace_with_a_secure_random_string_64_chars
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Web: `web/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### Mobile: `mobile/.env`

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

For physical devices, replace `localhost` with your machine’s LAN IP.

## Razorpay Test Setup

1. Create or open a Razorpay account.
2. Go to Dashboard → Settings → API Keys.
3. Generate test keys.
4. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`.
5. Add the public key to web and mobile env files.
6. Use Razorpay test cards from the dashboard documentation.

## Main Web Routes

- `/login`
- `/register`
- `/products`
- `/favorites`
- `/cart`
- `/checkout`
- `/orders`

## Main Mobile Screens

- Login
- Register
- Products
- Cart
- Favorites
- Checkout
- My Orders

## Notes

- The web products page uses `getServerSideProps`, so `/products` is SSR as required.
- Web stores JWT in `localStorage`.
- Mobile stores JWT and the signed-in profile in `AsyncStorage`.
- Cart and favorites are protected backend resources, so users must sign in before using them.
- If the API is empty or unavailable, the catalogue falls back to dummy products so the UI is never blank.
