const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
    console.log("🔵 Utente connesso:", socket.id);

    players[socket.id] = { x: Math.random() * 500, y: Math.random() * 500, scene: "main" };
    io.emit("updatePlayers", players);

    socket.on("move", (key) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = 10;
        if (key === "ArrowUp" || key === "w") player.y -= speed;
        if (key === "ArrowDown" || key === "s") player.y += speed;
        if (key === "ArrowLeft" || key === "a") player.x -= speed;
        if (key === "ArrowRight" || key === "d") player.x += speed;

        // Controllo se il giocatore tocca il rettangolo giallo
        const rectX = 800 - 150 - 20;
        const rectY = 600 / 2 - 80 / 2;
        const rectWidth = 150;
        const rectHeight = 80;

        if (
            player.scene === "main" &&
            player.x < rectX + rectWidth &&
            player.x + 20 > rectX &&
            player.y < rectY + rectHeight &&
            player.y + 20 > rectY
        ) {
            player.scene = "yellowRoom";
            io.to(socket.id).emit("changeScene", { id: socket.id, scene: "yellowRoom" });
        }

        io.emit("updatePlayers", players);
    });

    socket.on("chat message", (message) => {
        io.emit("chat message", { id: socket.id, message });
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
