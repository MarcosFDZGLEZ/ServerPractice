import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Extraemos los mensajes de error de forma segura
    const errorMessage = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    return next(new AppError(errorMessage, 400));
  }

  // Si la validación es correcta, sobreescribimos req.body con los datos parseados
  // (esto aplica transformaciones como .trim() o .toLowerCase())
  req.body = result.data;
  next();
};