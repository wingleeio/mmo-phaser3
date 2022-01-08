import { Scene } from "phaser";
import { Schema } from "@shared/protobuf";

export class Chat extends Scene {
  schemaMessages: Schema.Message[];
  messages: Phaser.GameObjects.BitmapText;
  chatbox: Phaser.GameObjects.Rectangle;
  messagePrompt: Phaser.GameObjects.BitmapText;

  constructor() {
    super({ key: "chat" });
  }

  create() {
    this.chatbox = this.add.rectangle(
      600 / 2 + 16,
      this.sys.game.canvas.height - 250 / 2 - 16,
      600,
      250,
      0x000000
    );
    this.chatbox.setAlpha(0.2);
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
