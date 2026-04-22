export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    message: error.message || 'Internal server error.',
    ...(process.env.NODE_ENV !== 'production' ? { stack: error.stack } : {}),
  });
};

