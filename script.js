const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let score = 0;
let gameOver = false;
let gameStarted = false; // New variable to track game start
let keys = {};
let flashEffect = false;
let boostActive = false;
let boostEndTime = 0;
let baseEnemySpeed = 2; // Initial enemy speed
let enemySizeMin = 30;
let enemySizeMax = 50;
const maxEnemySize = 80; // Cap on maximum enemy size

// Load images
const spaceshipImg = new Image();
spaceshipImg.src = 'spaceship.png';

const enemyImg = new Image();
enemyImg.src = 'enemy.png';

const bulletImg = new Image();
bulletImg.src = 'bullet.png';

// Sound effects
const milestoneSound = new Audio('milestone.mp3'); // Add sound for milestone

// Dynamic starfield background setup
const stars = Array.from({ length: 100 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 2 + 1,
  speed: Math.random() * 1.5 + 0.5,
}));

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  width: 50,
  height: 50,
  speed: 7
};

const bullets = [];
const enemies = [];

// Functions to create bullets and enemies
function createBullets() {
  bullets.push(
    { x: player.x + player.width / 2 - 15, y: player.y, width: 8, height: 20, dx: -2 },
    { x: player.x + player.width / 2 - 5, y: player.y, width: 8, height: 20, dx: 0 },
    { x: player.x + player.width / 2 + 5, y: player.y, width: 8, height: 20, dx: 2 }
  );
}

function createEnemy() {
  const size = Math.random() * (enemySizeMax - enemySizeMin) + enemySizeMin;
  const x = Math.random() * (canvas.width - size);
  const speed = baseEnemySpeed + Math.random() * 1.5;
  enemies.push({ x, y: -size, width: size, height: size, speed });
}

// Draw functions with glowing borders
function drawPlayer() {
  ctx.shadowColor = 'cyan';
  ctx.shadowBlur = 15;
  ctx.drawImage(spaceshipImg, player.x, player.y, player.width, player.height);
  ctx.shadowBlur = 0;
}

function drawBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= 8;
    bullet.x += bullet.dx; // Bullets move in spread pattern
    if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) bullets.splice(index, 1);

    // Draw glowing border
    ctx.shadowColor = 'yellow';
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'orange';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // Reset shadow
    ctx.shadowBlur = 0;
  });
}

function drawEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
    } else {
      ctx.shadowColor = 'lime';
      ctx.shadowBlur = 15;
      ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.shadowBlur = 0;
    }
  });
}

// Collision Detection
function detectCollisions() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        score += 10;
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        checkMilestone();
      }
    });
  });
}

// Detect collision between player and enemies
function detectPlayerEnemyCollision() {
  enemies.forEach(enemy => {
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      endGame();
    }
  });
}

// Check for milestone every 200 points
function checkMilestone() {
  if (score % 200 === 0 && score > 0) {
    activateMilestoneEffect();
  }
  // Increase speed and size range every 500 points
  if (score % 500 === 0 && score > 0) {
    baseEnemySpeed += 0.5; // Increase base enemy speed gradually
    enemySizeMin = Math.min(enemySizeMin + 5, maxEnemySize - 10); // Increase enemy size range
    enemySizeMax = Math.min(enemySizeMax + 10, maxEnemySize); // Cap at maxEnemySize
  }
}

// Activate milestone effects
function activateMilestoneEffect() {
  flashEffect = true;
  boostActive = true;
  boostEndTime = Date.now() + 5000; // Speed boost for 5 seconds
  milestoneSound.play(); // Play sound effect
}

// Player Movement
function movePlayer() {
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;
}

// Display Score
function displayScore() {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

// Starfield background effect
function drawStarfield() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.speed;
    if (star.y > canvas.height) star.y = 0;
  });
}

// Flash screen effect for milestone
function applyFlashEffect() {
  if (flashEffect) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    flashEffect = false;
  }
}

// End Game
function endGame() {
  gameOver = true;
  gameStarted = false;
  document.getElementById('finalScore').innerText = score;
  document.getElementById('gameOverDialog').style.display = 'block';
}

function resetGame() {
  score = 0;
  gameOver = false;
  bullets.length = 0;
  enemies.length = 0;
  baseEnemySpeed = 2; // Reset enemy speed
  enemySizeMin = 30; // Reset enemy size range
  enemySizeMax = 50;
  player.x = canvas.width / 2 - 25;
  document.getElementById('gameOverDialog').style.display = 'none';
  document.getElementById('startButton').style.display = 'block'; // Show start button again
}

// Main Game Loop
function gameLoop() {
  if (gameOver || !gameStarted) return; // Run only if game is started

  drawStarfield();
  movePlayer();
  drawPlayer();
  drawBullets();
  drawEnemies();
  detectCollisions();
  detectPlayerEnemyCollision();
  displayScore();
  applyFlashEffect();

  if (boostActive && Date.now() > boostEndTime) {
    boostActive = false;
  }

  if (Math.random() < 0.02) createEnemy();

  requestAnimationFrame(gameLoop);
}

// Event Listeners
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space' && gameStarted && !gameOver) createBullets();
});

window.addEventListener('keyup', (e) => keys[e.code] = false);

document.getElementById('startButton').addEventListener('click', () => {
  gameStarted = true; // Set game as started
  document.getElementById('startButton').style.display = 'none'; // Hide start button
  resetGame();
  gameLoop();
});

document.getElementById('restartButton').addEventListener('click', () => {
  resetGame();
  gameStarted = true; // Restart game and set as started
  gameLoop();
});
