const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Per servire il client

let latestNews = { title: 'Caricamento notizie...', link: '#' };

// Funzione per recuperare le ultime notizie da La Repubblica
async function fetchLatestNews() {
    try {
        const response = await axios.get('https://www.repubblica.it/rss/homepage/rss2.0.xml');
        const parsedData = await xml2js.parseStringPromise(response.data);
        const items = parsedData.rss.channel[0].item;
        if (items && items.length > 0) {
            latestNews.title = items[0].title[0];
            latestNews.link = items[0].link[0];
        }
    } catch (error) {
        console.error('Errore nel recupero delle notizie:', error);
    }
}

// Recupera le notizie all'avvio e ogni 30 minuti
fetchLatestNews();
setInterval(fetchLatestNews, 1800000);

io.on('connection', (socket) => {
    console.log('Un utente si è connesso');

    // Invia la notizia corrente al nuovo client
    socket.emit('newsUpdate', latestNews);

    socket.on('disconnect', () => {
        console.log('Un utente si è disconnesso');
    });
});

server.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000');
});
