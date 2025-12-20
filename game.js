        const canvas = document.getElementById('birdCanvas');
        const ctx = canvas.getContext('2d');
        const scoreLive = document.getElementById('score-live');
        const homePage = document.getElementById('home-page');
        const gameOverPage = document.getElementById('game-over');
        const hiValHome = document.getElementById('hi-val-home');
        const finalScoreText = document.getElementById('final-score-text');

        canvas.width = 400;
        canvas.height = 700;

        let gameState = 'HOME';
        let score = 0;
        let highScore = localStorage.getItem('vbird_hi') || 0;
        hiValHome.innerText = highScore;

        let bird = { x: 70, y: 350, w: 42, h: 34, velocity: 0, gravity: 0.5, lift: -9 };
        let pipes = [];
        let frame = 0;

        function showHome() {
            gameState = 'HOME';
            homePage.style.display = 'flex';
            gameOverPage.style.display = 'none';
            scoreLive.style.display = 'none';
        }

        function startGame() {
            score = 0;
            pipes = [];
            bird.y = 350;
            bird.velocity = 0;
            frame = 0;
            gameState = 'PLAYING';
            scoreLive.innerText = "0";
            scoreLive.style.display = 'block';
            homePage.style.display = 'none';
            gameOverPage.style.display = 'none';
        }

        function gameOver() {
            gameState = 'GAMEOVER';
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('vbird_hi', highScore);
            }
            finalScoreText.innerHTML = `SCORE: ${score} <br> HIGH SCORE: ${highScore}`;
            gameOverPage.style.display = 'flex';
            scoreLive.style.display = 'none';
        }

function drawBird() {
    ctx.save();

    // Move to bird center & rotate based on velocity
    ctx.translate(bird.x + bird.w / 2, bird.y + bird.h / 2);
    ctx.rotate(Math.min(Math.PI / 5, Math.max(-Math.PI / 4, bird.velocity * 0.05)));

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";

    /* === BODY === */
    ctx.fillStyle = "#FFD200";
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.w / 2, bird.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* === BELLY SHADOW === */
    ctx.fillStyle = "#FFC400";
    ctx.beginPath();
    ctx.ellipse(0, bird.h * 0.12, bird.w * 0.35, bird.h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    /* === EYES (BIG & CARTOONY) === */
    // White eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(bird.w * 0.15, -bird.h * 0.15, bird.w * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(bird.w * 0.18, -bird.h * 0.15, bird.w * 0.06, 0, Math.PI * 2);
    ctx.fill();

    /* === BEAK === */
    ctx.fillStyle = "#FF8C00";
    ctx.beginPath();
    ctx.moveTo(bird.w * 0.35, 0);
    ctx.lineTo(bird.w * 0.55, bird.h * 0.08);
    ctx.lineTo(bird.w * 0.35, bird.h * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    /* === WING === */
    ctx.fillStyle = "#FFC400";
    ctx.beginPath();
    ctx.ellipse(-bird.w * 0.15, bird.h * 0.1, bird.w * 0.22, bird.h * 0.15, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* === TAIL FEATHERS === */
    ctx.fillStyle = "#000";
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-bird.w * 0.5, -bird.h * 0.05 + i * 6);
        ctx.lineTo(-bird.w * 0.7, -bird.h * 0.12 + i * 6);
        ctx.lineTo(-bird.w * 0.65, -bird.h * 0.02 + i * 6);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}


        function drawPipes() {
            pipes.forEach(pipe => {
                // Main Pillar (Dark Rock)
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
                ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);

                // Pipe Lips (The rim)
                ctx.fillStyle = '#222';
                ctx.fillRect(pipe.x - 5, pipe.top - 20, pipe.width + 10, 20);
                ctx.fillRect(pipe.x - 5, canvas.height - pipe.bottom, pipe.width + 10, 20);

                // LAVA CRACKS (The requested look)
                ctx.strokeStyle = '#ff4500';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#ff2200";

                // Top Pillar Cracks
                ctx.beginPath();
                ctx.moveTo(pipe.x + 10, 0);
                ctx.lineTo(pipe.x + 30, pipe.top * 0.4);
                ctx.lineTo(pipe.x + 15, pipe.top * 0.7);
                ctx.lineTo(pipe.x + 40, pipe.top);
                ctx.stroke();

                // Bottom Pillar Cracks
                let bStart = canvas.height - pipe.bottom;
                ctx.beginPath();
                ctx.moveTo(pipe.x + 40, bStart);
                ctx.lineTo(pipe.x + 20, bStart + (pipe.bottom * 0.5));
                ctx.lineTo(pipe.x + 50, canvas.height);
                ctx.stroke();

                ctx.shadowBlur = 0; // Reset for performance
            });
        }

        function update() {
            if (gameState !== 'PLAYING') return;

            bird.velocity += bird.gravity;
            bird.y += bird.velocity;

            if (frame % 100 === 0) {
                let gap = 180;
                let topH = Math.random() * (canvas.height - gap - 300) + 100;
                pipes.push({ x: canvas.width, top: topH, bottom: canvas.height - topH - gap, width: 70, passed: false });
            }

            pipes.forEach((pipe, i) => {
                pipe.x -= 3.5;
                if (bird.x + bird.w - 10 > pipe.x && bird.x + 10 < pipe.x + pipe.width) {
                    if (bird.y + 5 < pipe.top || bird.y + bird.h - 5 > canvas.height - pipe.bottom) gameOver();
                }
                if (!pipe.passed && pipe.x < bird.x) {
                    score++;
                    scoreLive.innerText = score;
                    pipe.passed = true;
                }
                if (pipe.x + pipe.width < -100) pipes.splice(i, 1);
            });

            if (bird.y + bird.h > canvas.height || bird.y < 0) gameOver();
            frame++;
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPipes();
            
            // Flowing Lava Floor
            ctx.fillStyle = '#ff4500';
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ff0000";
            ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
            ctx.shadowBlur = 0;

            drawBird();
        }

        function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
        }

        function flap() {
            if (gameState === 'PLAYING') bird.velocity = bird.lift;
        }

        window.addEventListener('keydown', (e) => { if(e.code === 'Space') flap(); });
        canvas.addEventListener('mousedown', () => flap());
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, {passive: false});

        loop();


