import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import config from '../config/index.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Obtener token de la cabecera
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in.', 401));
    }

    // 2. Verificar token usando el secreto de la CONFIGURACIÓN
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3. Buscar el usuario (Usamos findOne para filtrar por ID y que no esté borrado)
    const currentUser = await User.findOne({ _id: decoded.id, deleted: false });

    if (!currentUser) {
      return next(new AppError('The user no longer exists or has been deleted.', 401));
    }

    // 4. PASO CLAVE: Guardamos el usuario completo en la request
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token.', 401));
  }
};