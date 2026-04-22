# Produce Ordering App

A full-stack monorepo for browsing produce, placing orders, and viewing order history across web and mobile clients.

## Stack

- `backend`: Node.js, Express, MongoDB, Mongoose, JWT
- `web`: Next.js, React, Axios, Firebase Web SDK
- `mobile`: Expo, React Native, Axios, Firebase Web SDK

## Features

- Email/password registration and login
- Google sign-in on web and mobile
- JWT-based protected order APIs
- Public product catalog
- Order placement and personal order history

## Monorepo Layout

```text
produce-ordering-app/
  backend/
    scripts/
    src/
  web/
    components/
    lib/
    pages/
    styles/
  mobile/
    src/
  README.md
```

## Quick Start

1. Clone the repo and open the root folder:

```bash
git clone https://github.com/sourav81R/produce-ordering-app.git
cd produce-ordering-app
```

2. Install dependencies in each app:

```bash
cd backend && npm install
cd ../web && npm install
cd ../mobile && npm install
```

3. Configure environment files:

- `backend/.env`
- `web/.env.local`
- `mobile/.env`

4. Start the backend:

```bash
cd backend
npm run dev
```

5. Start the web app:

```bash
cd web
npm run dev
```

6. Start the mobile app:

```bash
cd mobile
npm run start
```

## Environment Setup

### Backend

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.4spwhe6.mongodb.net/produce-ordering-app?appName=Cluster0
JWT_SECRET=replace-with-a-secure-secret
FIREBASE_PROJECT_ID=produce-ordering-app
# Optional: only needed if you want Firebase Admin initialized with a service account.
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

Notes:

- `FIREBASE_PROJECT_ID` is enough for Firebase ID token verification in this backend
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are optional in this project
- Keep real secrets only in `.env`, never in example files

### Web

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"AIzaSyBhOBrJgkyU0WfyqN9bBOQMLVMnmW5iTuo","authDomain":"produce-ordering-app.firebaseapp.com","projectId":"produce-ordering-app","storageBucket":"produce-ordering-app.firebasestorage.app","messagingSenderId":"49028414977","appId":"1:49028414977:web:6bbbf7394d5d3b7d1e8a00","measurementId":"G-NFHMY8VDNE"}
ALLOWED_DEV_ORIGINS=192.168.0.108
```

Notes:

- `npm run dev` uses `next dev --webpack`
- Set `ALLOWED_DEV_ORIGINS` only if you access the dev server from another device on your LAN

### Mobile

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_FIREBASE_CONFIG={"apiKey":"AIzaSyBhOBrJgkyU0WfyqN9bBOQMLVMnmW5iTuo","authDomain":"produce-ordering-app.firebaseapp.com","projectId":"produce-ordering-app","storageBucket":"produce-ordering-app.firebasestorage.app","messagingSenderId":"49028414977","appId":"1:49028414977:web:6bbbf7394d5d3b7d1e8a00","measurementId":"G-NFHMY8VDNE"}
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Notes:

- On a real phone, replace `localhost` in `EXPO_PUBLIC_API_BASE_URL` with your computer’s LAN IP
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is required for mobile Google sign-in

## Firebase Checklist

Before testing Google authentication:

1. Enable `Authentication > Sign-in method > Google` in Firebase
2. Make sure `localhost` is allowed for web development if needed
3. Set `FIREBASE_PROJECT_ID` in `backend/.env`
4. Copy the Firebase web config into `web/.env.local` and `mobile/.env`
5. Add the Google OAuth web client id to `mobile/.env`

## Available Scripts

### Backend

```bash
npm run dev
npm run start
npm run seed
```

### Web

```bash
npm run dev
npm run dev:turbo
npm run build
npm run start
```

### Mobile

```bash
npm run start
npm run android
npm run ios
npm run web
```

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/firebase-login`

### Products

- `GET /api/products`

### Orders

- `POST /api/orders`
- `GET /api/orders`

## Example Payloads

### Register

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

### Login

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Firebase Login

```json
{
  "idToken": "FIREBASE_ID_TOKEN"
}
```

### Place Order

```json
{
  "product": "PRODUCT_ID",
  "quantity": 2,
  "deliveryDate": "2026-04-25"
}
```

## Notes

- Product browsing is public
- Orders are protected by JWT auth
- The backend verifies Firebase sign-in tokens before issuing the app JWT
- The web app stores the app JWT in `localStorage`
- The mobile app stores the app JWT in `AsyncStorage`
- Order status defaults to `Pending`
