const boardEl = document.getElementById('board');
const size = 9;
const mineCount = 10;
let board = [];

function init() {
  board = [];
  boardEl.innerHTML = '';
  for (let y=0; y<size; y++) {
    const row = [];
    for (let x=0; x<size; x++) {
      const cell = {mine:false,revealed:false,flag:false,count:0,x,y};
      row.push(cell);
      const div = document.createElement('div');
      div.className = 'cell';
      div.addEventListener('click', () => reveal(cell));
      div.addEventListener('contextmenu', e => {e.preventDefault(); toggleFlag(cell);});
      cell.el = div;
      boardEl.appendChild(div);
    }
    board.push(row);
    const br = document.createElement('br');
    boardEl.appendChild(br);
  }
  placeMines();
  countNeighbors();
}

function placeMines() {
  let placed = 0;
  while (placed < mineCount) {
    const x = Math.floor(Math.random()*size);
    const y = Math.floor(Math.random()*size);
    const cell = board[y][x];
    if (!cell.mine) { cell.mine = true; placed++; }
  }
}

function countNeighbors() {
  for (let y=0;y<size;y++) {
    for (let x=0;x<size;x++) {
      const cell = board[y][x];
      if (cell.mine) continue;
      let count = 0;
      for (let yy=-1;yy<=1;yy++) {
        for (let xx=-1;xx<=1;xx++) {
          if (yy===0&&xx===0) continue;
          const n = board[y+yy] && board[y+yy][x+xx];
          if (n && n.mine) count++;
        }
      }
      cell.count = count;
    }
  }
}

function reveal(cell) {
  if (cell.revealed || cell.flag) return;
  cell.revealed = true;
  cell.el.classList.add('revealed');
  if (cell.mine) {
    cell.el.textContent = 'X';
    alert('Game Over');
    init();
    return;
  }
  if (cell.count) {
    cell.el.textContent = cell.count;
  } else {
    flood(cell);
  }
}

function flood(cell) {
  for (let yy=-1;yy<=1;yy++) {
    for (let xx=-1;xx<=1;xx++) {
      const n = board[cell.y+yy] && board[cell.y+yy][cell.x+xx];
      if (n && !n.revealed && !n.mine) reveal(n);
    }
  }
}

function toggleFlag(cell) {
  if (cell.revealed) return;
  cell.flag = !cell.flag;
  cell.el.textContent = cell.flag ? 'F' : '';
}

init();
