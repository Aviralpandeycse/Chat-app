const socket = io();

//Elements
const $messageForm = document.querySelector("#form1");
const $msgFormInput = document.querySelector("#form1 input");
const $msgFormButton = document.querySelector("#form1 button");
const $locationButton = document.querySelector("#location");
const $messageArea = document.querySelector("#messages");
const $sidebarArea = document.querySelector("#sidebar");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //New message element
  const $newMessage = $messageArea.lastElementChild;

  //Height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const $newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + $newMessageMargin;

  //Visible Height
  const visibleHeight = $messageArea.offsetHeight;

  //Height of messages container
  const containerHeight = $messageArea.scrollHeight;

  //How far have I scrolled?
  const scrollOffset = $messageArea.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageArea.scrollTop = $messageArea.scrollHeight;
  }
};

socket.on("message", (msgObj) => {
  const time = moment(msgObj.createdAt).format("h:mm a");
  console.log(msgObj);
  $messageArea.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
      <p><span class="message__name">${msgObj.username}</span>
      <span class="message__meta">${time}</span></p>
      <p>${msgObj.text}</p>
    </div>`
  );
  autoScroll();
});

socket.on("locationMessage", (msgObj) => {
  console.log(msgObj);
  const time = moment(msgObj.createdAt).format("h:mm a");
  $messageArea.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
      <p class="message__name">${msgObj.username}</p>
      <p class="message__meta">${time}</p>
      <p><a href=${msgObj.url} target="_blank">My current location</a></p>
    </div>`
  );
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  console.log(room);
  console.log(users);
  let userList = "";
  let count;
  for (user of users) {
    userList += `<li>${user.username}<li>`;
  }
  $sidebarArea.innerHTML = `
    <h2 class="room-title">${room.toUpperCase()}</h2>
    <h3 class="list-title">Users</h3>
    <ol class="users">
      ${userList}
    </ol>`;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $msgFormButton.setAttribute("disabled", "disabled");
  $msgFormInput.setAttribute("disabled", "disabled");

  const msg = e.target.elements.msg.value;
  socket.emit("sendMsg", msg, (error) => {
    //enable
    $msgFormInput.value = "";
    $msgFormButton.removeAttribute("disabled");
    $msgFormInput.removeAttribute("disabled");
    $msgFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message Delivered!");
  });
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
    };
    socket.emit("sendLocation", location, () => {
      console.log("Location sent!");
      $locationButton.removeAttribute("disabled");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
