import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const parseCookieHeader = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((accumulator, part) => {
    const [key, ...valueParts] = part.trim().split('=');

    if (!key) {
      return accumulator;
    }

    accumulator[key] = decodeURIComponent(valueParts.join('='));
    return accumulator;
  }, {});

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookies = parseCookieHeader(req.headers.cookie);
  const cookieToken = cookies.token;

  if (!authHeader?.startsWith('Bearer ') && !cookieToken) {
    return res.status(401).json({ message: 'Not authorized. Missing bearer token.' });
  }

  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookieToken;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized. User not found.' });
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'Your account has been suspended.' });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to access this resource.' });
  }

  return next();
};
