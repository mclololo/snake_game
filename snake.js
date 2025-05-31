const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20; // 每格大小
const canvasSize = 400;
let snake = [];
let direction = 'RIGHT';
let food = {};
let score = 0;
let gameInterval = null;
let paused = false;
let username = localStorage.getItem('snake_username') || '';

function init() {
    snake = [
        { x: 8 * box, y: 10 * box },
        { x: 7 * box, y: 10 * box },
        { x: 6 * box, y: 10 * box }
    ];
    direction = 'RIGHT';
    score = 0;
    paused = false;
    document.getElementById('score').innerText = '分数：' + score;
    if(document.getElementById('user-info'))
        document.getElementById('user-info').innerText = '当前用户：' + (username || '');
    placeFood();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(draw, 120);
    document.getElementById('pause').style.display = '';
    document.getElementById('resume').style.display = 'none';
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * (canvasSize / box)) * box,
        y: Math.floor(Math.random() * (canvasSize / box)) * box
    };
    // 避免食物生成在蛇身上
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            return placeFood();
        }
    }
}

function draw() {
    if (paused) return;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 画蛇
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#4caf50' : '#8bc34a';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = '#111';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // 画食物
    ctx.fillStyle = '#ff5722';
    ctx.fillRect(food.x, food.y, box, box);

    // 移动蛇
    let head = { x: snake[0].x, y: snake[0].y };
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;

    // 撞墙或撞自己
    if (
        head.x < 0 || head.x >= canvasSize ||
        head.y < 0 || head.y >= canvasSize ||
        snake.some(part => part.x === head.x && part.y === head.y)
    ) {
        clearInterval(gameInterval);
        saveScore();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, canvasSize/2-40, canvasSize, 80);
        ctx.fillStyle = '#fff';
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', canvasSize/2, canvasSize/2);
        ctx.font = '20px sans-serif';
        ctx.fillText('分数：' + score, canvasSize/2, canvasSize/2 + 30);
        if(document.getElementById('leaderboard-list')) updateLeaderboard();
        return;
    }

    snake.unshift(head);

    // 吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').innerText = '分数：' + score;
        placeFood();
    } else {
        snake.pop();
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
    if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
    if (e.key === ' ' && !paused) pauseGame();
    if (e.key === ' ' && paused) resumeGame();
});

function pauseGame() {
    paused = true;
    document.getElementById('pause').style.display = 'none';
    document.getElementById('resume').style.display = '';
}

function resumeGame() {
    paused = false;
    document.getElementById('pause').style.display = '';
    document.getElementById('resume').style.display = 'none';
}

document.getElementById('pause').onclick = pauseGame;
document.getElementById('resume').onclick = resumeGame;
document.getElementById('restart').onclick = init;
document.getElementById('logout').onclick = logoutGame;

function logoutGame() {
    if (gameInterval) clearInterval(gameInterval);
    paused = false;
    username = '';
    localStorage.removeItem('snake_username');
    document.getElementById('login-panel').style.display = '';
    document.querySelector('h1').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('score').style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'none';
    document.getElementById('username').value = '';
}

function saveScore() {
    if (!username) return;
    let leaderboard = JSON.parse(localStorage.getItem('snake_leaderboard') || '[]');
    leaderboard.push({ username, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);
    localStorage.setItem('snake_leaderboard', JSON.stringify(leaderboard));
}

function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('snake_leaderboard') || '[]');
    leaderboard.sort((a, b) => b.score - a.score);
    let html = '';
    for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
        html += `<li>${leaderboard[i].username}：${leaderboard[i].score}</li>`;
    }
    document.getElementById('leaderboard-list').innerHTML = html || '<li>暂无记录</li>';
}

window.initSnakeGame = init;

// 登录后自动初始化
if (document.getElementById('login-panel')) {
    // 等待登录
} else {
    init();
}
