// script.js (frontend フォルダ内) - 修正版

const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

let username = ""; // ユーザー名を保持する変数

// WebSocketサーバーに接続
const socket = new WebSocket("ws://localhost:8080");

// 接続が確立したときの処理
socket.onopen = () => {
  console.log("WebSocketサーバーに接続しました。");
  // ユーザー名を入力してもらう
  while (!username || username.trim().length === 0 || username.length >= 20) {
    username = prompt("チャットで使う名前を入力してください (19文字以内):");
    if (username === null) {
      // キャンセルされた場合
      displayMessage(
        "名前が入力されなかったので切断します。ページを再読み込みしてください。"
      );
      socket.close();
      return;
    }
  }
  username = username.trim();
  // 最初のメッセージとしてユーザー名をサーバーに送信
  socket.send(username);
  displayMessage(`*** ${username} として入室しました ***`); // 自分にも表示
  messageInput.disabled = false; // 入力欄を有効化
  sendButton.disabled = false; // ボタンを有効化
};

// サーバーからメッセージを受信したときの処理
socket.onmessage = (event) => {
  console.log("受信:", event.data);
  displayMessage(event.data); // サーバーから送られてくる整形済みのメッセージを表示
};

// 接続が閉じたときの処理
socket.onclose = () => {
  console.log("WebSocketサーバーから切断されました。");
  displayMessage("*** サーバーから切断されました ***");
  messageInput.disabled = true; // 入力欄を無効化
  sendButton.disabled = true; // ボタンを無効化
};

// エラーが発生したときの処理
socket.onerror = (error) => {
  console.error("WebSocketエラー:", error);
  displayMessage("*** エラーが発生しました ***");
  messageInput.disabled = true;
  sendButton.disabled = true;
};

// メッセージを送信する関数
function sendMessage() {
  const message = messageInput.value;
  if (message.trim() !== "") {
    socket.send(message);
    messageInput.value = "";
  }
}

// 受信したメッセージをチャットボックスに表示する関数
function displayMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  // メッセージの種類によってスタイルを変える (任意)
  if (message.startsWith("***")) {
    messageElement.style.fontStyle = "italic";
    messageElement.style.color = "gray";
  }
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// 送信ボタンがクリックされたときの処理
sendButton.onclick = sendMessage;

// Enterキーが押されたときもメッセージを送信
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !messageInput.disabled) {
    // 無効化されてないかチェック
    sendMessage();
  }
});

// 初期状態では入力欄とボタンを無効化しておく
messageInput.disabled = true;
sendButton.disabled = true;
