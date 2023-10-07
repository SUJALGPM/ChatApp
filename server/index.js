const express = require('express');
const cors = require('cors');
const colors = require("colors");
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

const app = express();
require("dotenv").config();

//Connection axios....
app.use(cors());
app.use(express.json());

//Routes....
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

//Database connection....
const db = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log(`Successfully connected to mongodb database ${mongoose.connection.host}`.bgGreen.white);
    } catch (error) {
        console.log(`Database server issue ${error}`.bgRed.white);
    }
}

db();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port no ${process.env.PORT}`.bgCyan.white);
});

const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

//This line initializes a global Map named onlineUsers. 
//This map is used to store user IDs as keys and their corresponding socket IDs as values. 
//It's used to keep track of which users are currently online.
global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    });
});

