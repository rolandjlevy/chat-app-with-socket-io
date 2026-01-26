const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

// Emoji buttons
const emojis = [
  '👍',
  '❤️',
  '😅',
  '😂',
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '🤣',
  '🔥',
  '✨',
];

// toggle send button
const buttonState = { handle: false, message: false };
const buttonEnabled = () => Object.values(buttonState).every((n) => Boolean(n));

// generate emojis dropdown
emojis.forEach((emoji) => {
  const option = document.createElement('option');
  option.innerHTML = emoji;
  $('#emoji-dropdown').appendChild(option);
});

// add emoji to message on change
$('#emoji-dropdown').addEventListener('change', (e) => {
  const selectedOption = e.currentTarget.options[e.currentTarget.selectedIndex];
  if (selectedOption.textContent) {
    $('#message').value += selectedOption.textContent;
    buttonState['message'] = $('#message').value.length;
    $('#send').disabled = !buttonEnabled();
  }
});

// Fetch emojis from Emoji API
const url = 'https://emoji-api.com/emojis';
fetch(url + `?access_key=${EMOJI_API_KEY}`)
  .then((res) => res.json())
  .then((emojiChars) => {
    const container = $('#emoji-popup');
    emojiChars.forEach((e) => {
      const span = document.createElement('span');
      span.textContent = e.character;
      container.appendChild(span);
    });

    const button = $('#emoji-btn');
    button.disabled = false;
    button.addEventListener('click', () => {
      container.classList.toggle('visible');
    });

    $('#emoji-popup').addEventListener('click', (e) => {
      if (e.target.tagName === 'SPAN') {
        $('#message').value += e.target.textContent;
        buttonState['message'] = $('#message').value.length;
        $('#send').disabled = !buttonEnabled();
      }
    });
  });

let socket = io();

const sendMessage = () => {
  const data = {
    message: $('#message').value,
    handle: $('#handle').value,
    id: socket.id,
  };
  socket.emit('chat', data);
  $('#message').value = '';
  buttonState['message'] = false;
  $('#send').disabled = !buttonEnabled();
};

// Listen for chat events
socket.on('chat', (data) => {
  const person = data.id === socket.id ? 'self' : 'other';
  $('#output').innerHTML +=
    `<p class="${person}"><span><strong>${data.handle}:</strong> <span class="message-text">${data.message}</span><span class="arrow"></span></span></p>`;
  $('#feedback').innerHTML = '';
  $('#chat-window').scrollTop = $('#chat-window').scrollHeight;
});

// Listen for typing events
socket.on('typing', (handle) => {
  $('#feedback').innerHTML = `<p><em>${handle} is typing a message...</em></p>`;
});

// click send to emit data down the socket to the server
$('#send').addEventListener('click', (e) => {
  sendMessage();
});

// press enter to emit data down the socket to the server
['touchend', 'keyup'].forEach((event) => {
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
['touchend', 'keyup'].forEach((event) => {
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
  $('#output').innerHTML = '';
  $('#feedback').innerHTML = '';
});

// broadcasted image
// btoa() method encodes a string in base-64
const imgChunks = [];
socket.on('img-chunk', (chunk) => {
  imgChunks.push(chunk);
  $('#img-stream').setAttribute(
    'src',
    'data:image/jpeg;base64,' + window.btoa(imgChunks),
  );
});
