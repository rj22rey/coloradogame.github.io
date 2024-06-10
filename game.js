const gameContainer = document.getElementById('gameContainer');
const player = document.getElementById('player');
const heartsContainer = document.getElementById('hearts');
const gameOverDisplay = document.getElementById('gameOver');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
let playerPosition;
let bullets = [];
let targets = [];
let keys = {};
let shootInterval;
let playerSpeed = 10;
let bulletSpeed = 7;
let targetSpeed = 2;
let health = 3;
let gameInterval;
let gameTime = 0;
let spawnRate = 3000; // Initial spawn rate
let lastSpawnRateIncrease = 0; // Track the last time spawn rate was increased

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        if (!shootInterval) {
            shootInterval = setInterval(shoot, 200);
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === ' ') {
        clearInterval(shootInterval);
        shootInterval = null;
    }
});

function movePlayer() {
    if (keys['ArrowLeft']) {
        playerPosition -= playerSpeed;
        if (playerPosition < 0) playerPosition = 0;
    }
    if (keys['ArrowRight']) {
        playerPosition += playerSpeed;
        if (playerPosition > gameContainer.offsetWidth - player.offsetWidth) {
            playerPosition = gameContainer.offsetWidth - player.offsetWidth;
        }
    }
    player.style.left = `${playerPosition}px`;
}

function shoot() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${playerPosition + player.offsetWidth / 2 - 12.5}px`; // Adjusted for bullet width
    bullet.style.bottom = '70px';
    bullet.textContent = "Move back to California";
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
}

function createTarget() {
    const target = document.createElement('div');
    target.classList.add('target');
    const randomX = Math.random() * (gameContainer.offsetWidth - 50); // Random X position
    target.style.left = `${randomX}px`;
    target.style.top = '-50px'; // Start above the screen
    gameContainer.appendChild(target);
    targets.push(target);
}

function updateGame() {
    movePlayer();

    bullets.forEach((bullet, index) => {
        const bulletBottom = parseInt(bullet.style.bottom);
        if (bulletBottom >= gameContainer.offsetHeight) {
            bullet.remove();
            bullets.splice(index, 1);
        } else {
            bullet.style.bottom = `${bulletBottom + bulletSpeed}px`;
        }

        targets.forEach((target, targetIndex) => {
            const bulletRect = bullet.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            if (bulletRect.left < targetRect.right &&
                bulletRect.right > targetRect.left &&
                bulletRect.top < targetRect.bottom &&
                bulletRect.bottom > targetRect.top) {
                bullet.remove();
                target.remove();
                bullets.splice(index, 1);
                targets.splice(targetIndex, 1);
            }
        });
    });

    targets.forEach((target, index) => {
        const targetTop = parseInt(target.style.top);
        target.style.top = `${targetTop + targetSpeed}px`;

        const playerRect = player.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        if (targetRect.left < playerRect.right &&
            targetRect.right > playerRect.left &&
            targetRect.top < playerRect.bottom &&
            targetRect.bottom > playerRect.top) {
            loseHealth();
            target.remove();
            targets.splice(index, 1);
        } else if (targetTop >= gameContainer.offsetHeight) {
            target.remove();
            targets.splice(index, 1);
        }
    });

    requestAnimationFrame(updateGame);
    gameTime++;

    // Increase spawn rate every 15 seconds
    if (gameTime - lastSpawnRateIncrease >= 15000) {
        spawnRate *= 0.8; // Increase spawn rate by reducing it
        lastSpawnRateIncrease = gameTime;
        clearInterval(gameInterval);
        gameInterval = setInterval(createTarget, spawnRate);
    }
}

function loseHealth() {
    if (health > 0) {
        health--;
        if (heartsContainer.children.length > 0) {
            heartsContainer.removeChild(heartsContainer.children[heartsContainer.children.length - 1]);
        }
        if (health === 0) {
            gameOver();
        }
    }
}

function gameOver() {
    gameOverDisplay.classList.remove('hidden');
    restartButton.classList.remove('hidden');
    clearInterval(shootInterval);
    clearInterval(gameInterval);
    shootInterval = null;
    keys = {}; // Clear keys to stop movement
}

function startGame() {
    startButton.classList.add('hidden');
    restartButton.classList.add('hidden');
    gameOverDisplay.classList.add('hidden');
    health = 3;
    while (heartsContainer.firstChild) {
        heartsContainer.removeChild(heartsContainer.firstChild);
    }
    for (let i = 0; i < health; i++) {
        const heart = document.createElement('img');
        heart.src = 'https://i.postimg.cc/WhXxtbch/heart.png';
        heart.classList.add('heart');
        heartsContainer.appendChild(heart);
    }
    playerPosition = gameContainer.offsetWidth / 2 - player.offsetWidth / 2;
    player.style.left = `${playerPosition}px`; // Initialize player position
    bullets = [];
    targets = [];
    keys = {};
    shootInterval = null;
    gameTime = 0;
    spawnRate = 3000; // Reset spawn rate
    gameInterval = setInterval(createTarget, spawnRate);
    updateGame();
}
