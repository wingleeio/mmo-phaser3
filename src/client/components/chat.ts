import { Scene } from "phaser";
import { Schema } from "@shared/protobuf";
import NinePatch from "phaser3-rex-plugins/plugins/ninepatch.js";

export class Chat extends Scene {
  schemaMessages: Schema.Message[];
  messages: Phaser.GameObjects.BitmapText;
  chatbox: NinePatch;
  messagePrompt: Phaser.GameObjects.BitmapText;

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
      .bitmapText(32, this.sys.game.canvas.height - 250 - 16, "arcade", "", 12)
      .setAlpha(0.8);

    this.messagePrompt = this.add
      .bitmapText(
        32,
        this.sys.game.canvas.height - 40,
        "arcade",
        "Press enter to type your message",
        12
      )
      .setAlpha(0.8);

    this.scale.on("resize", () => {
      this.chatbox.setY(this.sys.game.canvas.height - 250 / 2 - 16);
      this.messages.setY(this.sys.game.canvas.height - 250 - 16);
      this.messagePrompt.setY(this.sys.game.canvas.height - 40);
    });

    this.schemaMessages = [];
  }

  addMessage(message: Schema.Message) {
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
