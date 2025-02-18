// client.js aggiornato con collisioni corrette ai bordi
const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const squareSize = 20;
const mapWidth = 4 * canvas.width; // Mappa ingrandita di 4x
const mapHeight = 4 * canvas.height;
let username;
let player = { x: 50, y: 50, color: "blue" };
let players = {};

// Richiesta username
while (!username) {
    username = prompt("Inserisci il tuo username:");
}
socket.emit("newPlayer", { username, x: player.x, y: player.y });

// Input per il movimento
document.addEventListener("keydown", (event) => {
    let oldX = player.x;
    let oldY = player.y;
    
    if (event.key === "w" && player.y > 0) player.y -= 5; // Limite superiore
    if (event.key === "s" && player.y + squareSize < mapHeight) player.y += 5; // Limite inferiore
    if (event.key === "a" && player.x > 0) player.x -= 5; // Limite sinistro
    if (event.key === "d" && player.x + squareSize < mapWidth) player.x += 5; // Limite destro
    
    if (oldX !== player.x || oldY !== player.y) {
        socket.emit("move", { x: player.x, y: player.y });
    }
});

socket.on("state", (serverPlayers) => {
    players = serverPlayers;
    draw();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Object.values(players).forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, squareSize, squareSize);
        ctx.fillStyle = "white";
        ctx.fillText(p.username, p.x, p.y - 5);
    });
}
