"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
require("@geckos.io/phaser-on-nodejs");
const server_1 = require("@server/core/server");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
function main() {
    server_1.app.use("/", express_1.default.static(path_1.default.join(__dirname, "../client")));
    server_1.app.get("/", (req, res) => {
        res.sendFile(path_1.default.resolve("./dist/client/index.html"));
    });
    server_1.server.listen(3000);
    server_1.server.on("upgrade", (request, socket, head) => {
        server_1.io.handleUpgrade(request, socket, head, (websocket) => {
            server_1.io.emit("connection", websocket, request);
        });
    });
    console.log(`Application running on port ${3000}`);
}
main();
//# sourceMappingURL=index.js.map