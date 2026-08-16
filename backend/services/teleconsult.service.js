const { Server } = require("socket.io");

let io;

function initTeleconsult(server) {
  io = new Server(server, { cors:{ origin:"*" } });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", ({ roomId, userId, role }) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", { userId, role, socketId:socket.id });
      console.log(`${role} ${userId} joined room ${roomId}`);
    });

    socket.on("webrtc-offer",     (data) => socket.to(data.roomId).emit("webrtc-offer",     data));
    socket.on("webrtc-answer",    (data) => socket.to(data.roomId).emit("webrtc-answer",    data));
    socket.on("webrtc-ice",       (data) => socket.to(data.roomId).emit("webrtc-ice",       data));
    socket.on("call-ended",       (data) => socket.to(data.roomId).emit("call-ended",       data));
    socket.on("chat-message",     (data) => io.to(data.roomId).emit("chat-message",         data));

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  console.log("🎥 Teleconsult Socket.IO initialized");
  return io;
}

function getIO() { return io; }

module.exports = { initTeleconsult, getIO };
