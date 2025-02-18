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

    // Aggiungi un nuovo giocatore in una posizione casuale
    players[socket.id] = { x: Math.random() * 500, y: Math.random() * 500 };

    // Invia la lista aggiornata dei giocatori a tutti
    io.emit("updatePlayers", players);

    // Gestisce il movimento
    socket.on("move", (key) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = 10;
        if (key === "ArrowUp" || key === "w") player.y -= speed;
        if (key === "ArrowDown" || key === "s") player.y += speed;
        if (key === "ArrowLeft" || key === "a") player.x -= speed;
        if (key === "ArrowRight" || key === "d") player.x += speed;

        io.emit("updatePlayers", players);
    });

    // Gestisce i messaggi della chat
    socket.on("chat message", (message) => {
        io.emit("chat message", { id: socket.id, message });
    });

    // Gestisce la disconnessione del giocatore
    socket.on("disconnect", () => {
        console.log("🔴 Utente disconnesso:", socket.id);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

// Avvia il server sulla porta 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
