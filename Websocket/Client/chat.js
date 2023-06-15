console.log("Custom chat client script activated!");

let customSocketConnection = io.connect('http://localhost:3000');

const username = prompt("Welcome! Kindly input your username:");

customSocketConnection.emit("userConnected", { username });

customSocketConnection.on("greetUser", (data) => {
  console.log("Welcome message received >>", data);
  pushMessage(data, false);
});

function pushMessage(data, isSelf = false) {
  const messageContent = document.createElement("div");
  messageContent.classList.add("userMessage");

  if (isSelf) {
    messageContent.classList.add("sentMessage");
    messageContent.innerText = `${data.message}`;
  } else {
    if (data.user === "server") {
      messageContent.innerText = `${data.message}`;
    } else {
      messageContent.classList.add("receivedMessage");
      messageContent.innerText = `${data.user}: ${data.message}`;
    }
  }
  const chatWrapper = document.getElementById("chatWrapper");

  chatWrapper.append(messageContent);
}

const msgForm = document.getElementById("msgForm");

msgForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const msgInput = document.getElementById("msgInput");

  if (msgInput.value !== "") {
    let userMessage = msgInput.value;
    customSocketConnection.emit("userMessage", { username: customSocketConnection.id, message: userMessage });
    pushMessage({ message: userMessage }, true);
    msgInput.value = "";
  } else {
    msgInput.classList.add("errorMsg");
  }
});

customSocketConnection.on("broadcastMessage", (data) => {
  console.log("📢 New custom broadcast message >> ", data);
  pushMessage(data, false);
});
