export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log para el desarrollador
  console.error(' ERROR:', err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // Solo enviamos el stack en desarrollo si fuera necesario
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};