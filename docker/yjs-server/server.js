#!/usr/bin/env node

/**
 * Yjs WebSocket Server for BlogDidacta
 * Handles real-time collaborative editing sessions.
 * Each blog post gets its own "room" identified by the post's accessToken.
 */

const { setupWSConnection, } = require("y-websocket/bin/utils");
const http = require("http");
const WebSocket = require("ws");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = parseInt(process.env.PORT || "1234", 10);

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Yjs WebSocket Server – BlogDidacta");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (conn, req) => {
  // Room name comes from the URL path, e.g. ws://host:1234/room-id
  setupWSConnection(conn, req, {
    gc: true, // garbage collect deleted content
  });
  console.log(`[YJS] Client connected. Room: ${req.url}`);
});

server.listen(PORT, HOST, () => {
  console.log(`[YJS] WebSocket server running on ws://${HOST}:${PORT}`);
});
