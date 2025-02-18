const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {
    console.log("Un utente si è connesso:", socket.id);

    players[socket.id] = { x: 100, y: 100, scene: "main" };

    socket.emit("init", { id: socket.id, players });

    socket.on("move", (key) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = 10;
        if (key === "ArrowUp" || key === "w") player.y -= speed;
        if (key === "ArrowDown" || key === "s") player.y += speed;
        if (key === "ArrowLeft" || key === "a") player.x -= speed;
        if (key === "ArrowRight" || key === "d") player.x += speed;

        if (player.scene === "main") {
            // Controllo collisione con il rettangolo giallo "Giornale"
            const rectX = 650, rectY = 260, rectWidth = 150, rectHeight = 80;
            if (
                player.x < rectX + rectWidth &&
                player.x + 20 > rectX &&
                player.y < rectY + rectHeight &&
                player.y + 20 > rectY
            ) {
                player.scene = "yellowRoom";
                socket.emit("changeScene", { id: socket.id, scene: "yellowRoom" });
            }
        } else if (player.scene === "yellowRoom") {
            // Controllo collisione con il rettangolo nero "Home"
            const homeX = 300, homeY = 300, homeWidth = 150, homeHeight = 80;
            if (
                player.x < homeX + homeWidth &&
                player.x + 20 > homeX &&
                player.y < homeY + homeHeight &&
                player.y + 20 > homeY
            ) {
                player.scene = "main";
                socket.emit("changeScene", { id: socket.id, scene: "main" });
            }
        }

        io.emit("updatePlayers", players);
    });

    socket.on("disconnect", () => {
        console.log("Un utente si è disconnesso:", socket.id);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

server.listen(3000, () => {
    console.log("Server in ascolto sulla porta 3000");
});
