const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 50, y: 50, size: 20, color: 'blue' };
let newsRect = { x: 200, y: 200, width: 300, height: 50, title: 'Caricamento...', link: '#' };

// Movimento
document.addEventListener('keydown', (event) => {
    let speed = 5;
    if (event.key === 'ArrowUp' && player.y > 0) player.y -= speed;
    if (event.key === 'ArrowDown' && player.y + player.size < canvas.height - 100) player.y += speed; // Chat come bordo
    if (event.key === 'ArrowLeft' && player.x > 0) player.x -= speed;
    if (event.key === 'ArrowRight' && player.x + player.size < canvas.width) player.x += speed;

    checkNewsInteraction();
});

// Controlla se il giocatore tocca il rettangolo delle notizie
function checkNewsInteraction() {
    if (player.x < newsRect.x + newsRect.width &&
        player.x + player.size > newsRect.x &&
        player.y < newsRect.y + newsRect.height &&
        player.y + player.size > newsRect.y) {
        window.open(newsRect.link, '_blank');
    }
}

// Disegna il gioco
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegna il giocatore
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Disegna il rettangolo delle notizie
    ctx.fillStyle = 'gray';
    ctx.fillRect(newsRect.x, newsRect.y, newsRect.width, newsRect.height);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(newsRect.title, newsRect.x + 10, newsRect.y + 30);

    requestAnimationFrame(drawGame);
}

// Riceve la notizia aggiornata dal server
socket.on('newsUpdate', (news) => {
    newsRect.title = news.title;
    newsRect.link = news.link;
});

// Chat
const chatInput = document.getElementById('chatInput');
const messagesDiv = document.getElementById('messages');

function sendMessage() {
    const message = chatInput.value;
    if (message) {
        socket.emit('chatMessage', message);
        chatInput.value = '';
    }
}

socket.on('chatMessage', (msg) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = msg;
    messagesDiv.appendChild(messageElement);
});

// Avvia il gioco
drawGame();
