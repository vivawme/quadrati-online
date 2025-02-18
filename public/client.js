// client.js aggiornato con collisione corretta sul bordo inferiore
const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");

const PLAYER_SIZE = 20;
let players = {};
let username = prompt("Inserisci il tuo nome:") || "Anonimo";

let player = {
    x: Math.random() * (canvas.width - PLAYER_SIZE),
    y: Math.random() * (canvas.height - PLAYER_SIZE),
    color: "blue",
    username: username
};

socket.emit("newPlayer", player);

window.addEventListener("keydown", (e) => {
    let speed = 5;
    if (e.key === "w" && player.y > 0) player.y -= speed; // Bordo superiore
    if (e.key === "s" && player.y < canvas.height - PLAYER_SIZE - 50) player.y += speed; // Bordo inferiore (prima della chat)
    if (e.key === "a" && player.x > 0) player.x -= speed; // Bordo sinistro
    if (e.key === "d" && player.x < canvas.width - PLAYER_SIZE) player.x += speed; // Bordo destro
    socket.emit("move", player);
});

socket.on("state", (serverPlayers) => {
    players = serverPlayers;
    draw();
});

socket.on("message", (data) => {
    const msg = document.createElement("div");
    msg.textContent = `${data.username}: ${data.message}`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let id in players) {
        let p = players[id];
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, PLAYER_SIZE, PLAYER_SIZE);
        ctx.fillStyle = "white";
        ctx.fillText(p.username, p.x, p.y - 5);
    }
}

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (chatInput.value) {
        socket.emit("message", { username: username, message: chatInput.value });
        chatInput.value = "";
    }
});
