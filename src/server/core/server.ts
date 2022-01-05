import WebSocket from "ws";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";

export const app = express();

export const server = http.createServer(app);

export const io = new WebSocket.Server({
  noServer: true,
  path: "/ws",
});

app.use(cors());

app.use("/", express.static(path.join(__dirname, "../../client")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("./dist/client/index.html"));
});

server.listen(3000);

server.on("upgrade", (request, socket, head) => {
  io.handleUpgrade(request, socket, head, (websocket) => {
    io.emit("connection", websocket, request);
  });
});

console.log(`Application running on port ${3000}`);
