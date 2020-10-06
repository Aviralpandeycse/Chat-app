users = [];

const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return { error: "Please provide username and room!" };
  }

  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (existingUser) {
    return { error: "Username already taken!" };
  }

  //Store the data
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
};
