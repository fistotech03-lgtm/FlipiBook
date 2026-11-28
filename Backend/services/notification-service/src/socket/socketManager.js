const { Server } = require('socket.io');

let ioInstance = null;

const initSocket = (httpServer, isAllowedOrigin) => {
  ioInstance = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    const rawEmail =
      socket.handshake.auth?.email ||
      socket.handshake.query?.email ||
      '';
    const email = String(rawEmail).trim().toLowerCase();

    if (email) {
      socket.join(`user:${email}`);
    }

    socket.on('notification:join', (newEmail) => {
      const clean = String(newEmail || '').trim().toLowerCase();
      if (clean) {
        socket.join(`user:${clean}`);
      }
    });
  });

  return ioInstance;
};

const emitToUser = (email, event, payload) => {
  if (!ioInstance || !email) return;
  const clean = String(email).trim().toLowerCase();
  if (!clean) return;
  ioInstance.to(`user:${clean}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser };
