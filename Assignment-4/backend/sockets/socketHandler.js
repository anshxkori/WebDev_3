const { appEvents } = require('../events/eventHandler');

// Track online users: socketId -> { username, room, userId }
const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    // Exact log format matching assignment screenshot Fig 3: "User connected: <socket.id>"
    console.log(`User connected: ${socket.id}`);

    // Join room
    socket.on('joinRoom', (payload) => {
      const room = (typeof payload === 'object' && payload?.room) ? payload.room : (typeof payload === 'string' ? payload : 'general');
      const username = (typeof payload === 'object' && payload?.username) ? payload.username : 'Anonymous';
      const userId = (typeof payload === 'object' && payload?.userId) ? payload.userId : null;

      socket.join(room);
      connectedUsers.set(socket.id, { username, room, userId, socketId: socket.id });

      // Exact log format matching assignment screenshot Fig 3: "<socket.id> joined room <room>"
      console.log(`${socket.id} joined room ${room}`);

      // Broadcast updated user list for this room
      const roomUsers = Array.from(connectedUsers.values()).filter((u) => u.room === room);
      io.to(room).emit('roomUsers', {
        room,
        users: roomUsers,
      });

      // System notification
      socket.to(room).emit('systemMessage', {
        message: `${username} joined the room`,
        room,
        timestamp: new Date().toISOString(),
      });
    });

    // Send Message
    socket.on('sendMessage', (data) => {
      const room = data.room || 'general';
      const username = data.username || connectedUsers.get(socket.id)?.username || 'Anonymous';
      const message = data.message || '';
      const timestamp = data.timestamp || new Date().toISOString();

      // Exact log format matching assignment screenshot Fig 3: "[<room>] <username>: <message>"
      console.log(`[${room}] ${username}: ${message}`);

      // Emit Node.js EventEmitter event
      appEvents.emit('chatMessage', {
        room,
        username,
        message,
        timestamp,
      });

      const messagePayload = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        room,
        username,
        message,
        timestamp,
        socketId: socket.id,
      };

      // Broadcast to everyone in the room (including sender)
      io.to(room).emit('receiveMessage', messagePayload);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`User disconnected: ${socket.id} (${user.username})`);
        connectedUsers.delete(socket.id);

        const roomUsers = Array.from(connectedUsers.values()).filter((u) => u.room === user.room);
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: roomUsers,
        });

        socket.to(user.room).emit('systemMessage', {
          message: `${user.username} left the room`,
          room: user.room,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log(`User disconnected: ${socket.id}`);
      }
    });
  });
};

module.exports = initializeSocket;
