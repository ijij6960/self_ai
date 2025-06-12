const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
context.scale(20, 20);

const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');
nextCtx.scale(20, 20);

const arena = createMatrix(12, 20);
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
  lines: 0,
  stage: 1
};

let nextMatrix = null;

let audioCtx;

function playStartSound() {
  try {
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = [659, 494, 554, 587, 554, 494, 440, 440]; // Tetris theme
    let t = audioCtx.currentTime;
    notes.forEach(freq => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, t);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
      t += 0.15;
    });
  } catch (e) {
    /* ignore */
  }
}

function playEndSound() {
  try {
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [659, 523, 415, 311];
    let t = audioCtx.currentTime;
    freqs.forEach(freq => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, t);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
      t += 0.15;
    });
  } catch (e) {
    /* ignore */
  }
}

function playStageUpSound() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    /* ignore */
  }
}

function playLandSound() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.value = 110;
    osc2.frequency.value = 165;
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.07);
    osc2.stop(audioCtx.currentTime + 0.07);
  } catch (e) {
    /* ignore */
  }
}

function playClearSound() {
  playEndSound();
}

const STORAGE_KEY = 'tetrisHighScores';

function getHighScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveHighScores(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function addHighScore(stage, score) {
  const list = getHighScores();
  list.push({ stage, score });
  list.sort((a, b) => {
    if (b.stage === a.stage) return b.score - a.score;
    return b.stage - a.stage;
  });
  list.splice(10);
  saveHighScores(list);
}

function updateHighScores() {
  const el = document.getElementById('records');
  if (!el) return;
  const list = getHighScores();
  el.innerHTML = '';
  list.forEach(rec => {
    const li = document.createElement('li');
    li.textContent = `Stage ${rec.stage} - ${rec.score} pts`;
    el.appendChild(li);
  });
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === 'O') {
    return [
      [2, 2],
      [2, 2],
    ];
  } else if (type === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  } else if (type === 'J') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ];
  } else if (type === 'I') {
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playLandSound();
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerHardDrop() {
  while (!collide(arena, player)) {
    player.pos.y++;
  }
  player.pos.y--;
  merge(arena, player);
  playLandSound();
  playerReset();
  arenaSweep();
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  if (!nextMatrix) {
    nextMatrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  }
  player.matrix = nextMatrix;
  nextMatrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  drawNext();
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    gameOver();
    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.lines = 0;
    player.stage = 1;
    dropInterval = 1000;
    updateScore();
    updateStage();
    updateHighScores();
    playStartSound();
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function getGhostPosition() {
  const ghost = {
    pos: { x: player.pos.x, y: player.pos.y },
    matrix: player.matrix
  };
  while (!collide(arena, ghost)) {
    ghost.pos.y++;
  }
  ghost.pos.y--;
  return ghost.pos;
}

function arenaSweep() {
  let cleared = 0;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    cleared++;
  }
  if (cleared > 0) {
    player.lines += cleared;
    player.score += cleared * 10 * player.stage;
    if (player.lines >= player.stage * 10) {
      player.stage++;
      dropInterval = Math.max(dropInterval * 0.8, 100);
      updateStage();
      playStageUpSound();
    }
    playClearSound();
    updateScore();
  }
}

function drawMatrix(matrix, offset, ctx = context, colorOverride = null, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colorOverride || colors[value];
        ctx.fillRect(x + offset.x,
                     y + offset.y,
                     1, 1);
      }
    });
  });
  ctx.restore();
}

function drawGrid() {
  context.strokeStyle = 'rgba(255,255,255,0.15)';
  context.lineWidth = 0.05;
  for (let x = 0; x <= arena[0].length; x++) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, arena.length);
    context.stroke();
  }
  for (let y = 0; y <= arena.length; y++) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(arena[0].length, y);
    context.stroke();
  }
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  drawMatrix(arena, {x:0, y:0});
  const ghostPos = getGhostPosition();
  drawMatrix(player.matrix, ghostPos, context, null, 0.35);
  drawMatrix(player.matrix, player.pos);
}

function drawNext() {
  nextCtx.fillStyle = '#000';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (nextMatrix) {
    // center preview a bit
    const xOff = Math.floor((nextCanvas.width/20 - nextMatrix[0].length)/2);
    const yOff = Math.floor((nextCanvas.height/20 - nextMatrix.length)/2);
    drawMatrix(nextMatrix, {x:xOff, y:yOff}, nextCtx);
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.title = `Tetris - ${player.score}`;
  const el = document.getElementById('score');
  if (el) el.textContent = player.score;
}

function updateStage() {
  const el = document.getElementById('stage');
  if (el) el.textContent = player.stage;
  updateSpeed();
}

function updateSpeed() {
  const el = document.getElementById('speed');
  if (el) el.textContent = dropInterval;
}

function gameOver() {
  playEndSound();
  addHighScore(player.stage, player.score);
  alert(`Game Over! Stage: ${player.stage} | Score: ${player.score}`);
}

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.code === 'Space') {
    playerHardDrop();
  } else if (event.key === 'ArrowUp') {
    playerRotate(1);
  }
});

playerReset();
playStartSound();
updateScore();
updateStage();
updateSpeed();
updateHighScores();
update();
