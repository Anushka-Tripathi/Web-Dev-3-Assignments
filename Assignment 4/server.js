require('dotenv').config();
const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const appEvents = require('./events/appEvents');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
  if (!token) {
    socket.data.user = { username: socket.handshake.query?.username || 'Guest' };
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    return next();
  } catch (err) {
    console.error('Socket JWT error:', err.message);
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  appEvents.emit('socket:connected', socket);

  socket.on('joinRoom', (room = 'general') => {
    socket.join(room);
    console.log(`${socket.id} joined room ${room}`);
    io.to(room).emit('systemMessage', {
      room,
      message: `${socket.id} joined room ${room}`
    });
  });

  socket.on('chatMessage', ({ room = 'general', sender, message }) => {
    const userName = sender || socket.data.user?.username || socket.id;
    console.log(`[${room}] ${userName}: ${message}`);
    io.to(room).emit('chatMessage', {
      room,
      sender: userName,
      message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });