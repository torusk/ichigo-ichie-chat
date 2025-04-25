// ichigo-ichie-chat/frontend/script.js (入力クリア最終修正版)

const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const attachButton = document.getElementById("attachButton"); // Attach button

let username = "";

const socket = new WebSocket("wss://ichigo-ichie-chat.onrender.com");

// --- 接続確立時の処理 ---
socket.onopen = () => {
  console.log("WebSocketサーバーに接続しました。");
  while (!username || username.trim().length === 0 || username.length >= 20) {
    username = prompt("チャットで使う名前を入力してください (19文字以内):");
    if (username === null) {
      displayMessage(
        "名前が入力されなかったので切断します。ページを再読み込みしてください。",
        true
      );
      socket.close();
      return;
    }
  }
  username = username.trim();
  socket.send(username);
  displayMessage(`*** ${username} として入室しました ***`, true);
  messageInput.disabled = false;
  sendButton.disabled = false;
  // attachButton.disabled = false; // 必要なら有効化
};

// --- サーバーからメッセージ受信時の処理 ---
socket.onmessage = (event) => {
  console.log("受信:", event.data);
  displayMessage(event.data);
};

// --- 接続クローズ時の処理 ---
socket.onclose = () => {
  console.log("WebSocketサーバーから切断されました。");
  displayMessage("*** サーバーから切断されました ***", true);
  messageInput.disabled = true;
  sendButton.disabled = true;
  // attachButton.disabled = true; // 必要なら無効化
};

// --- エラー発生時の処理 ---
socket.onerror = (error) => {
  console.error("WebSocketエラー:", error);
  displayMessage("*** エラーが発生しました ***", true);
  messageInput.disabled = true;
  sendButton.disabled = true;
  // attachButton.disabled = true; // 必要なら無効化
};

// --- メッセージ送信関数 ---
function sendMessage() {
  const message = messageInput.value;
  if (message.trim() !== "") {
    socket.send(message);
    messageInput.value = ""; // ★ 入力欄クリア
    // 高さはEnterキーイベントリスナー側でリセット
  }
}

// --- メッセージ表示関数 ---
function displayMessage(message, isSystem = false) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;

  if (isSystem || message.startsWith("***")) {
    messageElement.classList.add("system-message");
  } else {
    const messageParts = message.split(": ");
    const senderUsername = messageParts.length > 1 ? messageParts[0] : null;

    if (senderUsername && senderUsername === username) {
      messageElement.classList.add("my-message");
    } else {
      messageElement.classList.add("other-message");
    }
  }

  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// --- 送信ボタンのクリック処理 ---
sendButton.onclick = sendMessage;

// --- テキストエリアの高さ自動調整 ---
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = `${messageInput.scrollHeight}px`;
});

// --- Enterキーでの送信処理 (Shift+Enter改行対応 - これ一つに！) ---
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !messageInput.disabled) {
    event.preventDefault(); // デフォルトのEnterキー動作（改行）をキャンセル
    sendMessage(); // ★ メッセージ送信（ここで入力欄がクリアされる）
    messageInput.style.height = "auto"; // ★ 送信後、高さをリセット
  }
});

// --- 初期状態では入力欄とボタンを無効化 ---
messageInput.disabled = true;
sendButton.disabled = true;
// attachButton.disabled = true; // 必要なら無効化

// --- ★★★ 削除された古いリスナーの例 (コード内にもし残っていたら消す) ★★★ ---
/*
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !messageInput.disabled) {
    sendMessage();
  }
});
*/
