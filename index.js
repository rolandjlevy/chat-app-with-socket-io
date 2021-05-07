const express = require('express');
const app = express();
const he = require('he'); // HTML entity encoder / decoder
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('socket made connection. Socket ID:', socket.id);
  socket.on('chat', (data) => {
    const encodedData = encode(data);
    io.sockets.emit('chat', encodedData);
  });
  socket.on('typing', (handle) => {
    // broadcast event to send data out to all sockets
    socket.broadcast.emit('typing', handle);
  });

  const imgPath = path.resolve(__dirname, './public/images/mountain.jpg');
  const readStream = fs.createReadStream(imgPath, {encoding:'binary'});
  const chunks = [];
  let delay = 0;
  readStream.on('data', chunk => {
    chunks.push(chunk);
    delay += 0;
    setTimeout(() => {
      socket.emit('img-chunk', chunk);
    }, delay);
  });
  readStream.on('end', () => console.log('Image loaded'));
});

const encode = (data) => {
  return {
    ...data,
    message: he.encode(data.message),
    handle: he.encode(data.handle)
  }
}

server.listen(port, () => {
	console.log('Server listening at port %d', port);
});