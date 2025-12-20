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
        let lavaOffset = 0; // For the flowing animation
        hiValHome.innerText = highScore;

        let bird = { x: 70, y: 350, w: 42, h: 34, velocity: 0, gravity: 0.5, lift: -9 };
        let pipes = [];
        let frame = 0;

        function showHome() {
            gameState = 'HOME';
            homePage.style.display = 'flex';
            gameOverPage.style.display = 'none';
            scoreLive.style.display = 'none';
            hiValHome.innerText = highScore;
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
            finalScoreText.innerHTML = `SCORE: ${score} <br> BEST: ${highScore}`;
            gameOverPage.style.display = 'flex';
            scoreLive.style.display = 'none';
        }

        function drawBird() {
            ctx.save();
            ctx.translate(bird.x + bird.w/2, bird.y + bird.h/2);
            ctx.rotate(Math.min(Math.PI/4, Math.max(-Math.PI/3, bird.velocity * 0.06)));
            
            // Yellow Body
            ctx.fillStyle = '#f7d308';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, bird.w/2, bird.h/2, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();

            // Eye
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(12, -6, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'black';
            ctx.beginPath(); ctx.arc(15, -6, 4, 0, Math.PI * 2); ctx.fill();

            // Beak
            ctx.fillStyle = '#ff4500';
            ctx.beginPath();
            ctx.moveTo(18, 0); ctx.lineTo(32, 6); ctx.lineTo(18, 12);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();
        }

        function drawPipes() {
            pipes.forEach(pipe => {
                // Stone Pipe Body
                ctx.fillStyle = '#222';
                ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
                ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);

                // FLOWING LAVA EFFECT
                ctx.fillStyle = '#ff4500';
                
                // Top pipe lava drips
                for (let j = 0; j < 3; j++) {
                    let streamX = pipe.x + 10 + (j * 20);
                    let streamY = (lavaOffset + (j * 30)) % pipe.top;
                    ctx.fillRect(streamX, streamY, 4, 25);
                    // Glowing aura
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "#ff4500";
                }

                // Bottom pipe lava drips
                for (let j = 0; j < 3; j++) {
                    let streamX = pipe.x + 10 + (j * 20);
                    let startY = canvas.height - pipe.bottom;
                    let streamY = startY + ((lavaOffset + (j * 40)) % pipe.bottom);
                    ctx.fillRect(streamX, streamY, 4, 25);
                }
                ctx.shadowBlur = 0; // Reset shadow for next drawings
            });
        }

        function update() {
            if (gameState !== 'PLAYING') return;

            lavaOffset += 2; // Speed of the lava flow
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;

            if (frame % 100 === 0) {
                let gap = 180;
                let topH = Math.random() * (canvas.height - gap - 300) + 100;
                pipes.push({ x: canvas.width, top: topH, bottom: canvas.height - topH - gap, width: 70, passed: false });
            }

            pipes.forEach((pipe, i) => {
                pipe.x -= 3.5;
                // Collision
                if (bird.x + bird.w - 5 > pipe.x && bird.x + 5 < pipe.x + pipe.width) {
                    if (bird.y + 5 < pipe.top || bird.y + bird.h - 5 > canvas.height - pipe.bottom) gameOver();
                }
                if (!pipe.passed && pipe.x < bird.x) {
                    score++;
                    scoreLive.innerText = score;
                    pipe.passed = true;
                }
                if (pipe.x + pipe.width < 0) pipes.splice(i, 1);
            });

            if (bird.y + bird.h > canvas.height || bird.y < 0) gameOver();
            frame++;
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPipes();
            
            // Lava Floor
            ctx.fillStyle = '#ff4500';
            ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
            
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
