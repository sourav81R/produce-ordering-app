import jwt from 'jsonwebtoken';

export const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id?.toString?.() || user.id || user.userId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
