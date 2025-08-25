import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Used to store online users: { userId: socketId }
const userSocketMap = {};

// Initialize socket.io with proper CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // local dev
      "https://chat-app-frontend-beta-five.vercel.app" // production
    ],
    credentials: true, // allow cookies/credentials if needed later
  },
});

// Utility to get receiver socket id
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Handle socket connections
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query?.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`🔗 User ${userId} mapped to socket ${socket.id}`);
  } else {
    console.warn("⚠️ Connection without userId query param");
  }

  // Notify all clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
      console.log(`🗑️ Removed ${userId} from userSocketMap`);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
