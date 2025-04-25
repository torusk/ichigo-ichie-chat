// ichigo-ichie-chat/frontend/script.js

// ... (他の部分はそのまま) ...

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ バックエンドをRenderにデプロイした後、以下のURLを書き換える！ ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// const socket = new WebSocket('ws://localhost:3000'); // ローカルテスト用
const socket = new WebSocket("wss://YOUR_RENDER_APP_NAME.onrender.com"); // ★ RenderのURLに書き換える (wss://)

// ... (socket.onopen 以降はそのまま) ...
