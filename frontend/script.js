// ichigo-ichie-chat/frontend/script.js (入力クリア修正版)

const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
// attachButton も念のため取得しておきます (将来使う場合)
const attachButton = document.getElementById("attachButton");

let username = ""; // ユーザー名を保持する変数

const socket = new WebSocket("wss://ichigo-ichie-chat.onrender.com");

// --- 接続確立時の処理 (変更なし) ---
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
  // attachButtonも有効化 (もし使うなら)
  // attachButton.disabled = false;
};

// --- サーバーからメッセージ受信時の処理 (変更なし) ---
socket.onmessage = (event) => {
  console.log("受信:", event.data);
  displayMessage(event.data);
};

// --- 接続クローズ時の処理 (変更なし) ---
socket.onclose = () => {
  console.log("WebSocketサーバーから切断されました。");
  displayMessage("*** サーバーから切断されました ***", true);
  messageInput.disabled = true;
  sendButton.disabled = true;
  // attachButtonも無効化 (もし使うなら)
  // attachButton.disabled = true;
};

// --- エラー発生時の処理 (変更なし) ---
socket.onerror = (error) => {
  console.error("WebSocketエラー:", error);
  displayMessage("*** エラーが発生しました ***", true);
  messageInput.disabled = true;
  sendButton.disabled = true;
  // attachButtonも無効化 (もし使うなら)
  // attachButton.disabled = true;
};

// --- メッセージ送信関数 (★ 修正: シンプル化) ---
function sendMessage() {
  const message = messageInput.value;
  if (message.trim() !== "") {
    socket.send(message); // サーバーに送信
    messageInput.value = ""; // ★ 入力欄をクリア
    // 高さをリセットする処理は、イベントリスナー側で行う
  }
}

// --- メッセージ表示関数 (変更なし) ---
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

// --- 送信ボタンのクリック処理 (変更なし) ---
sendButton.onclick = sendMessage;

// --- テキストエリアの高さ自動調整 (変更なし) ---
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = `${messageInput.scrollHeight}px`;
});

// --- ★ Enterキーでの送信処理 (Shift+Enter改行対応 - これ一つにする) ★ ---
messageInput.addEventListener("keydown", (event) => {
  // Shiftキーが押されておらず、Enterキーが押された場合のみ送信
  if (event.key === "Enter" && !event.shiftKey && !messageInput.disabled) {
    event.preventDefault(); // デフォルトのEnterキー動作（改行）をキャンセル
    sendMessage(); // メッセージ送信関数を呼び出す
    messageInput.style.height = "auto"; // ★ 送信後、高さをリセット
  }
  // Shift+Enterの場合は通常の改行が行われる
});

// --- 初期状態では入力欄とボタンを無効化 (変更なし) ---
messageInput.disabled = true;
sendButton.disabled = true;
// attachButton も初期状態は無効 (もし使うなら)
// attachButton.disabled = true;

// --- 以前の重複していた可能性のある単純なEnterキーリスナーは削除 ---
// (もしコード内に下記のようなリスナーが残っていたら削除してください)
// messageInput.addEventListener('keydown', (event) => {
//   if (event.key === 'Enter' && !messageInput.disabled) {
//     sendMessage();
//   }
// });
