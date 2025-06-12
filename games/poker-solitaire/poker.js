const grid = document.getElementById('grid');
const suits = ['♠','♥','♦','♣'];
const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck = [];
let placed = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function init() {
  deck = [];
  for (const s of suits) {
    for (const r of ranks) {
      deck.push(`${r}${s}`);
    }
  }
  shuffle(deck);
  grid.innerHTML = '';
  placed = 0;
  for (let i=0;i<25;i++) {
    const div = document.createElement('div');
    div.className = 'card';
    div.addEventListener('click', () => place(div));
    grid.appendChild(div);
  }
}

function place(div) {
  if (div.textContent || placed >= 25) return;
  const card = deck.pop();
  div.textContent = card;
  div.classList.add('revealed');
  placed++;
  if (placed === 25) alert('All cards placed!');
}

init();
