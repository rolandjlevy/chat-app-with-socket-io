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
  const person = data.id === socket.id ? 'self' : 'other';
  $('#output').innerHTML += `<p class="${person}"><span><strong>${data.handle}:</strong> <span class="message-text">${data.message}</span><span class="arrow"></span></span></p>`;
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

// click send to emit data down the socket to the server
$('#send').addEventListener('click', (e) => {
  sendMessage();
});

// press enter to emit data down the socket to the server
['touchend', 'keyup'].forEach(event => {
  $('#message').addEventListener(event, (e) => {
    if (e.key === 'Enter' && buttonEnabled()) {
      sendMessage();
      return;
    }
    socket.emit('typing', $('#handle').value);
    buttonState['message'] = e.target.value.length;
    $('#send').disabled = !buttonEnabled();
  });
});

// validate send button
['touchend', 'keyup'].forEach(event => {
  $('#handle').addEventListener(event, (e) => {
    buttonState['handle'] = e.target.value.length;
    $('#send').disabled = !buttonEnabled();
  });
});

// Expand / collapse the chat window
window.addEventListener('click', (e) => {
  const collapse = ['INPUT', 'SELECT'].includes(e.target.tagName);
  if (collapse) {
    $('#chat-window').classList.add('collapsed');
  } else {
    $('#chat-window').classList.remove('collapsed');
  }
});

// clear chat content
$('#clear-chat').addEventListener('click', (e) => {
  console.log(e.target);
  $('#output').innerHTML = '';
  $('#feedback').innerHTML = '';
});

// generate emojis dropdown
emoji.forEach(item => {
  const option = document.createElement('option');
  option.innerHTML = item;
  $('#emoji-dropdown').appendChild(option);
});

// add emoji to message on change
$('#emoji-dropdown').addEventListener('change', (e) => {
  $('#message').value += e.target.value;
  buttonState['message'] = e.currentTarget.value.length;
  $('#send').disabled = !buttonEnabled();
});