// ichigo-ichie-chat/frontend/script.js (修正版)

const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

let username = ""; // ユーザー名を保持する変数 (これは変更なし)

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ このURLはデプロイしたRenderのURLに設定されているはずです！ ★
// ★ (もしローカルテストに戻す場合は 'ws://localhost:3000' などに) ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const socket = new WebSocket("wss://ichigo-ichie-chat.onrender.com"); // ← デプロイ済みURL

// 接続が確立したときの処理 (変更なし)
socket.onopen = () => {
  console.log("WebSocketサーバーに接続しました。");
  // ユーザー名を入力してもらう
  while (!username || username.trim().length === 0 || username.length >= 20) {
    username = prompt("チャットで使う名前を入力してください (19文字以内):");
    if (username === null) {
      displayMessage(
        "名前が入力されなかったので切断します。ページを再読み込みしてください。",
        true
      ); // システムメッセージとして表示
      socket.close();
      return;
    }
  }
  username = username.trim();
  socket.send(username);
  displayMessage(`*** ${username} として入室しました ***`, true); // 自分にも表示 & システムメッセージとして
  messageInput.disabled = false;
  sendButton.disabled = false;
};

// サーバーからメッセージを受信したときの処理 (変更なし)
socket.onmessage = (event) => {
  console.log("受信:", event.data);
  displayMessage(event.data); // displayMessage内で判定・スタイル付け
};

// 接続が閉じたときの処理 (表示部分をシステムメッセージ扱いに変更)
socket.onclose = () => {
  console.log("WebSocketサーバーから切断されました。");
  displayMessage("*** サーバーから切断されました ***", true); // システムメッセージとして
  messageInput.disabled = true;
  sendButton.disabled = true;
};

// エラーが発生したときの処理 (表示部分をシステムメッセージ扱いに変更)
socket.onerror = (error) => {
  console.error("WebSocketエラー:", error);
  displayMessage("*** エラーが発生しました ***", true); // システムメッセージとして
  messageInput.disabled = true;
  sendButton.disabled = true;
};

// メッセージを送信する関数 (変更なし)
function sendMessage() {
  const message = messageInput.value;
  if (message.trim() !== "") {
    // ★ 自分の送信メッセージも表示するよう変更 ★
    displayMessage(`${username}: ${message}`); // 送信時に自分にも表示
    socket.send(message);
    messageInput.value = "";
  }
}

// 受信したメッセージをチャットボックスに表示する関数 (★ 修正箇所 ★)
function displayMessage(message, isSystem = false) {
  // isSystemフラグを追加
  const messageElement = document.createElement("div");
  messageElement.textContent = message;

  if (isSystem || message.startsWith("***")) {
    // ★ システムメッセージの場合 ★
    messageElement.classList.add("system-message");
  } else {
    // ★ ユーザーメッセージの場合 ★
    // メッセージからユーザー名部分を抽出 (": " の前まで)
    const messageParts = message.split(": ");
    const senderUsername = messageParts.length > 1 ? messageParts[0] : null;

    if (senderUsername && senderUsername === username) {
      // ★ 自分のメッセージの場合 ★
      messageElement.classList.add("my-message");
    } else {
      // ★ 他の人のメッセージの場合 ★
      messageElement.classList.add("other-message");
    }
  }

  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// 送信ボタンがクリックされたときの処理 (変更なし)
sendButton.onclick = sendMessage;

// Enterキーが押されたときもメッセージを送信 (変更なし)
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !messageInput.disabled) {
    sendMessage();
  }
});

// 初期状態では入力欄とボタンを無効化しておく (変更なし)
messageInput.disabled = true;
sendButton.disabled = true;
