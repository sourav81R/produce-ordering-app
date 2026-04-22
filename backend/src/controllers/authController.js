import { User } from '../models/User.js';
import { canVerifyFirebaseTokens, verifyFirebaseIdToken } from '../config/firebaseAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  provider: user.provider,
  createdAt: user.createdAt,
});

const buildAuthResponse = (user, message) => ({
  message,
  token: generateToken(user._id.toString()),
  user: sanitizeUser(user),
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.trim().length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: password.trim(),
  });

  return res.status(201).json({
    message: 'User registered successfully.',
    user: sanitizeUser(user),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (!user.password) {
    return res.status(401).json({
      message: 'This account does not have a password. Please continue with Google.',
    });
  }

  if (!(await user.comparePassword(password.trim()))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.status(200).json(buildAuthResponse(user, 'Login successful.'));
});

export const firebaseLoginUser = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken?.trim()) {
    return res.status(400).json({ message: 'Firebase ID token is required.' });
  }

  if (!canVerifyFirebaseTokens()) {
    return res.status(500).json({
      message: 'Firebase authentication is not configured on the server.',
    });
  }

  let decodedToken;
  try {
    decodedToken = await verifyFirebaseIdToken(idToken.trim());
  } catch (error) {
    if (error?.code === 'FIREBASE_CONFIG_MISSING') {
      return res.status(500).json({ message: error.message });
    }

    if (error?.code === 'FIREBASE_PUBLIC_KEYS_UNAVAILABLE') {
      return res.status(503).json({ message: error.message });
    }

    return res.status(401).json({ message: 'Invalid Firebase ID token.' });
  }

  const { email, email_verified: emailVerified, name, uid } = decodedToken;

  if (!email || !emailVerified) {
    return res.status(400).json({
      message: 'The Google account must provide a verified email address.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    if (user.firebaseUid && user.firebaseUid !== uid) {
      return res.status(409).json({
        message: 'This email is already linked to a different Google account.',
      });
    }

    const updates = {};

    if (!user.firebaseUid) {
      updates.firebaseUid = uid;
    }

    if (!user.name && name) {
      updates.name = name.trim();
    }

    if (!user.provider && !user.password) {
      updates.provider = 'google';
    }

    if (Object.keys(updates).length) {
      user = await User.findByIdAndUpdate(user._id, updates, {
        new: true,
        runValidators: true,
      });
    }

    return res.status(200).json(buildAuthResponse(user, 'Google login successful.'));
  }

  user = await User.create({
    name: name?.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    firebaseUid: uid,
    provider: 'google',
  });

  return res.status(200).json(buildAuthResponse(user, 'Google login successful.'));
});
