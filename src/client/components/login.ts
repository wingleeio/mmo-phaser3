import { Schema } from "@shared/protobuf";
import { decodeBinary } from "@shared/utils/serialization";
import { Scene } from "phaser";
import Web3 from "web3";
import { StyleConstants } from "../utls/constants";
import { server } from "../utls/server";
import InputText from "phaser3-rex-plugins/plugins/inputtext.js";

export class Login extends Scene {
  server: WebSocket;
  web3: Web3;
  accounts: string[];
  buttons: { [key: string]: Phaser.GameObjects.Text } = {};
  nameInput: InputText;

  constructor() {
    super({ key: "Login" });
    this.server = server;
    if (window["ethereum"]) {
      this.web3 = new Web3(window["ethereum"]);
    }
  }

  preload = () => {
    for (let i = 1; i <= 8; i++) {
      this.load.spritesheet(`${i}`, `assets/sprites/${i}.png`, {
        frameWidth: 26,
        frameHeight: 36,
      });
    }
  };

  create = async () => {
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.add
      .text(
        screenCenterX,
        screenCenterY - 150,
        `LEGENDS OF ETHEREUM`,
        StyleConstants.LOGO_STYLE
      )
      .setOrigin(0.5);

    this.accounts = await this.web3.eth.getAccounts();

    if (window["ethereum"] && this.accounts.length === 0) {
      this.buttons["connect"] = this.addButton(
        screenCenterX,
        screenCenterY + 50,
        "Connect Wallet",
        async () => {
          try {
            this.accounts = await window["ethereum"].request({
              method: "eth_requestAccounts",
            });

            if (this.accounts.length > 0) {
              this.buttons["connect"].destroy();
              this.addLoginButton();
            }
          } catch (e) {}
        }
      );
    } else if (this.accounts.length > 0) {
      this.addLoginButton();
    } else {
      this.add
        .text(
          screenCenterX,
          screenCenterY + 50,
          `You must have MetaMask installed to play this game.`,
          StyleConstants.TEXT_STYLE
        )
        .setOrigin(0.5);
    }

    this.input.setDefaultCursor("url(assets/gui/cursor.cur), pointer");
    this.server.addEventListener("message", this.handleMessage);
  };

  addLoginButton = () => {
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.buttons["login"] = this.addButton(
      screenCenterX,
      screenCenterY + 50,
      "Login",
      async () => {
        try {
          const packet = new Schema.ClientPacket();
          packet.setType(Schema.ClientPacketType.NONCE);
          packet.setAddress(this.accounts[0]);
          this.server.send(packet.serializeBinary());
        } catch (e) {}
      }
    );
  };

  addCharacterCreation = () => {
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;

    let sprite = 1;
    let name = "Enter Name";
    let displaySprite = this.add
      .sprite(screenCenterX, screenCenterY + 100, sprite.toString(), 1)
      .setOrigin(0.5)
      .setScale(4);

    this.nameInput = this.add
      .existing(
        new InputText(this, screenCenterX, screenCenterY, 150, 25, {
          type: "text",
          fontFamily: "Dogica",
          fontSize: "12px",
          text: name,
          align: "center",
        })
      )
      .setOrigin(0.5)
      .on("textchange", function (inputText) {
        name = inputText.text;
      });

    this.buttons["prev"] = this.addButton(
      screenCenterX - 150,
      screenCenterY + 100,
      "prev",
      () => {
        if (sprite > 1) {
          sprite--;
          displaySprite.setTexture(sprite.toString()).setFrame(1);
        }
      }
    );

    this.buttons["next"] = this.addButton(
      screenCenterX + 150,
      screenCenterY + 100,
      "next",
      () => {
        if (sprite < 8) {
          sprite++;
          displaySprite.setTexture(sprite.toString()).setFrame(1);
        }
      }
    );

    this.buttons["confirm"] = this.addButton(
      screenCenterX,
      screenCenterY + 250,
      "Click Here to confirm",
      () => {
        const packet = new Schema.ClientPacket();
        packet.setType(Schema.ClientPacketType.UPDATE_ACCOUNT);
        packet.setUpdate(new Schema.UpdateAccount());
        packet.getUpdate().setSprite(sprite);
        packet.getUpdate().setName(name);
        this.server.send(packet.serializeBinary());
      }
    );
  };

  addButton = (x: number, y: number, text: string, onClick: any) => {
    const button = this.add
      .text(x, y, text, StyleConstants.TEXT_STYLE)
      .setOrigin(0.5)
      .setInteractive({ cursor: "url(assets/gui/cursor-hover.cur), pointer" });

    button.on("pointerover", () => {
      button.setText(`[ ${text} ]`);
    });

    button.on("pointerout", () => {
      button.setText(text);
    });

    button.on("pointerdown", onClick);

    return button;
  };

  handleMessage = async (e: MessageEvent<any>) => {
    const packet = await decodeBinary<Schema.ServerPacket>(
      e.data,
      Schema.ServerPacket
    );

    const newPacket = new Schema.ClientPacket();

    switch (packet.getType()) {
      case Schema.ServerPacketType.SERVER_NONCE:
        //@ts-ignore
        const signature = await this.web3.eth.personal.sign(
          this.web3.utils.fromUtf8(
            `Logging into Legends of Ethereum with my one-time nonce: ${packet.getNonce()}`
          ),
          this.accounts[0]
        );

        newPacket.setType(Schema.ClientPacketType.LOGIN);
        newPacket.setLogin(new Schema.Login());
        newPacket.getLogin().setSignature(signature);
        newPacket.getLogin().setAddress(this.accounts[0]);
        this.server.send(newPacket.serializeBinary());
        break;
      case Schema.ServerPacketType.MISSING_DETAILS:
        this.buttons["login"].destroy();
        this.addCharacterCreation();
        break;
      case Schema.ServerPacketType.LOGIN_SUCCESS:
        this.scene.start("World", { id: packet.getId() });
        break;
      default:
        break;
    }
  };
}
