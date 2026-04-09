// src/index.js
import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';

// 1. Conexión a la base de datos usando config.db.uri
mongoose.connect(config.db.uri)
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('Connection error:', err));

// 2. CORRECCIÓN: Usa config.port en lugar de PORT
app.listen(config.port, () => {
  console.log(`PRACTICE server running on port ${config.port}`);
});