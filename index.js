const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('socket made connection. Socket ID:', socket.id);
  socket.on('chat', (data) => {
    // emit event to send data out to all sockets
    io.sockets.emit('chat', data);
  });
  socket.on('typing', (data) => {
    // broadcast event to send data out to all sockets
    socket.broadcast.emit('typing', data);
  });
});

server.listen(port, () => {
	console.log('Server listening at port %d', port);
});