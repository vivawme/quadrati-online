document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) {
        console.error("Errore: canvas non trovato!");
        return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;

    const socket = io("https://quadrati-online.onrender.com"); // Usa il tuo URL Render
    let player = { x: 100, y: 100, size: 20 };
    let players = {}; // Memorizza tutti i giocatori

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let id in players) {
            let p = players[id];
            ctx.fillStyle = id === socket.id ? "blue" : "red"; // Il proprio quadrato è blu, gli altri rossi
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }

        requestAnimationFrame(draw);
    }

    draw(); // Avvia il loop di disegno

    document.addEventListener("keydown", (event) => {
        if (event.key === "w") player.y -= 10;
        if (event.key === "s") player.y += 10;
        if (event.key === "a") player.x -= 10;
        if (event.key === "d") player.x += 10;

        socket.emit("move", player);
    });

    socket.on("update", (updatedPlayers) => {
        players = updatedPlayers; // Aggiorna tutti i giocatori
    });
});
const chatInput = document.getElementById("chatInput");
const chatForm = document.getElementById("chatForm");
const chatBox = document.getElementById("chatBox");

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (chatInput.value.trim() !== "") {
        socket.emit("chat message", chatInput.value); // Invia messaggio al server
        chatInput.value = ""; // Pulisce il campo di input
    }
});

// Riceve e visualizza i messaggi della chat
socket.on("chat message", (data) => {
    const msgElement = document.createElement("p");
    msgElement.textContent = `🗨️ ${data.id}: ${data.message}`;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scorri in basso alla chat
});
