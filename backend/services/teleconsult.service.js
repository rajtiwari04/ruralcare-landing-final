const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

let io;

function initTeleconsult(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication token required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password -otp");
      if (!user || !user.isActive) return next(new Error("User not found or inactive"));
      socket.user = user;
      next();
    } catch (err) {
      console.warn("Socket connection unauthorized:", err.message);
      next(new Error("Unauthorized socket connection"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.user.fullName}, Role: ${socket.user.role})`);

    socket.on("join-room", async ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
      socket.currentRoom = roomId;

      // Fetch all sockets currently in this room to share with newcomer
      const roomSockets = await io.in(roomId).fetchSockets();
      const otherParticipants = roomSockets
        .filter(s => s.id !== socket.id)
        .map(s => ({
          socketId: s.id,
          userId: s.user._id,
          fullName: s.user.fullName,
          role: s.user.role,
        }));

      // Notify others that a new user joined
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId: socket.user._id,
        fullName: socket.user.fullName,
        role: socket.user.role,
      });

      // Send list of existing users to the joining client
      socket.emit("room-users", { participants: otherParticipants });
      console.log(`🎥 ${socket.user.role} ${socket.user.fullName} joined room ${roomId}`);
    });

    socket.on("webrtc-offer", (data) => {
      const target = data.targetSocketId;
      if (target) {
        io.to(target).emit("webrtc-offer", { ...data, senderSocketId: socket.id, senderName: socket.user.fullName });
      } else if (data.roomId) {
        socket.to(data.roomId).emit("webrtc-offer", { ...data, senderSocketId: socket.id, senderName: socket.user.fullName });
      }
    });

    socket.on("webrtc-answer", (data) => {
      const target = data.targetSocketId;
      if (target) {
        io.to(target).emit("webrtc-answer", { ...data, senderSocketId: socket.id });
      } else if (data.roomId) {
        socket.to(data.roomId).emit("webrtc-answer", { ...data, senderSocketId: socket.id });
      }
    });

    socket.on("webrtc-ice", (data) => {
      const target = data.targetSocketId;
      if (target) {
        io.to(target).emit("webrtc-ice", { ...data, senderSocketId: socket.id });
      } else if (data.roomId) {
        socket.to(data.roomId).emit("webrtc-ice", { ...data, senderSocketId: socket.id });
      }
    });

    socket.on("toggle-media", (data) => {
      if (data.roomId) {
        socket.to(data.roomId).emit("user-media-toggled", {
          socketId: socket.id,
          audioMuted: data.audioMuted,
          cameraOff: data.cameraOff,
        });
      }
    });

    socket.on("chat-message", (data) => {
      if (data.roomId && data.message) {
        io.to(data.roomId).emit("chat-message", {
          sender: socket.user.fullName,
          senderId: socket.user._id,
          role: socket.user.role,
          content: data.message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }
    });

    socket.on("call-ended", (data) => {
      if (data.roomId) {
        socket.to(data.roomId).emit("call-ended", { endedBy: socket.user.fullName });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit("user-left", {
          socketId: socket.id,
          userId: socket.user._id,
          fullName: socket.user.fullName,
        });
      }
    });
  });

  console.log("🎥 Teleconsult Socket.IO initialized with authentication & WebRTC signaling");
  return io;
}

function getIO() { return io; }

module.exports = { initTeleconsult, getIO };
