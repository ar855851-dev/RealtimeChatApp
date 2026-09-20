const express = require("express");

const app = express();

const authRouter = require("./controller/authController");
const userRouter = require("./controller/userController");
const chatRouter = require("./controller/chatController");
const messageRouter = require("./controller/messageController");

app.use(express.json());

const server = require("http").createServer(app);

// 1. CORS allow karein (Production frontend URL ya sabhi origins)
const io = require("socket.io")(server, {
    cors: {
        origin: "*", // Testing ke liye "*", ya apne deployed frontend ka URL daalein
        methods: ["GET", "POST"]
    }
});

// 2. ROOT ROUTE (Isse "Cannot GET /" theek ho jayega)
app.get("/", (req, res) => {
    res.send("🚀 QuickChat Backend is running successfully on Render!");
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);


const onlineUser = [];


// SOCKET.IO
io.on("connection", (socket) => {

    console.log("🟢 SOCKET CONNECTED:", socket.id);

    // User ko uske userId wale room me join karna
    socket.on("join-room", (userId) => {
        console.log("🟢 JOIN ROOM:", userId);
        socket.join(String(userId));
        console.log("ROOM JOINED:", userId, "SOCKET:", socket.id);
    });

    // Send message
    socket.on("send-message", (message) => {
        console.log("📤 SEND MESSAGE:", message);
        console.log("👥 MEMBERS:", message.members);

        if (!message.members || message.members.length < 2) {
            console.log("❌ MEMBERS MISSING");
            return;
        }

        const member1 = String(message.members[0]);
        const member2 = String(message.members[1]);

        console.log("📨 Sending to:", member1, member2);

        io.to(member1).to(member2).emit("receive-message", message);
        console.log("✅ RECEIVE-MESSAGE EMITTED");
    });

    // Clear unread messages
    socket.on("clear-unread-messages", (data) => {
        console.log("🟡 CLEAR UNREAD:", data);

        if (!data.members || data.members.length < 2) {
            return;
        }

        io.to(data.members[0]).to(data.members[1]).emit("message-count-cleared", data);
    });

    socket.on("started-typing", (data) => {
        io.to(data.members[0]).to(data.members[1]).emit("started-typing", data);
    });

    socket.on("disconnect", () => {
        console.log("🔴 SOCKET DISCONNECTED:", socket.id);
    });

    socket.on("user-login", (userId) => {
        if (userId) {
            const strId = String(userId);
            if (!onlineUser.includes(strId)) {
                onlineUser.push(strId);
            }
            io.emit("online-users", onlineUser);
        }
    });

});

module.exports = server;