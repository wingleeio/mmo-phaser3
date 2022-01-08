import {
  SnapshotInterpolation,
  Vault,
} from "@geckos.io/snapshot-interpolation";

import { Chat } from "./chat";
import { Entity } from "@geckos.io/snapshot-interpolation/lib/types";
import { Player } from "./player";
import { Scene } from "phaser";
import { Schema } from "@shared/protobuf";
import { decodeBinary } from "@shared/utils/serialization";

const players: { [key: number]: Player } = {};
const disconnected: any = {};
const SI: SnapshotInterpolation = new SnapshotInterpolation(15);
const clientVault = new Vault();
export class World extends Scene {
  server: WebSocket;
  me: number;
  inputs: Phaser.Types.Input.Keyboard.CursorKeys;

  map: Phaser.Tilemaps.Tilemap;
  sendingMessage: boolean;

  constructor() {
    super({ key: "World" });
    this.server = new WebSocket("wss://mmo-phaser3.herokuapp.com/ws");
    // this.server = new WebSocket("ws://localhost:3000/ws");
    this.initConnection();
  }

  preload() {
    this.load.image("tiles", "assets/tilesets/rpg_tileset.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/mmo.json");

    for (let i = 1; i <= 9; i++) {
      this.load.spritesheet(`${i}_idle`, `assets/sprites/${i}_idle.png`, {
        frameWidth: 16,
        frameHeight: 24,
      });

      this.load.spritesheet(`${i}_walk`, `assets/sprites/${i}_walk.png`, {
        frameWidth: 16,
        frameHeight: 24,
      });
    }

    this.load.bitmapFont(
      "arcade",
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );
  }

  create() {
    this.initMap();
    this.inputs = this.input.keyboard.createCursorKeys();
    this.scene.launch("chat");
    this.sendingMessage = false;
    this.input.keyboard.on("keydown", (event: any) => {
      const chat: Chat = this.scene.get("chat") as any;

      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        this.sendingMessage = false;
        chat.messagePrompt.setText("Press enter to type your message");
      }

      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
        if (!this.sendingMessage) {
          this.sendingMessage = true;
          chat.messagePrompt.setText("");
        } else {
          if (chat.messagePrompt.text.length > 0) {
            this.sendMessage(chat.messagePrompt.text);
          }

          this.sendingMessage = false;
          chat.messagePrompt.setText("Press enter to type your message");
        }
      } else if (
        (this.sendingMessage && event.keyCode === 32) ||
        (event.keyCode >= 48 && event.keyCode < 90) ||
        event.keyCode === 190 ||
        event.keyCode === 90
      ) {
        chat.messagePrompt.setText(chat.messagePrompt.text + event.key);
      }
    });
  }

  sendMessage = (message: string) => {
    const packet = new Schema.ClientPacket();
    packet.setType(Schema.ClientPacketType.SEND_MESSAGE);
    packet.setMessage(new Schema.Message());
    packet.getMessage().setContent(message);
    this.server.send(packet.serializeBinary());
  };

  sendMovingPacket = (direction: any, isMoving: boolean) => {
    const packet = new Schema.ClientPacket();
    packet.setType(Schema.ClientPacketType.MOVEMENT_INPUT);
    packet.setMovementinput(new Schema.MovementInput());
    packet.getMovementinput().setIsmoving(isMoving);
    packet.getMovementinput().setDirection(direction);
    this.server.send(packet.serializeBinary());
  };

  handleCursors = () => {
    const player = players[this.me];
    if (!player) return;
    if (this.sendingMessage === true) {
      return;
    }
    if (this.inputs.up.isDown && !player.instance.getMoving().getUp()) {
      this.sendMovingPacket(Schema.Direction.UP, true);
      players[this.me].instance.getMoving().setUp(true);
    } else if (this.inputs.up.isUp && player.instance.getMoving().getUp()) {
      this.sendMovingPacket(Schema.Direction.UP, false);
      players[this.me].instance.getMoving().setUp(false);
    }

    if (this.inputs.down.isDown && !player.instance.getMoving().getDown()) {
      this.sendMovingPacket(Schema.Direction.DOWN, true);
      players[this.me].instance.getMoving().setDown(true);
    } else if (this.inputs.down.isUp && player.instance.getMoving().getDown()) {
      this.sendMovingPacket(Schema.Direction.DOWN, false);
      players[this.me].instance.getMoving().setDown(false);
    }

    if (this.inputs.left.isDown && !player.instance.getMoving().getLeft()) {
      this.sendMovingPacket(Schema.Direction.LEFT, true);
      players[this.me].instance.getMoving().setLeft(true);
    } else if (this.inputs.left.isUp && player.instance.getMoving().getLeft()) {
      this.sendMovingPacket(Schema.Direction.LEFT, false);
      players[this.me].instance.getMoving().setLeft(false);
    }

    if (this.inputs.right.isDown && !player.instance.getMoving().getRight()) {
      this.sendMovingPacket(Schema.Direction.RIGHT, true);
      players[this.me].instance.getMoving().setRight(true);
    } else if (
      this.inputs.right.isUp &&
      player.instance.getMoving().getRight()
    ) {
      this.sendMovingPacket(Schema.Direction.RIGHT, false);
      players[this.me].instance.getMoving().setRight(false);
    }
  };

  initMap() {
    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("rpg_tileset", "tiles");
    this.map.createLayer("Ground", tileset).setScale(4, 4);
    this.map.createLayer("Layer1", tileset).setScale(4, 4);
    this.map.createLayer("Layer2", tileset).setScale(4, 4);
  }

  initConnection() {
    this.server.addEventListener("message", this.handleMessage);
  }

  handleMessage = async (e: MessageEvent<any>) => {
    const packet = await decodeBinary<Schema.ServerPacket>(
      e.data,
      Schema.ServerPacket
    );

    switch (packet.getType()) {
      case Schema.ServerPacketType.INITIALIZE:
        this.me = packet.getId();
        break;
      case Schema.ServerPacketType.PLAYER_MOVEMENT:
        const temp = packet.toObject();

        if (temp.snapshot) {
          const state = {
            id: temp.snapshot.id,
            time: temp.snapshot.time,
            state: temp.snapshot.stateList as unknown as Entity[],
          };

          if (SI.snapshot) {
            SI.snapshot.add(state);
          }
        }
        break;
      case Schema.ServerPacketType.BROADCAST_MESSAGE:
        const chat: Chat = this.scene.get("chat") as any;
        chat.addMessage(packet.getMessage());
        break;
      case Schema.ServerPacketType.PLAYER_DISCONNECTED:
        players[packet.getId()].destroy();
        players[packet.getId()].label.destroy();
        delete players[packet.getId()];
        disconnected[packet.getId()] = true;
        break;
      default:
        break;
    }
  };

  serverReconciliation = () => {
    const player = players[this.me];

    if (!player) return;

    const serverSnapshot = SI.vault.get();
    const clientSnapshot = clientVault.get(serverSnapshot.time, true);

    if (serverSnapshot && clientSnapshot) {
      const serverPos = (serverSnapshot.state as any).find(
        (e: any) => Number(e.id) === this.me
      );

      const offsetX = (clientSnapshot.state as any)[0].x - serverPos.x;
      const offsetY = (clientSnapshot.state as any)[0].y - serverPos.y;

      const moving = player.instance.getMoving().toObject();

      const isMoving = moving.left || moving.right || moving.up || moving.down;

      const correction = isMoving ? 60 : 180;

      player.x -= offsetX / correction;
      player.y -= offsetY / correction;
    }
  };

  clientPrediction = () => {
    const player = players[this.me];

    if (!player) return;

    const moving = player.instance.getMoving().toObject();
    const speed = player.instance.getSpeed();
    if (moving.up) {
      player.setVelocityY(-speed);
      player.instance.setDirection(Schema.Direction.UP);
    }

    if (moving.down) {
      player.setVelocityY(speed);
      player.instance.setDirection(Schema.Direction.DOWN);
    }

    if (moving.left) {
      player.setVelocityX(-speed);
      player.instance.setDirection(Schema.Direction.LEFT);
    }

    if (moving.right) {
      player.setVelocityX(speed);
      player.instance.setDirection(Schema.Direction.RIGHT);
    }

    if (!moving.up && !moving.down) {
      player.setVelocityY(0);
    }

    if (!moving.left && !moving.right) {
      player.setVelocityX(0);
    }

    player.updateAnimations();

    player.setDepth(player.y);

    player.label.setDepth(Number(player.y));
    player.label.setX(Number(player.x) - player.label.width / 2);
    player.label.setY(Number(player.y) - 65);

    clientVault.add(
      SI.snapshot.create([{ id: this.me.toString(), x: player.x, y: player.y }])
    );
  };

  update = (time: number, delta: number): void => {
    this.handleCursors();
    this.clientPrediction();
    this.serverReconciliation();
    const snapshot = SI.calcInterpolation("x y");

    if (snapshot) {
      const { state } = snapshot;
      state.forEach((s) => {
        const { id, x, y, direction, moving, sprite } = s;
        if (players[Number(id)]) {
          if (this.me === Number(id)) return;
          players[Number(id)].x = Number(x);
          players[Number(id)].y = Number(y);
          players[Number(id)].instance.setDirection(direction as any);
          players[Number(id)].instance.getMoving().setDown(Boolean(moving));
          players[Number(id)].updateAnimations();
          players[Number(id)].setDepth(Number(y));
          players[Number(id)].label.setDepth(Number(y));
          players[Number(id)].label.setX(
            Number(x) - players[Number(id)].label.width / 2
          );
          players[Number(id)].label.setY(Number(y) - 65);
        } else {
          if (!disconnected[Number(id)]) {
            const player = new Player({
              id: Number(id),
              scene: this,
              x: Number(x),
              y: Number(y),
              sprite: Number(sprite),
            });

            players[Number(id)] = player;

            player.label = this.add
              .bitmapText(
                Number(x) - player.displayWidth / 2,
                Number(y) - 65,
                "arcade",
                `Player ${id}`,
                12
              )
              .setDepth(Number(y))
              .setDropShadow(0, 2, 0x000000, 0.2);

            if (Number(id) === this.me) {
              this.cameras.main.setRoundPixels(true);
              this.cameras.main.startFollow(player, true, 1, 1);
              this.cameras.main.setBounds(
                0,
                0,
                this.map.widthInPixels * 4,
                this.map.heightInPixels * 4
              );
            }
          }
        }
      });
    }
  };
}
