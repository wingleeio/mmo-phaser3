import WebSocket from "ws";
import cors from "cors";
import express from "express";
import http from "http";

export const app = express();

export const server = http.createServer(app);

export const io = new WebSocket.Server({
  noServer: true,
  path: "/ws",
});

app.use(cors());
