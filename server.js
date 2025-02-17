// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let players = {};
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 2000;
const PLAYER_SIZE = 20;

io.on("connection", (socket) => {
    console.log("🔵 Utente connesso:", socket.id);

    socket.on("setUsername", (username) => {
        players[socket.id] = { 
            username, 
            x: Math.random() * (MAP_WIDTH - PLAYER_SIZE), 
            y: Math.random() * (MAP_HEIGHT - PLAYER_SIZE) 
        };
        io.emit("updatePlayers", players);
        socket.emit("loginSuccess");
    });

    socket.on("move", (key) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = 10;
        if (key === "ArrowUp" || key === "w") player.y = Math.max(0, player.y - speed);
        if (key === "ArrowDown" || key === "s") player.y = Math.min(MAP_HEIGHT - PLAYER_SIZE, player.y + speed);
        if (key === "ArrowLeft" || key === "a") player.x = Math.max(0, player.x - speed);
        if (key === "ArrowRight" || key === "d") player.x = Math.min(MAP_WIDTH - PLAYER_SIZE, player.x + speed);

        io.emit("updatePlayers", players);
    });

    socket.on("chat message", (message) => {
        if (players[socket.id]) {
            io.emit("chat message", { username: players[socket.id].username, message });
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 Utente disconnesso:", socket.id);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
