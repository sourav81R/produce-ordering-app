# Produce Ordering App

## Project Overview

Produce Ordering App is a full-stack monorepo that includes:

- A `Node.js + Express + MongoDB` backend API
- A `Next.js` web application
- A `React Native (Expo)` mobile application

Users can register, log in, browse produce, place orders, and review their own order history. Authentication is powered by JWT, passwords are hashed with bcrypt, and orders are scoped to the logged-in user.

The app now supports both:

- Email/password authentication
- Google sign-in through Firebase on web and mobile

In both cases, the backend verifies identity and issues the application's own JWT for API access.

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv
- Firebase Admin SDK

### Web

- Next.js
- React
- Axios
- Firebase Web SDK
- localStorage for JWT persistence

### Mobile

- React Native
- Expo
- Axios
- Firebase Web SDK
- Expo AuthSession
- AsyncStorage for JWT persistence

## Folder Structure

```text
produce-ordering-app/
  backend/
    scripts/
      seedProducts.js
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      app.js
      server.js
    package.json
  mobile/
    src/
      api/
      components/
      constants/
      context/
      screens/
      utils/
    App.js
    package.json
  web/
    components/
    lib/
    pages/
    styles/
    package.json
  README.md
```

## Setup Instructions

### 1. Clone or open the monorepo

```bash
cd produce-ordering-app
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` using this template:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.4spwhe6.mongodb.net/produce-ordering-app?appName=Cluster0
JWT_SECRET=replace-with-a-secure-secret
FIREBASE_PROJECT_ID=produce-ordering-app
# Optional: add these if you want to initialize Firebase Admin with a service account.
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

Notes:

- `FIREBASE_PROJECT_ID` is enough for backend Firebase ID token verification in this project
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are optional unless you want to initialize Firebase Admin with a service account
- Keep the private key server-side only
- The backend continues to issue the app JWT after verifying Firebase ID tokens

Seed the product catalog:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

### 3. Web setup

Open a new terminal:

```bash
cd web
npm install
```

Create `.env.local` inside `web/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"AIzaSyBhOBrJgkyU0WfyqN9bBOQMLVMnmW5iTuo","authDomain":"produce-ordering-app.firebaseapp.com","projectId":"produce-ordering-app","storageBucket":"produce-ordering-app.firebasestorage.app","messagingSenderId":"49028414977","appId":"1:49028414977:web:6bbbf7394d5d3b7d1e8a00","measurementId":"G-NFHMY8VDNE"}
ALLOWED_DEV_ORIGINS=192.168.0.108
```

Start the web app:

```bash
npm run dev
```

Notes:

- `npm run dev` uses the webpack dev server for a more stable local setup with this project
- Set `ALLOWED_DEV_ORIGINS` only if you open the Next.js dev server from another device or from your LAN IP

### 4. Mobile setup

Open a new terminal:

```bash
cd mobile
npm install
```

Create `.env` inside `mobile/`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_FIREBASE_CONFIG={"apiKey":"AIzaSyBhOBrJgkyU0WfyqN9bBOQMLVMnmW5iTuo","authDomain":"produce-ordering-app.firebaseapp.com","projectId":"produce-ordering-app","storageBucket":"produce-ordering-app.firebasestorage.app","messagingSenderId":"49028414977","appId":"1:49028414977:web:6bbbf7394d5d3b7d1e8a00","measurementId":"G-NFHMY8VDNE"}
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Start the mobile app:

```bash
npx expo start
```

If you run the Expo app on a physical device, replace `localhost` with your machine's local network IP address so the device can reach the backend.

The mobile Google sign-in flow uses Expo AuthSession and browser-based OAuth. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to the Google OAuth web client ID associated with your Firebase project.

### 5. Firebase setup checklist

Before testing Google login:

1. In Firebase Console, enable `Authentication > Sign-in method > Google`
2. Set `FIREBASE_PROJECT_ID` in the backend `.env`
3. Optionally generate a service account in Firebase / Google Cloud Console if you want to initialize Firebase Admin directly
4. Copy the provided Firebase web config into the web and mobile env files
5. Add the Google OAuth web client ID to `mobile/.env`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/firebase-login`

### Products

- `GET /api/products`

### Orders

- `POST /api/orders` (protected)
- `GET /api/orders` (protected, returns logged-in user's orders)

## Request Payload Examples

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

## Sample Credentials

No default user is seeded. Register a new account through either the web app or the mobile app, then use those credentials to log in.

## Notes

- Order status defaults to `Pending`
- Product list is public
- Order routes are protected with JWT middleware
- Google sign-in tokens are verified on the backend before the app issues its own JWT
- The backend never trusts the frontend directly and always issues its own JWT
- The web app stores JWT in `localStorage`
- The mobile app stores JWT in `AsyncStorage`
