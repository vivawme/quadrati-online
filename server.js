const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Serve i file statici

let players = {}; // Oggetto per salvare tutti i giocatori connessi

io.on("connection", (socket) => {
    console.log("Un utente si è connesso:", socket.id);

    // Aggiungiamo il nuovo giocatore
    players[socket.id] = { x: 100, y: 100, size: 20 };

    // Invia la lista aggiornata dei giocatori a tutti
    io.emit("update", players);

    // Riceve i movimenti del giocatore
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id] = data;
            io.emit("update", players);
        }
    });

    // Quando un giocatore si disconnette
    socket.on("disconnect", () => {
        console.log("Utente disconnesso:", socket.id);
        delete players[socket.id];
        io.emit("update", players);
    });
});

server.listen(3000, () => {
    console.log("Server avviato su http://localhost:3000");
});

io.on("connection", (socket) => {
    console.log("Un utente si è connesso:", socket.id);

    // Ascolta i messaggi della chat e inviali a tutti
    socket.on("chat message", (msg) => {
        io.emit("chat message", { id: socket.id, message: msg });
    });

    socket.on("disconnect", () => {
        console.log("Utente disconnesso:", socket.id);
    });
});
