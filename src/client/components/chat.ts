import { Scene } from "phaser";
import { Schema } from "@shared/protobuf";
import NinePatch from "phaser3-rex-plugins/plugins/ninepatch.js";
import { StyleConstants } from "../utls/constants";
import { Player } from "./player";

export class Chat extends Scene {
  schemaMessages: Schema.Message[];
  messages: Phaser.GameObjects.Text;
  chatbox: NinePatch;
  messagePrompt: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "chat" });
  }

  preload() {
    this.load.image("base", "assets/gui/base4x.png");
  }

  create() {
    const gridSize = 64;
    this.chatbox = this.add.existing(
      new NinePatch(
        this,
        600 / 2 + 16,
        this.sys.game.canvas.height - 250 / 2 - 16,
        600,
        250,
        "base",
        [gridSize, gridSize, gridSize],
        [gridSize, gridSize, gridSize]
      )
    );

    this.chatbox.setAlpha(0.8);
    this.chatbox.setScrollFactor(0);

    this.messages = this.add
      .text(
        48,
        this.sys.game.canvas.height - 250,
        "",
        StyleConstants.TEXT_STYLE
      )
      .setAlpha(0.6)
      .setShadow(1, 1, "black");

    this.messagePrompt = this.add
      .text(
        48,
        this.sys.game.canvas.height - 56,
        "Press enter to type your message",
        StyleConstants.TEXT_STYLE
      )
      .setAlpha(0.6)
      .setShadow(1, 1, "black");

    this.scale.on("resize", () => {
      this.chatbox.setY(this.sys.game.canvas.height - 250 / 2 - 16);
      this.messages.setY(this.sys.game.canvas.height - 250);
      this.messagePrompt.setY(this.sys.game.canvas.height - 64);
    });

    this.schemaMessages = [];
  }

  addMessage(player: Player, message: Schema.Message) {
    this.schemaMessages.push(message);
    if (this.schemaMessages.length > 7) {
      this.schemaMessages.shift();
    }
    let newMessages = "";

    this.schemaMessages.forEach((m) => {
      newMessages = newMessages + `\n[${m.getName()}]: ${m.getContent()}\n`;
    });

    this.messages.setText(newMessages);
  }
}
