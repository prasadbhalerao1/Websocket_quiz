const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const questions = [
    {
        question: "Capital of India?",
        options: ["Mumbai", "Delhi", "Pune", "Nagpur"],
        answer: "Delhi",
    },
    {
        question: "2 + 2 = ?",
        options: ["3", "4", "5", "6"],
        answer: "4",
    },
    {
        question: "HTML stands for?",
        options: [
            "Hyper Text Markup Language",
            "High Tool Machine Language",
            "Home Tool Markup Language",
            "Hyper Transfer Markup Level",
        ],
        answer: "Hyper Text Markup Language",
    },
];

io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, username }) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                currentQuestion: 0,
                answered: 0,
            };
        }

        rooms[roomId].players.push({
            id: socket.id,
            username,
            score: 0,
        });

        io.to(roomId).emit("players-update", rooms[roomId].players);
    });

    socket.on("start-quiz", (roomId) => {
        sendQuestion(roomId);
    });

    socket.on("submit-answer", ({ roomId, answer }) => {
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find((p) => p.id === socket.id);
        const current = questions[room.currentQuestion];

        if (answer === current.answer) {
            player.score += 1;
        }

        room.answered += 1;

        if (room.answered === room.players.length) {
            io.to(roomId).emit("players-update", room.players);

            setTimeout(() => {
                room.currentQuestion++;
                room.answered = 0;

                if (room.currentQuestion < questions.length) {
                    sendQuestion(roomId);
                } else {
                    io.to(roomId).emit("quiz-ended", room.players);
                }
            }, 2000);
        }
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            rooms[roomId].players = rooms[roomId].players.filter(
                (p) => p.id !== socket.id,
            );

            io.to(roomId).emit("players-update", rooms[roomId].players);
        }
    });
});

function sendQuestion(roomId) {
    const room = rooms[roomId];
    const question = questions[room.currentQuestion];

    io.to(roomId).emit("new-question", {
        number: room.currentQuestion + 1,
        total: questions.length,
        question,
    });
}

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
