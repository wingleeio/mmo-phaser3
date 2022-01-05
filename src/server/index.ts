import "module-alias/register";
import "@geckos.io/phaser-on-nodejs";

import { app, io, server } from "./core/server";

import express from "express";
import path from "path";

function main() {
  app.use("/", express.static(path.join(__dirname, "../client")));

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
}

main();
