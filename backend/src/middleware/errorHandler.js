export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const shouldExposeErrorDetails = () => process.env.EXPOSE_ERROR_STACKS === 'true';

export const errorHandler = (error, req, res, _next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const exposeDetails = shouldExposeErrorDetails();
  const isServerError = statusCode >= 500;
  const message =
    isServerError && !exposeDetails
      ? 'Internal server error.'
      : error.message || 'Internal server error.';

  console.error(`Error processing request for ${req.method} ${req.originalUrl}:`, error);

  return res.status(statusCode).json({
    success: false,
    message,
    path: req.originalUrl,
    ...(exposeDetails ? { stack: error.stack } : {}),
  });
};
