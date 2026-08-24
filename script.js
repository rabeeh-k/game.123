/* ==========================================
   NEON SPACE RUNNER
   HTML + CSS + JAVASCRIPT
========================================== */


/* ==========================================
   CANVAS
========================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W;
let H;


function resizeCanvas() {

    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


/* ==========================================
   SCREENS
========================================== */

const startScreen = document.getElementById("startScreen");
const howScreen = document.getElementById("howScreen");
const gameScreen = document.getElementById("gameScreen");

const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");


/* ==========================================
   BUTTONS
========================================== */

const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const backBtn = document.getElementById("backBtn");

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");

const quitBtn = document.getElementById("quitBtn");

const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

const soundBtn = document.getElementById("soundBtn");

const shootMobile = document.getElementById("shootMobile");


/* ==========================================
   GAME VARIABLES
========================================== */

let gameRunning = false;
let paused = false;

let score = 0;
let highScore = Number(localStorage.getItem("neonHighScore")) || 0;

let lives = 3;
let level = 1;

let asteroidTimer = 0;
let coinTimer = 0;

let lastTime = 0;

let soundEnabled = true;


/* ==========================================
   PLAYER
========================================== */

const player = {

    x: 0,
    y: 0,

    width: 42,
    height: 55,

    speed: 6,

    invincible: false,

    invincibleTimer: 0

};


function resetPlayer() {

    player.x = W / 2;
    player.y = H - 130;

    player.invincible = false;
    player.invincibleTimer = 0;

}


/* ==========================================
   ARRAYS
========================================== */

let asteroids = [];
let bullets = [];
let coins = [];
let particles = [];

let keys = {};


/* ==========================================
   KEYBOARD
========================================== */

document.addEventListener("keydown", function(e) {

    keys[e.key] = true;

    if (e.key === " ") {

        e.preventDefault();

        shoot();

    }

    if (e.key.toLowerCase() === "p") {

        togglePause();

    }

});


document.addEventListener("keyup", function(e) {

    keys[e.key] = false;

});


/* ==========================================
   START GAME
========================================== */

startBtn.addEventListener("click", startGame);


function startGame() {

    startScreen.classList.add("hidden");
    howScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    score = 0;
    lives = 3;
    level = 1;

    asteroids = [];
    bullets = [];
    coins = [];
    particles = [];

    resetPlayer();

    updateHUD();

    gameRunning = true;
    paused = false;

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);

}


/* ==========================================
   GAME LOOP
========================================== */

function gameLoop(time) {

    if (!gameRunning) return;

    if (!paused) {

        const deltaTime = time - lastTime;

        lastTime = time;

        update(deltaTime);

        draw();

    }

    requestAnimationFrame(gameLoop);

}


/* ==========================================
   UPDATE GAME
========================================== */

function update(delta) {

    movePlayer();

    updatePlayerInvincibility();

    spawnAsteroids(delta);

    spawnCoins(delta);

    updateBullets();

    updateAsteroids();

    updateCoins();

    updateParticles();

    checkCollisions();

    updateLevel();

    updateHUD();

}


/* ==========================================
   PLAYER MOVEMENT
========================================== */

function movePlayer() {

    if (keys["ArrowLeft"]) {

        player.x -= player.speed;

    }

    if (keys["ArrowRight"]) {

        player.x += player.speed;

    }

    if (keys["ArrowUp"]) {

        player.y -= player.speed;

    }

    if (keys["ArrowDown"]) {

        player.y += player.speed;

    }


    const halfWidth = player.width / 2;

    const halfHeight = player.height / 2;


    player.x = Math.max(
        halfWidth,
        Math.min(W - halfWidth, player.x)
    );


    player.y = Math.max(
        halfHeight + 30,
        Math.min(H - halfHeight, player.y)
    );

}


/* ==========================================
   PLAYER INVINCIBILITY
========================================== */

function updatePlayerInvincibility() {

    if (player.invincible) {

        player.invincibleTimer--;

        if (player.invincibleTimer <= 0) {

            player.invincible = false;

        }

    }

}


/* ==========================================
   SHOOT
========================================== */

function shoot() {

    if (!gameRunning || paused) return;

    bullets.push({

        x: player.x,

        y: player.y - 30,

        speed: 10,

        radius: 4

    });

    playSound(600, 0.05);

}


/* ==========================================
   BULLETS
========================================== */

function updateBullets() {

    bullets.forEach((bullet, index) => {

        bullet.y -= bullet.speed;

        if (bullet.y < -20) {

            bullets.splice(index, 1);

        }

    });

}


/* ==========================================
   ASTEROID SPAWN
========================================== */

function spawnAsteroids(delta) {

    asteroidTimer += delta;

    const spawnRate = Math.max(
        300,
        900 - level * 70
    );


    if (asteroidTimer > spawnRate) {

        asteroidTimer = 0;

        const size =
            Math.random() * 20 + 20;

        asteroids.push({

            x: Math.random() * W,

            y: -50,

            radius: size,

            speed:
                Math.random() * 2 +
                2 +
                level * 0.35,

            rotation:
                Math.random() * Math.PI * 2,

            rotationSpeed:
                (Math.random() - 0.5) * 0.05

        });

    }

}


/* ==========================================
   ASTEROIDS UPDATE
========================================== */

function updateAsteroids() {

    asteroids.forEach((asteroid, index) => {

        asteroid.y += asteroid.speed;

        asteroid.rotation +=
            asteroid.rotationSpeed;


        if (asteroid.y > H + 100) {

            asteroids.splice(index, 1);

        }

    });

}


/* ==========================================
   COINS
========================================== */

function spawnCoins(delta) {

    coinTimer += delta;

    if (coinTimer > 1800) {

        coinTimer = 0;

        coins.push({

            x: Math.random() * (W - 80) + 40,

            y: -30,

            radius: 12,

            speed: 3,

            angle: 0

        });

    }

}


function updateCoins() {

    coins.forEach((coin, index) => {

        coin.y += coin.speed;

        coin.angle += 0.08;

        if (coin.y > H + 30) {

            coins.splice(index, 1);

        }

    });

}


/* ==========================================
   PARTICLES
========================================== */

function createExplosion(x, y, amount = 20) {

    for (let i = 0; i < amount; i++) {

        const angle =
            Math.random() * Math.PI * 2;

        const speed =
            Math.random() * 5 + 1;

        particles.push({

            x: x,

            y: y,

            vx: Math.cos(angle) * speed,

            vy: Math.sin(angle) * speed,

            life: 40 + Math.random() * 30,

            size: Math.random() * 4 + 1

        });

    }

}


function updateParticles() {

    particles.forEach((particle, index) => {

        particle.x += particle.vx;

        particle.y += particle.vy;

        particle.life--;

        particle.vx *= 0.98;
        particle.vy *= 0.98;


        if (particle.life <= 0) {

            particles.splice(index, 1);

        }

    });

}


/* ==========================================
   COLLISION DETECTION
========================================== */

function distance(x1, y1, x2, y2) {

    return Math.sqrt(

        Math.pow(x2 - x1, 2) +
        Math.pow(y2 - y1, 2)

    );

}


function checkCollisions() {


    /* BULLET → ASTEROID */

    bullets.forEach((bullet, bIndex) => {

        asteroids.forEach((asteroid, aIndex) => {

            const d = distance(

                bullet.x,
                bullet.y,

                asteroid.x,
                asteroid.y

            );


            if (d < asteroid.radius + bullet.radius) {

                createExplosion(
                    asteroid.x,
                    asteroid.y,
                    12
                );

                asteroids.splice(aIndex, 1);

                bullets.splice(bIndex, 1);

                score += 25;

                playSound(300, 0.08);

            }

        });

    });


    /* PLAYER → ASTEROID */

    if (!player.invincible) {

        asteroids.forEach((asteroid, index) => {

            const d = distance(

                player.x,
                player.y,

                asteroid.x,
                asteroid.y

            );


            if (d < asteroid.radius + 20) {

                asteroids.splice(index, 1);

                createExplosion(
                    player.x,
                    player.y,
                    30
                );

                lives--;

                player.invincible = true;

                player.invincibleTimer = 120;

                playSound(100, 0.2);

                if (lives <= 0) {

                    endGame();

                }

            }

        });

    }


    /* PLAYER → COIN */

    coins.forEach((coin, index) => {

        const d = distance(

            player.x,
            player.y,

            coin.x,
            coin.y

        );


        if (d < coin.radius + 25) {

            coins.splice(index, 1);

            score += 10;

            createExplosion(
                coin.x,
                coin.y,
                15
            );

            playSound(900, 0.08);

        }

    });

}


/* ==========================================
   LEVEL
========================================== */

function updateLevel() {

    level =
        Math.floor(score / 250) + 1;

}


/* ==========================================
   DRAW
========================================== */

function draw() {

    ctx.clearRect(0, 0, W, H);

    drawSpaceBackground();

    drawCoins();

    drawBullets();

    drawAsteroids();

    drawPlayer();

    drawParticles();

}


/* ==========================================
   BACKGROUND
========================================== */

function drawSpaceBackground() {

    const gradient =
        ctx.createRadialGradient(
            W / 2,
            H / 2,
            0,
            W / 2,
            H / 2,
            H
        );


    gradient.addColorStop(
        0,
        "#101747"
    );

    gradient.addColorStop(
        1,
        "#02030d"
    );


    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* Stars */

    for (let i = 0; i < 80; i++) {

        const x =
            (i * 137) % W;

        const y =
            (i * 83 + performance.now() * 0.03) % H;

        ctx.fillStyle =
            i % 3 === 0
                ? "#00eaff"
                : "white";

        ctx.globalAlpha =
            0.3 + Math.random() * 0.4;

        ctx.fillRect(
            x,
            y,
            1.5,
            1.5
        );

    }

    ctx.globalAlpha = 1;

}


/* ==========================================
   DRAW PLAYER
========================================== */

function drawPlayer() {

    if (
        player.invincible &&
        Math.floor(player.invincibleTimer / 8) % 2 === 0
    ) {

        return;

    }


    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    /* Engine flame */

    const flame =
        20 + Math.random() * 15;


    const gradient =
        ctx.createLinearGradient(
            0,
            20,
            0,
            55
        );


    gradient.addColorStop(
        0,
        "#00eaff"
    );

    gradient.addColorStop(
        1,
        "transparent"
    );


    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.moveTo(-9, 20);

    ctx.lineTo(0, 20 + flame);

    ctx.lineTo(9, 20);

    ctx.closePath();

    ctx.fill();


    /* Glow */

    ctx.shadowBlur = 25;

    ctx.shadowColor = "#00eaff";


    /* Ship */

    const shipGradient =
        ctx.createLinearGradient(
            -20,
            -30,
            20,
            30
        );


    shipGradient.addColorStop(
        0,
        "#00eaff"
    );

    shipGradient.addColorStop(
        0.5,
        "#7b2cff"
    );

    shipGradient.addColorStop(
        1,
        "#ff00c8"
    );


    ctx.fillStyle = shipGradient;

    ctx.beginPath();

    ctx.moveTo(0, -30);

    ctx.lineTo(20, 22);

    ctx.lineTo(0, 14);

    ctx.lineTo(-20, 22);

    ctx.closePath();

    ctx.fill();


    /* Cockpit */

    ctx.shadowBlur = 15;

    ctx.shadowColor = "#ffffff";

    ctx.fillStyle = "#dffcff";

    ctx.beginPath();

    ctx.arc(
        0,
        -5,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


/* ==========================================
   DRAW BULLETS
========================================== */

function drawBullets() {

    bullets.forEach(bullet => {

        ctx.save();

        ctx.shadowBlur = 20;

        ctx.shadowColor = "#00eaff";

        ctx.fillStyle = "#00eaff";

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    });

}


/* ==========================================
   DRAW ASTEROIDS
========================================== */

function drawAsteroids() {

    asteroids.forEach(asteroid => {

        ctx.save();

        ctx.translate(
            asteroid.x,
            asteroid.y
        );

        ctx.rotate(
            asteroid.rotation
        );

        ctx.shadowBlur = 15;

        ctx.shadowColor = "#ff0077";

        ctx.fillStyle = "#51245f";

        ctx.strokeStyle = "#ff4fbd";

        ctx.lineWidth = 2;


        ctx.beginPath();


        const points = 9;


        for (let i = 0; i < points; i++) {

            const angle =
                (Math.PI * 2 / points) * i;

            const randomRadius =
                asteroid.radius *
                (0.75 + Math.random() * 0.3);


            const x =
                Math.cos(angle) *
                randomRadius;

            const y =
                Math.sin(angle) *
                randomRadius;


            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        }


        ctx.closePath();

        ctx.fill();

        ctx.stroke();

        ctx.restore();

    });

}


/* ==========================================
   DRAW COINS
========================================== */

function drawCoins() {

    coins.forEach(coin => {

        ctx.save();

        ctx.translate(
            coin.x,
            coin.y
        );

        ctx.shadowBlur = 25;

        ctx.shadowColor = "#ffd700";

        ctx.strokeStyle = "#ffd700";

        ctx.lineWidth = 4;

        ctx.rotate(coin.angle);

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();


        ctx.fillStyle = "#fff3a3";

        ctx.font = "bold 12px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            "$",
            0,
            0
        );

        ctx.restore();

    });

}


/* ==========================================
   DRAW PARTICLES
========================================== */

function drawParticles() {

    particles.forEach(particle => {

        ctx.save();

        ctx.globalAlpha =
            particle.life / 60;

        ctx.fillStyle = "#00eaff";

        ctx.shadowBlur = 15;

        ctx.shadowColor = "#ff00c8";


        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    });

}


/* ==========================================
   HUD
========================================== */

function updateHUD() {

    document.getElementById("score")
        .textContent = score;

    document.getElementById("highScore")
        .textContent = highScore;

    document.getElementById("level")
        .textContent = level;

    document.getElementById("lives")
        .textContent = lives;

    document.getElementById("menuHighScore")
        .textContent = highScore;

}


/* ==========================================
   PAUSE
========================================== */

pauseBtn.addEventListener(
    "click",
    togglePause
);


resumeBtn.addEventListener(
    "click",
    togglePause
);


function togglePause() {

    if (!gameRunning) return;

    paused = !paused;

    if (paused) {

        pauseScreen.classList.remove("hidden");

    } else {

        pauseScreen.classList.add("hidden");

        lastTime = performance.now();

    }

}


/* ==========================================
   QUIT
========================================== */

quitBtn.addEventListener(
    "click",
    () => {

        gameRunning = false;

        pauseScreen.classList.add("hidden");

        gameScreen.classList.add("hidden");

        startScreen.classList.remove("hidden");

    }
);


/* ==========================================
   GAME OVER
========================================== */

function endGame() {

    gameRunning = false;

    document.getElementById("finalScore")
        .textContent = score;


    let newRecord = false;


    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "neonHighScore",
            highScore
        );

        newRecord = true;

    }


    updateHUD();


    if (newRecord) {

        document
            .getElementById("newHighScore")
            .classList.remove("hidden");

    } else {

        document
            .getElementById("newHighScore")
            .classList.add("hidden");

    }


    gameOverScreen.classList.remove("hidden");

    playSound(80, 0.5);

}


/* ==========================================
   RESTART
========================================== */

restartBtn.addEventListener(
    "click",
    startGame
);


/* ==========================================
   MAIN MENU
========================================== */

menuBtn.addEventListener(
    "click",
    () => {

        gameOverScreen.classList.add(
            "hidden"
        );

        gameScreen.classList.add(
            "hidden"
        );

        startScreen.classList.remove(
            "hidden"
        );

        updateHUD();

    }
);


/* ==========================================
   HOW TO PLAY
========================================== */

howBtn.addEventListener(
    "click",
    () => {

        startScreen.classList.add(
            "hidden"
        );

        howScreen.classList.remove(
            "hidden"
        );

    }
);


backBtn.addEventListener(
    "click",
    () => {

        howScreen.classList.add(
            "hidden"
        );

        startScreen.classList.remove(
            "hidden"
        );

    }
);


/* ==========================================
   SOUND
========================================== */

soundBtn.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        soundBtn.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

    }
);


function playSound(
    frequency,
    duration
) {

    if (!soundEnabled) return;


    try {

        const audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.frequency.value =
            frequency;

        oscillator.type =
            "sine";


        gain.gain.setValueAtTime(
            0.08,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime +
            duration
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime +
            duration
        );

    } catch (error) {

        console.log(
            "Audio not supported"
        );

    }

}


/* ==========================================
   MOBILE CONTROLS
========================================== */

document
    .querySelectorAll(
        "[data-key]"
    )
    .forEach(button => {

        const key =
            button.dataset.key;


        button.addEventListener(
            "touchstart",
            e => {

                e.preventDefault();

                keys[key] = true;

            }
        );


        button.addEventListener(
            "touchend",
            e => {

                e.preventDefault();

                keys[key] = false;

            }
        );

    });


shootMobile.addEventListener(
    "touchstart",
    e => {

        e.preventDefault();

        shoot();

    }
);


/* ==========================================
   INITIALIZE
========================================== */

updateHUD();