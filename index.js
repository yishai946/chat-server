const express = require("express");
const http = require("http");
const socket = require("socket.io");

const PORT = 3000;
const app = express();
const server = http.createServer(app);

let users = [];
let generalMessages = [];
let chats = [];

// chat structure: {person1: {id, username}, person2: {id, username}, messages: []}

const findChat = (person1, person2) => {
  return chats.find(
    (c) =>
      (c.person1.id === person1 && c.person2.id === person2) ||
      (c.person1.id === person2 && c.person2.id === person1)
  );
};

const findAllChats = (user) => {
  return chats.filter((c) => c.person1.id === user.id || c.person2.id === user.id);
}

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

  socket.on("message", (message) => {
    generalMessages.push(message);
    io.emit("message", generalMessages);
  });

  socket.on("connectUser", (user) => {
    // add user to users array if they don't exist
    if (!users.find((u) => u.id === user.id)) {
      users.push(user);
      generalMessages.push({
        message: `${user.username} connected`,
        user,
        type: "user",
      });
    }

    const userChats = findAllChats(user);

    // create chats for the user if they don't exist
    if(userChats.length === 0) {
      users.forEach((u) => {
        if (u.id !== user.id) {
          chats.push({ person1: user, person2: u, messages: [] });
        }
      });
    }

    io.emit("connectUser", { users, generalMessages, userChats });
  });

  socket.on("disconnectUser", (user) => {
    users = users.filter((u) => u.id !== user.id);
    generalMessages.push({
      message: `${user.username} disconnected`,
      user,
      type: "user",
    });
    io.emit("disconnectUser", { users, generalMessages });
  });

  socket.on("privateMessage", (message) => {
    const chat = findChat(message.user.id, message.to);
    chat.messages.push(message);
    const userChats = findAllChats(message.user);
    io.emit("privateMessage", {userChats, id1: message.user.id, id2: message.to});
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
