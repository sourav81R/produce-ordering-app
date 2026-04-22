import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined in the environment.');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment.');
}

await connectDB();

app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});

