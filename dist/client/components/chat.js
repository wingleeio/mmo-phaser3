"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const phaser_1 = require("phaser");
const ninepatch_js_1 = __importDefault(require("phaser3-rex-plugins/plugins/ninepatch.js"));
const constants_1 = require("../utls/constants");
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
            .text(48, this.sys.game.canvas.height - 250, "", constants_1.StyleConstants.TEXT_STYLE)
            .setAlpha(0.6)
            .setShadow(1, 1, "black");
        this.messagePrompt = this.add
            .text(48, this.sys.game.canvas.height - 56, "Press enter to type your message", constants_1.StyleConstants.TEXT_STYLE)
            .setAlpha(0.6)
            .setShadow(1, 1, "black");
        this.scale.on("resize", () => {
            this.chatbox.setY(this.sys.game.canvas.height - 250 / 2 - 16);
            this.messages.setY(this.sys.game.canvas.height - 250);
            this.messagePrompt.setY(this.sys.game.canvas.height - 64);
        });
        this.schemaMessages = [];
    }
    addMessage(message) {
        this.schemaMessages.push(message);
        if (this.schemaMessages.length > 7) {
            this.schemaMessages.shift();
        }
        let newMessages = "";
        this.schemaMessages.forEach((m) => {
            newMessages =
                newMessages + `\n[Player ${m.getId()}]: ${m.getContent()}\n`;
        });
        this.messages.setText(newMessages);
    }
}
exports.Chat = Chat;
//# sourceMappingURL=chat.js.map