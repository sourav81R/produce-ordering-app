# Produce Ordering App

A full-stack B2B produce ordering system for retailers. Users can register, browse vegetables and fruits, place bulk orders with a delivery date, and track order status from `Pending` to `Confirmed` to `Delivered`.

## Stack

- `backend`: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- `web`: Next.js with SSR, Axios
- `mobile`: React Native with Expo, Axios, AsyncStorage

## Project Structure

```text
produce-ordering-app/
  backend/
  web/
  mobile/
```

## Features

- Email/password registration and login
- JWT-protected order routes
- Public produce catalog
- SSR products page on web
- Place order form on web and mobile
- My Orders screens on web and mobile
- MongoDB seed script with sample fruits and vegetables
- Bonus: admin-only order status update endpoint

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/:id/status` for admins

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace-with-a-secure-secret
```

### Web

Create `web/.env.local` from `web/.env.local.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api
```

### Mobile

Create `mobile/.env` from `mobile/.env.example`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Setup

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

### 2. Seed the database

```bash
cd backend
npm run seed
```

This inserts sample vegetables and fruits and clears old orders/products first.

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the web app

```bash
cd web
npm run dev
```

Open `http://localhost:3000/products`.

### 5. Start the mobile app

```bash
cd mobile
npm start
```

Then open the Expo app on a simulator, emulator, or physical device.

## Web Pages

- `/login`
- `/register`
- `/products`
- `/order/new`
- `/orders`

## Mobile Screens

- Login
- Register
- Product List with category filter
- Place Order
- My Orders

## Notes

- Orders are stored with `userId`, `productId`, `quantity`, `deliveryDate`, and `status`.
- The web products page uses SSR through `getServerSideProps`.
- The mobile app stores JWT in AsyncStorage.
- The web app stores JWT in localStorage and sends it through Axios.

## Beginner Tips

- Seed the backend before testing the product list.
- Register a new account first, then place orders from web or mobile.
- If the web or mobile app cannot reach the backend, confirm the backend is running on port `5000`.
