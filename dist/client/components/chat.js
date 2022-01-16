"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const phaser_1 = require("phaser");
const ninepatch_js_1 = __importDefault(require("phaser3-rex-plugins/plugins/ninepatch.js"));
class Chat extends phaser_1.Scene {
    constructor() {
        super({ key: "chat" });
    }
    preload() {
        this.load.image("base", "assets/gui/base4x.png");
    }
    create() {
        const gridSize = 64;
        this.chatbox = this.add.existing(new ninepatch_js_1.default(this, 600 / 2 + 16, this.sys.game.canvas.height - 250 / 2 - 16, 600, 250, "base", [gridSize, gridSize, gridSize], [gridSize, gridSize, gridSize]));
        this.chatbox.setAlpha(0.8);
        this.chatbox.setScrollFactor(0);
        this.messages = this.add
            .bitmapText(32, this.sys.game.canvas.height - 250 - 16, "arcade", "", 12)
            .setAlpha(0.8);
        this.messagePrompt = this.add
            .bitmapText(32, this.sys.game.canvas.height - 40, "arcade", "Press enter to type your message", 12)
            .setAlpha(0.8);
        this.scale.on("resize", () => {
            this.chatbox.setY(this.sys.game.canvas.height - 250 / 2 - 16);
            this.messages.setY(this.sys.game.canvas.height - 250 - 16);
            this.messagePrompt.setY(this.sys.game.canvas.height - 40);
        });
        this.schemaMessages = [];
    }
    addMessage(message) {
        this.schemaMessages.push(message);
        if (this.schemaMessages.length > 17) {
            this.schemaMessages.shift();
        }
        let newMessages = "";
        this.schemaMessages.forEach((m) => {
            newMessages = newMessages + `\nPlayer ${m.getId()} - ${m.getContent()}`;
        });
        this.messages.setText(newMessages);
    }
}
exports.Chat = Chat;
//# sourceMappingURL=chat.js.map