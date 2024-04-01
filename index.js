const express = require("express");
const http = require("http");
const socket = require("socket.io");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("connect", (data) => {
    console.log("User connected", data);
  });

  socket.on("message", (message) => io.emit("message", message));

  socket.on("disconnect", (data) => {
    console.log("User disconnected", data);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
