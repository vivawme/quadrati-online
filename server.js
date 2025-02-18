const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

let players = {};

io.on("connection", (socket) => {
    console.log("Un utente si è connesso:", socket.id);

    players[socket.id] = { x: 100, y: 100, color: "blue", scene: "main" };

    socket.emit("currentPlayers", players);
    socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit("playerMoved", { id: socket.id, x: data.x, y: data.y });
        }
    });

    socket.on("changeScene", (scene) => {
        if (players[socket.id]) {
            players[socket.id].scene = scene;
            io.emit("sceneChanged", { id: socket.id, scene });
        }
    });

    socket.on("disconnect", () => {
        console.log("Un utente si è disconnesso:", socket.id);
        delete players[socket.id];
        io.emit("removePlayer", socket.id);
    });
});

async function getNews() {
    try {
        const sources = [
            "https://www.ansa.it/sito/ansait_rss.xml",
            "https://www.repubblica.it/rss/homepage/rss2.0.xml",
            "https://www.liberoquotidiano.it/rss.xml"
        ];

        const requests = sources.map(url => axios.get(url));
        const responses = await Promise.all(requests);

        return responses.map((res, index) => ({
            source: sources[index],
            title: res.data.match(/<title>(.*?)<\/title>/)[1] || "Nessuna notizia"
        }));
    } catch (error) {
        console.error("Errore nel recupero delle notizie:", error);
        return [];
    }
}

app.get("/news", async (req, res) => {
    try {
        const feeds = await getNews();
        res.json(feeds);
    } catch (error) {
        res.status(500).json({ error: "Errore nel recupero delle notizie" });
    }
});

server.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
