const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

// App setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/chatDB", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Failed:", err));

// Chat Schema
const chatSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

// Serve static files (for frontend)
app.use(express.static("public"));

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("A user connected");

    // Send previous messages
    Chat.find().then(messages => {
        socket.emit("previousMessages", messages);
    });

    // Listen for new messages
    socket.on("sendMessage", (data) => {
        const newMessage = new Chat(data);
        newMessage.save().then(() => {
            io.emit("newMessage", data);
        });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
