const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Parser = require("rss-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const parser = new Parser();

app.use(cors());
app.use(express.static("public"));

let clients = new Set();

// Recupera le notizie dai feed RSS
async function fetchNews() {
    try {
        const urls = [
            { name: "ANSA", url: "https://www.ansa.it/sito/ansait_rss.xml" },
            { name: "Repubblica", url: "https://www.repubblica.it/rss/homepage/rss2.0.xml" },
            { name: "Libero", url: "https://www.liberoquotidiano.it/rss.xml" }
        ];

        let news = [];
        for (const source of urls) {
            let feed = await parser.parseURL(source.url);
            if (feed.items.length > 0) {
                news.push({ source: source.name, title: feed.items[0].title });
            }
        }
        return news;
    } catch (error) {
        console.error("Errore nel recupero delle notizie:", error);
        return [];
    }
}

// WebSocket connection
wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Nuovo utente connesso");

    // Invia le notizie all'utente appena connesso
    fetchNews().then((news) => {
        ws.send(JSON.stringify({ type: "news", data: news }));
    });

    // Ricezione messaggi chat
    ws.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === "chat") {
            const chatMessage = JSON.stringify({ type: "chat", user: data.user, text: data.text });
            clients.forEach(client => client.send(chatMessage));
        }
    });

    // Disconnessione
    ws.on("close", () => {
        clients.delete(ws);
        console.log("Utente disconnesso");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`));
