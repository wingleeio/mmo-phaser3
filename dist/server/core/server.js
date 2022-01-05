"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const ws_1 = __importDefault(require("ws"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
exports.app = (0, express_1.default)();
exports.server = http_1.default.createServer(exports.app);
exports.io = new ws_1.default.Server({
    noServer: true,
    path: "/ws",
});
exports.app.use((0, cors_1.default)());
exports.app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../client")));
exports.app.get("/", (req, res) => {
    res.sendFile(path_1.default.resolve("./dist/client/index.html"));
});
exports.server.listen(3000);
exports.server.on("upgrade", (request, socket, head) => {
    exports.io.handleUpgrade(request, socket, head, (websocket) => {
        exports.io.emit("connection", websocket, request);
    });
});
console.log(`Application running on port ${3000}`);
//# sourceMappingURL=server.js.map