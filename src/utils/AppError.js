export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Indica que es un error previsto por nosotros

    Error.captureStackTrace(this, this.constructor);
  }

  // Métodos factoría para errores comunes (opcional, pero profesional)
  static badRequest(msg) { return new AppError(msg || 'Incorrect request', 400); }
  static unauthorized(msg) { return new AppError(msg || 'Unauthorized', 401); }
  static forbidden(msg) { return new AppError(msg || 'Forbidden access', 403); }
  static notFound(msg) { return new AppError(msg || 'Not found', 404); }
  static conflict(msg) { return new AppError(msg || 'Data conflict', 409); }
}