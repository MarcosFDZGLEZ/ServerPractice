import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './config/index.js';
import User from './models/User.js';

let io;

const companyRoomName = (companyId) => `company:${companyId}`;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith('Bearer')
          ? socket.handshake.headers.authorization.split(' ')[1]
          : undefined);

      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const currentUser = await User.findOne({ _id: decoded.id, deleted: false });

      if (!currentUser) {
        return next(new Error('User not found or deleted'));
      }

      socket.user = currentUser;
      return next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.user?.company) {
      socket.join(companyRoomName(socket.user.company));
    }

    socket.emit('connected', { message: 'WebSocket authenticated' });
  });

  return io;
};

export const emitToCompany = (companyId, event, data) => {
  if (!io || !companyId) return;
  io.to(companyRoomName(companyId)).emit(event, data);
};
