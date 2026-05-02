import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import userRouter from './routes/user.routes.js';
import clientRouter from './routes/client.routes.js';
import projectRouter from './routes/project.routes.js';
import deliverynoteRouter from './routes/deliverynote.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { AppError } from './utils/AppError.js';

const app = express();

// 1. Seguridad Global: Helmet y Rate Limit
app.use(helmet()); 

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100, 
  message: 'Too many requests from this IP address, please try again in an hour.'
});
app.use('/api', limiter);

// 2. Middlewares de parseo 
app.use(express.json({ limit: '10kb' })); // Permite leer req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. Desinfección de datos (MongoDB Sanitize)
app.use((req, res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body, {
      replaceWith: '_'
    });
  }
  next();
});

// 4. Archivos estáticos
app.use('/uploads', express.static('uploads')); 

// 5. Rutas
app.use('/api/user', userRouter);
app.use('/api/client', clientRouter);
app.use('/api/project', projectRouter);
app.use('/api/deliverynote', deliverynoteRouter);

// 6. Manejo de rutas no encontradas (Sintaxis Express 5)
app.all('{*path}', (req, res, next) => {
  next(new AppError(`It cannot be found ${req.originalUrl} on this server`, 404));
});

// 7. Middleware de errores centralizado
app.use(errorHandler);

export default app;