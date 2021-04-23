// Emoji buttons
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

const emojRange = [
  { start:128513, end:128591, name:'emoticons' }, 
  { start:  9986, end: 10160, name:'dingbats'  }, 
  { start:128640, end:128704, name:'symbols'  }
];
for (let i=0; i<emojRange.length; i++) {
  for (let x=emojRange[i].start; x<emojRange[i].end; x++) {
    const option = document.createElement('option');
    option.value = x;
    option.innerHTML = "&#" + x + ";";
    $('#emoji-dropdown').appendChild(option);
  }
}