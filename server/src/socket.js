const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const Room = require('./models/Room');

// Track online users: { userId -> { socketId, username } }
const onlineUsers = new Map();

const socketHandler = (io) => {

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`🔌 ${user.username} connected (${socket.id})`);

    // Mark user as online
    onlineUsers.set(user._id.toString(), {
      socketId: socket.id,
      username: user.username
    });
    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // Broadcast updated online users list
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // --- JOIN ROOM ---
    socket.on('join_room', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return socket.emit('error', { message: 'Room not found' });

        socket.join(roomId);

        // System message: user joined
        const sysMsg = await Message.create({
          content: `${user.username} joined the room`,
          sender: user._id,
          room: roomId,
          type: 'system'
        });
        await sysMsg.populate('sender', 'username avatar');

        io.to(roomId).emit('system_message', sysMsg);
        console.log(`👥 ${user.username} joined room ${room.name}`);
      } catch (err) {
        socket.emit('error', { message: 'Could not join room' });
      }
    });

    // --- LEAVE ROOM ---
    socket.on('leave_room', async ({ roomId }) => {
      socket.leave(roomId);
      const room = await Room.findById(roomId);
      if (room) {
        const sysMsg = await Message.create({
          content: `${user.username} left the room`,
          sender: user._id,
          room: roomId,
          type: 'system'
        });
        await sysMsg.populate('sender', 'username avatar');
        io.to(roomId).emit('system_message', sysMsg);
      }
    });

    // --- SEND MESSAGE ---
    socket.on('send_message', async ({ roomId, content }) => {
      try {
        if (!content || !content.trim()) return;
        if (content.length > 2000) return socket.emit('error', { message: 'Message too long' });

        const message = await Message.create({
          content: content.trim(),
          sender: user._id,
          room: roomId,
          type: 'text'
        });
        await message.populate('sender', 'username avatar');

        io.to(roomId).emit('receive_message', message);
      } catch (err) {
        socket.emit('error', { message: 'Could not send message' });
      }
    });

    // --- TYPING INDICATORS ---
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', { userId: user._id, username: user.username });
    });

    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('user_stop_typing', { userId: user._id });
    });

    // --- DISCONNECT ---
    socket.on('disconnect', async () => {
      onlineUsers.delete(user._id.toString());
      await User.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() });
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`🔴 ${user.username} disconnected`);
    });
  });
};

module.exports = { socketHandler };
