const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const rulesBtn = document.getElementById('rulesBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const overlayRestartBtn = document.getElementById('overlayRestartBtn');
const rulesPanel = document.getElementById('rulesPanel');

const gridSize = 16;
const tileCount = 20;
const moveDelay = 110;
const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let apples = [];
let score = 0;
let highScore = Number(localStorage.getItem('snakeHighScore') || 0);
let running = true;
let gameOver = false;
let lastMoveTime = 0;

function resetGame() {
  snake = initialSnake.map((segment) => ({ ...segment }));
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  apples = [];
  score = 0;
  gameOver = false;
  running = true;
  lastMoveTime = 0;
  scoreEl.textContent = score;
  hideOverlay();
  createApples(3);
}

function createApples(count) {
  while (apples.length < count) {
    const apple = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };

    if (!snake.some((segment) => segment.x === apple.x && segment.y === apple.y) && !apples.some((item) => item.x === apple.x && item.y === apple.y)) {
      apples.push(apple);
    }
  }
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
  }
  highScoreEl.textContent = highScore;
}

function showOverlay(title, message) {
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function togglePause() {
  if (gameOver) return;
  running = !running;
  if (running) {
    hideOverlay();
    lastMoveTime = performance.now();
  } else {
    showOverlay('Paused', 'Press P to continue.');
  }
}

function restart() {
  resetGame();
  updateHighScore();
}

function checkCollision(head) {
  return head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount || snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y);
}

function handleMovement() {
  if (!running || gameOver) return;

  direction = nextDirection;
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;

  if (checkCollision(head)) {
    gameOver = true;
    running = false;
    updateHighScore();
    showOverlay('Game Over', 'Press R to play again.');
    return;
  }

  snake.unshift(head);

  const eatenIndex = apples.findIndex((apple) => apple.x === head.x && apple.y === head.y);
  if (eatenIndex !== -1) {
    apples.splice(eatenIndex, 1);
    score += 1;
    scoreEl.textContent = score;
    updateHighScore();
    createApples(1);
  } else {
    snake.pop();
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f1b2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < tileCount; x += 1) {
    for (let y = 0; y < tileCount; y += 1) {
      ctx.strokeStyle = '#14263f';
      ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#6ee7b7' : '#34d399';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
  });
}

function drawApples() {
  apples.forEach((apple) => {
    ctx.fillStyle = '#ff5f57';
    ctx.beginPath();
    ctx.arc(apple.x * gridSize + gridSize / 2, apple.y * gridSize + gridSize / 2, gridSize / 2.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function draw() {
  drawGrid();
  drawApples();
  drawSnake();
}

function loop(timestamp) {
  if (timestamp - lastMoveTime > moveDelay) {
    lastMoveTime = timestamp;
    handleMovement();
    draw();
  }
  requestAnimationFrame(loop);
}

function changeDirection(event) {
  const key = event.key.toLowerCase();
  if (key === 'arrowup' || key === 'w') {
    if (direction.y !== 1) {
      nextDirection = { x: 0, y: -1 };
    }
  } else if (key === 'arrowdown' || key === 's') {
    if (direction.y !== -1) {
      nextDirection = { x: 0, y: 1 };
    }
  } else if (key === 'arrowleft' || key === 'a') {
    if (direction.x !== 1) {
      nextDirection = { x: -1, y: 0 };
    }
  } else if (key === 'arrowright' || key === 'd') {
    if (direction.x !== -1) {
      nextDirection = { x: 1, y: 0 };
    }
  } else if (key === 'p') {
    togglePause();
  } else if (key === 'r') {
    restart();
  } else if (key === 'h') {
    rulesPanel.classList.toggle('hidden');
  }
}

function bindButtons() {
  rulesBtn.addEventListener('click', () => rulesPanel.classList.toggle('hidden'));
  pauseBtn.addEventListener('click', () => togglePause());
  restartBtn.addEventListener('click', () => restart());
  overlayRestartBtn.addEventListener('click', () => restart());
  document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'p', 'r', 'h', 'w', 'a', 's', 'd'].includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
    changeDirection(event);
  });
}

highScoreEl.textContent = highScore;
resetGame();
updateHighScore();
draw();
bindButtons();
requestAnimationFrame(loop);
