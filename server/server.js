const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { manageUsers } = require('./rooms');
const { DrawingState } = require('./drawing-state');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5501", 
        methods: ["GET", "POST"]
    }
});

const drawingState = new DrawingState();

app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  manageUsers.addUser(socket.id);

  // Send current state to new user
  socket.emit('init', {
    history: drawingState.getHistory(),
    users: manageUsers.getUsers(),
    userColor: manageUsers.getUserColor(socket.id)
  });

  // Broadcast user list update
  io.emit('userUpdate', manageUsers.getUsers());

  socket.on('draw', (data) => {
    drawingState.addOperation(data);
    socket.broadcast.emit('draw', data);
  });

  socket.on('cursor', (data) => {
    socket.broadcast.emit('cursor', { id: socket.id, ...data });
  });

  socket.on('undo', () => {
    drawingState.undo();
    io.emit('updateHistory', drawingState.getHistory());
  });

  socket.on('disconnect', () => {
    manageUsers.removeUser(socket.id);
    io.emit('userUpdate', manageUsers.getUsers());
  });
});

server.listen(5502, () => {
  console.log('Server running on http://localhost:5502');
});