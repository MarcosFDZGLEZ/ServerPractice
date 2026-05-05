// src/index.js
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import { initSocket } from './socket.js';

// 1. Conexión a la base de datos usando config.db.uri
mongoose.connect(config.db.uri)
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('Connection error:', err));

// 2. CORRECCIÓN: Usa config.port en lugar de PORT
const server = http.createServer(app);
initSocket(server);

server.listen(config.port, () => {
  console.log(`PRACTICE server running on port ${config.port}`);
});