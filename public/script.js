const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

let socket = io();

function sendMessage() {
  const data = {
    message: $('#message').value,
    handle: $('#handle').value,
    id: socket.id
  };
  socket.emit('chat', data);
}

// Listen for chat events
socket.on('chat', (data) => {
  const person = data.id === socket.id ? 'self' : '';
  $('#output').innerHTML += `<p class="${person}"><strong>${data.handle}:</strong> <span>${data.message}</span></p>`;
  $('#feedback').innerHTML = '';
  $('#chat-window').scrollTop = $('#chat-window').scrollHeight;
});

// Listen for typing events
socket.on('typing', (data) => {
  $('#feedback').innerHTML = `<p><em>${data} is typing a message...</em></p>`;
});

// toggle send button
const buttonState = { handle: false, message: false }
const buttonEnabled = () => Object.values(buttonState).every(n => Boolean(n));

// emit data down the socket to the server
$('#send').addEventListener('click', (e) => {
  sendMessage();
});

$('#message').addEventListener('keyup', (e) => {
  if (e.key === 'Enter' && buttonEnabled()) {
    sendMessage();
    return;
  }
  socket.emit('typing', $('#handle').value);
  buttonState['message'] = e.target.value.length;
  $('#send').disabled = !buttonEnabled();
});

$('#handle').addEventListener('keyup', (e) => {
  buttonState['handle'] = e.target.value.length;
  $('#send').disabled = !buttonEnabled();
});

$('#clear-chat').addEventListener('click', (e) => {
  console.log(e.target);
  $('#output').innerHTML = '';
  $('#feedback').innerHTML = '';
});

const emojis = ["😀", "😅", "😉", "😂", "🤩", "😍"];

emojis.forEach(emoji => {
  const btn = document.createElement('btn');
  btn.classList.add('btn', 'emoji');
  btn.setAttribute('value', emoji);
  btn.textContent = emoji;
  btn.addEventListener('click', (e) => {
    $('#message').value += emoji;
    buttonState['message'] = e.currentTarget.value.length;
    $('#send').disabled = !buttonEnabled();
  });
  $('#emoji-container').appendChild(btn);
});