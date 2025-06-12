const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(0, 50, 50);
scene.add(light);

const paddleGeo = new THREE.BoxGeometry(1, 4, 1);
const paddleMat = new THREE.MeshPhongMaterial({color: 0x00ff00});
const paddleLeft = new THREE.Mesh(paddleGeo, paddleMat);
const paddleRight = new THREE.Mesh(paddleGeo, paddleMat);
paddleLeft.position.x = -10;
paddleRight.position.x = 10;
scene.add(paddleLeft);
scene.add(paddleRight);

const ballGeo = new THREE.SphereGeometry(0.5, 16, 16);
const ballMat = new THREE.MeshPhongMaterial({color: 0xff0000});
const ball = new THREE.Mesh(ballGeo, ballMat);
scene.add(ball);

const wallGeo = new THREE.BoxGeometry(22, 12, 1);
const wallMat = new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true});
const wall = new THREE.Mesh(wallGeo, wallMat);
wall.position.z = -1;
scene.add(wall);

camera.position.z = 20;

let ballDirX = 0.25;
let ballDirY = 0.15;
let leftScore = 0;
let rightScore = 0;

function updateScore() {
  document.getElementById('score').textContent = `${leftScore} : ${rightScore}`;
}

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function animate() {
  requestAnimationFrame(animate);
  if (keys['ArrowUp']) paddleLeft.position.y += 0.3;
  if (keys['ArrowDown']) paddleLeft.position.y -= 0.3;
  paddleRight.position.y = THREE.MathUtils.clamp(ball.position.y, -5, 5);

  ball.position.x += ballDirX;
  ball.position.y += ballDirY;

  if (ball.position.y > 5 || ball.position.y < -5) ballDirY = -ballDirY;
  if (ball.position.x > 9.5 && Math.abs(ball.position.y - paddleRight.position.y) < 2) ballDirX = -ballDirX;
  if (ball.position.x < -9.5 && Math.abs(ball.position.y - paddleLeft.position.y) < 2) ballDirX = -ballDirX;

  if (ball.position.x > 11) { leftScore++; ball.position.set(0, 0, 0); ballDirX = -0.25; updateScore(); }
  if (ball.position.x < -11) { rightScore++; ball.position.set(0, 0, 0); ballDirX = 0.25; updateScore(); }

  renderer.render(scene, camera);
}

updateScore();
animate();
