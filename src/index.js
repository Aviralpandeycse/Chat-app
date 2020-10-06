const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return cb(error);
    }

    socket.join(user.room);
    socket.emit(
      "message",
      generateMessage("Admin", `Welcome ${user.username}!`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    //socket.broadcast.to.emit    io.to.emit    //using '.to' to emit events only to this room.
  });

  socket.on("sendMsg", (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed");
    }
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(user.username, msg));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (location, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, location)
    );
    cb();
  });
});

server.listen(port, () => {
  console.log("App is running on , localhost:" + port);
});
