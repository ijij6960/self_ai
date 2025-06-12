const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let frames = 0;
const gravity = 0.25;
const jump = 4.6;

const bird = {
  x:50,
  y:150,
  w:34,
  h:24,
  frame:0,
  velocity:0,
  draw() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  },
  update() {
    this.velocity += gravity;
    this.y += this.velocity;
    if (this.y + this.h >= canvas.height) {
      this.y = canvas.height - this.h;
      this.velocity = 0;
    }
  },
  flap() {
    this.velocity = -jump;
  }
};

const pipes = {
  list: [],
  width: 52,
  height: 320,
  gap: 100,
  reset() { this.list = []; },
  draw() {
    ctx.fillStyle = '#0f0';
    this.list.forEach(p => {
      ctx.fillRect(p.x, 0, this.width, p.y);
      ctx.fillRect(p.x, p.y + this.gap, this.width, canvas.height - p.y - this.gap);
    });
  },
  update() {
    if (frames % 100 === 0) {
      this.list.push({x:canvas.width, y:Math.floor(Math.random()* (canvas.height- this.gap))});
    }
    this.list.forEach(p => p.x -= 2);
    if (this.list.length && this.list[0].x + this.width < 0) this.list.shift();
    this.list.forEach(p => {
      if (bird.x + bird.w > p.x && bird.x < p.x + this.width &&
          (bird.y < p.y || bird.y + bird.h > p.y + this.gap)) {
        reset();
      }
    });
  }
};

function reset() {
  bird.y = 150;
  bird.velocity = 0;
  pipes.reset();
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') bird.flap();
});

function loop() {
  frames++;
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  pipes.update();
  pipes.draw();

  bird.update();
  bird.draw();

  requestAnimationFrame(loop);
}

loop();
