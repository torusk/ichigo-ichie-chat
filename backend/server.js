// ichigo-ichie-chat/backend/server.js

const WebSocket = require('ws');
const http = require('http'); // ★ httpモジュールを追加

// Renderが指定するポート、なければローカル用のポート (例: 3000)
const PORT = process.env.PORT || 3000; // ★ ポート指定の変更

// 1. HTTPサーバーを作成
const server = http.createServer((req, res) => {
  // ★ ヘルスチェック用のレスポンス
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK'); // Renderがヘルスチェックで200 OKを期待する
  } else {
    res.writeHead(404);
    res.end();
  }
});

// 2. WebSocketサーバーをHTTPサーバーにアタッチ
const wss = new WebSocket.Server({ server }); // ★ new WebSocket.Server({ port: ... }) から変更

// 接続中のクライアント (ws) とユーザー名 (string) を紐付けるMap
const clients = new Map();

// ★ HTTPサーバーを指定したポートで起動
server.listen(PORT, () => {
    console.log(`HTTPサーバーおよびWebSocketサーバーがポート ${PORT} で起動しました。`);
});

// --- WebSocket関連の処理 (wss.on('connection', ...) は変更なし) ---
// (省略... 前回の回答と同じ内容をここに記述)
// クライアントからの接続があった場合の処理
wss.on('connection', (ws) => {
    console.log('クライアントが接続しました。(名前はまだ不明)');

    // クライアントからメッセージを受信した場合の処理
    ws.on('message', (message) => {
        const messageString = message.toString();

        // この接続(ws)がまだ名前登録されていないかチェック
        if (!clients.has(ws)) {
            const username = messageString.trim();
            if (username.length > 0 && username.length < 20) {
                clients.set(ws, username);
                console.log(`ユーザー名 "${username}" が登録されました。`);
                broadcast(`*** ${username} が入室しました ***`, null);
            } else {
                console.log('無効なユーザー名のため切断します:', username);
                ws.close();
            }
            return;
        }

        const senderUsername = clients.get(ws);
        const formattedMessage = `${senderUsername}: ${messageString}`;
        console.log('受信:', formattedMessage);
        broadcast(formattedMessage, null);
    });

    // クライアント接続が切断された場合の処理
    ws.on('close', () => {
        if (clients.has(ws)) {
            const username = clients.get(ws);
            console.log(`"${username}" が切断しました。`);
            clients.delete(ws);
            broadcast(`*** ${username} が退室しました ***`, null);
        } else {
            console.log('名前不明のクライアントが切断しました。');
        }
    });

    // エラーが発生した場合の処理
    ws.on('error', (error) => {
        console.error('エラーが発生しました:', error);
        if (clients.has(ws)) {
            const username = clients.get(ws);
            console.log(`"${username}" の接続でエラー発生のため削除`);
            clients.delete(ws);
            broadcast(`*** ${username} の接続でエラーが発生しました ***`, null);
        }
    });
});

// 接続している全クライアントにメッセージを送信する関数
function broadcast(message, senderWs) {
    clients.forEach((username, clientWs) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(message);
        }
    });
}
// --- ここまで ---