const express = require('express');
const app = express();
const he = require('he'); // HTML entity encoder / decoder
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const fs = require('fs');
require('dotenv').config();
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
const apiKey = process.env.EMOJI_API_KEY;

// Use dynamic import for node-fetch (ESM compatibility everywhere)
const fetch = async (...args) => (await import('node-fetch')).default(...args);

const url = 'https://emoji-api.com/emojis';

app.get('/api/data', async (req, res) => {
  const response = await fetch(`${url}?access_key=${apiKey}`);
  const data = await response.json();
  res.json(data);
});

io.on('connection', (socket) => {
  // console.log('socket made connection. Socket ID:', socket.id);
  socket.on('chat', (data) => {
    const encodedData = encode(data);
    io.sockets.emit('chat', encodedData);
  });
  socket.on('typing', (handle) => {
    // broadcast event to send data out to all sockets
    socket.broadcast.emit('typing', handle);
  });

  const imgPath = path.resolve(__dirname, './public/images/mountain.jpg');
  const readStream = fs.createReadStream(imgPath, { encoding: 'binary' });
  const chunks = [];
  let delay = 0;
  readStream.on('data', (chunk) => {
    chunks.push(chunk);
    delay += 10;
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
    handle: he.encode(data.handle),
  };
};

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});
