import express from 'express';
import {
  firebaseLoginUser,
  loginUser,
  registerUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase-login', firebaseLoginUser);

export default router;
