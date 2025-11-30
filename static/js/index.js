let socket = null;

let chatArea = null;
let recipientsArea = null;
let messageInput = null;

function addUser(sid, name) {
  const li = document.createElement("li");
  li.className = `sid-${sid}`;
  li.textContent = name;

  recipientsArea.append(li);
}

/*
function removeUser(sid) {
  const li = document.querySelector(`sid-${sid}`);
  li.remove();
}
*/

function clearUsers() {
  Array.from(recipientsArea.children).forEach((element) => {
    element.remove();
  });
}

function addMessage(type, message, name = null) {
  const messageArea = document.createElement("div");
  messageArea.className = `${type}-message`;

  if (type == "system") {
    const messageContent = document.createElement("div");
    messageContent.className = "message";
    messageContent.textContent = message;

    messageArea.append(messageContent);
  } else {
    const messageField = document.createElement("div");
    messageField.className = "message";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.textContent = message;

    const nameArea = document.createElement("div");
    nameArea.className = "name";
    nameArea.textContent = name;

    messageField.append(messageContent);
    messageField.append(nameArea);

    messageArea.append(messageField);
  }

  chatArea.append(messageArea);

  const scrollThreshold = 500;
  const isNearBottom =
    chatArea.scrollTop >= chatArea.scrollHeight - scrollThreshold;

  chatArea.append(messageArea);

  if (isNearBottom) {
    chatArea.scrollTop = chatArea.scrollHeight;
  }
}

function sendMessage() {
  if (messageInput.value.replace(" ", "").replace("　", "").length <= 0) {
    return;
  }

  socket.emit("chatMessage", messageInput.value);

  messageInput.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const nameSubmit = document.getElementById("name-submit");
  const messageSubmit = document.getElementById("message-submit");

  chatArea = document.querySelector(".chat-area");
  recipientsArea = document.querySelector(".recipients-area");
  messageInput = document.getElementById("message");

  messageSubmit.addEventListener("click", () => {
    sendMessage();
  });

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  nameSubmit.addEventListener("click", () => {
    const nameInput = document.getElementById("name");

    if (nameInput.value.replace(" ", "").replace("　", "").length <= 0) {
      return;
    }

    socket = io({ auth: { name: nameInput.value } });

    socket.on("connect", () => {
      addMessage("system", "接続しました。");
    });

    socket.on("disconnect", () => {
      addMessage("system", "切断しました。");
    });

    socket.on("join", (data) => {
      addMessage("system", `${data.name} が接続しました。`);
    });

    socket.on("quit", (data) => {
      addMessage("system", `${data.name} が切断しました。`);
    });

    socket.on("updateUserList", (data) => {
      clearUsers();

      data.forEach((user) => {
        addUser(user.sid, user.name);
      });
    });

    socket.on("chatMessage", (data) => {
      const type = data.sid == socket.id ? "self" : "others";
      addMessage(type, data.message, data.name);
    });

    const overlay = document.querySelector(".overlay");
    overlay.remove();
  });
});
