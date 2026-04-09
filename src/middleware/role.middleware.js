import { AppError } from '../utils/AppError.js';

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user viene inyectado desde el middleware de 'protect' (JWT)
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Do not have rights to perform this action', 403));
    }
    next();
  };
};