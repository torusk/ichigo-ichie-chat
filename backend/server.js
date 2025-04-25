// server.js (backend フォルダ内) - 修正版

const WebSocket = require("ws");

// 8080番ポートでWebSocketサーバーを起動
const wss = new WebSocket.Server({ port: 8080 });

// 接続中のクライアント (ws) とユーザー名 (string) を紐付けるMap
const clients = new Map(); // Set から Map に変更

console.log("WebSocketサーバーがポート 8080 で起動しました。");

// クライアントからの接続があった場合の処理
wss.on("connection", (ws) => {
  console.log("クライアントが接続しました。(名前はまだ不明)");

  // クライアントからメッセージを受信した場合の処理
  ws.on("message", (message) => {
    const messageString = message.toString();

    // この接続(ws)がまだ名前登録されていないかチェック
    if (!clients.has(ws)) {
      // 最初のメッセージをユーザー名として登録
      const username = messageString.trim(); // 前後の空白を削除
      if (username.length > 0 && username.length < 20) {
        // 簡単なバリデーション
        clients.set(ws, username);
        console.log(`ユーザー名 "${username}" が登録されました。`);
        broadcast(`*** ${username} が入室しました ***`, null); // 入室通知 (送信者以外に)
      } else {
        console.log("無効なユーザー名のため切断します:", username);
        ws.close(); // 無効な名前なら切断
      }
      return; // ユーザー名登録処理はここまで
    }

    // すでに名前が登録されている場合、通常のチャットメッセージとして処理
    const senderUsername = clients.get(ws);
    const formattedMessage = `${senderUsername}: ${messageString}`;
    console.log("受信:", formattedMessage);

    // 全員にメッセージを送信
    broadcast(formattedMessage, null); // null を渡して全員に送信
  });

  // クライアント接続が切断された場合の処理
  ws.on("close", () => {
    if (clients.has(ws)) {
      const username = clients.get(ws);
      console.log(`"${username}" が切断しました。`);
      clients.delete(ws); // Mapから削除
      broadcast(`*** ${username} が退室しました ***`, null); // 退室通知
    } else {
      console.log("名前不明のクライアントが切断しました。");
    }
  });

  // エラーが発生した場合の処理
  ws.on("error", (error) => {
    console.error("エラーが発生しました:", error);
    if (clients.has(ws)) {
      const username = clients.get(ws);
      console.log(`"${username}" の接続でエラー発生のため削除`);
      clients.delete(ws);
      broadcast(`*** ${username} の接続でエラーが発生しました ***`, null);
    }
  });
});

// 接続している全クライアントにメッセージを送信する関数
// senderWs を指定すると、その送信者を除外して送信 (今回は使わないのでnull指定でOK)
function broadcast(message, senderWs) {
  clients.forEach((username, clientWs) => {
    // Map なので value (username) も取れるがここでは使わない
    // 送信者を除外する場合のチェック (今回は常に全員に送るのでコメントアウト)
    // if (clientWs === senderWs) {
    //     return;
    // }
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}
