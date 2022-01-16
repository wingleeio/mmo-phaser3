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
import { StyleConstants } from "../utls/constants";
import { NinePatch } from "phaser3-rex-plugins/templates/ui/ui-components";

const players: { [key: number]: Player } = {};
const disconnected: any = {};
const SI: SnapshotInterpolation = new SnapshotInterpolation(15);
const clientVault = new Vault();
export class World extends Scene {
  server: WebSocket;
  me: number;
  inputs: Phaser.Types.Input.Keyboard.CursorKeys;

  map: Phaser.Tilemaps.Tilemap;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  sendingMessage: boolean;

  constructor() {
    super({ key: "World" });
    this.server = new WebSocket("wss://mmo-phaser3.herokuapp.com/ws");
    // this.server = new WebSocket("ws://localhost:3000/ws");
    this.initConnection();
  }

  preload() {
    this.load.image("bubble", "assets/gui/bubble4x.png");
    this.load.image("rules", "assets/tilesets/rules.png");
    this.load.image("terrain", "assets/tilesets/terrain.png");
    this.load.image("outside", "assets/tilesets/outside.png");
    this.load.image("water", "assets/tilesets/water.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/World.json");

    for (let i = 1; i <= 8; i++) {
      this.load.spritesheet(`${i}`, `assets/sprites/${i}.png`, {
        frameWidth: 26,
        frameHeight: 36,
      });
    }
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
        event.keyCode === 32 ||
        (event.keyCode >= 48 && event.keyCode < 90) ||
        event.keyCode === 190 ||
        event.keyCode === 90
      ) {
        if (this.sendingMessage) {
          chat.messagePrompt.setText(chat.messagePrompt.text + event.key);
        }
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
        if (this.sendingMessage) {
          chat.messagePrompt.setText(
            chat.messagePrompt.text.substring(
              0,
              chat.messagePrompt.text.length - 1
            )
          );
        }
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

    const rules = this.map.addTilesetImage("rules", "rules", 16, 16);
    const terrain = this.map.addTilesetImage("Terrain", "terrain", 16, 16);
    const outside = this.map.addTilesetImage("Outdoors", "outside", 16, 16);
    const water = this.map.addTilesetImage("Water", "water", 16, 16);
    const tilesets = [rules, terrain, outside, water];
    this.map.createLayer("ground", tilesets).setScale(4, 4);
    this.map.createLayer("ground_decor", tilesets).setScale(4, 4);
    this.map.createLayer("ground_decor_2", tilesets).setScale(4, 4);
    this.map.createLayer("objects", tilesets).setScale(4, 4);
    this.map
      .createLayer("objects_upper", tilesets)
      .setScale(4, 4)
      .setDepth(10000000);
    this.collisionLayer = this.map
      .createLayer("collision", tilesets)
      .setScale(4, 4)
      .setAlpha(0)
      .setCollisionByProperty({ collides: true });

    this.physics.add.existing(
      this.add.zone(
        0,
        0,
        this.map.widthInPixels * 4,
        this.map.heightInPixels * 4
      )
    );
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
        const player = players[packet.getMessage().getId()];
        chat.addMessage(packet.getMessage());
        player.sentMessage(packet.getMessage().getContent());
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

      player.container.x -= offsetX / correction;
      player.container.y -= offsetY / correction;
    }
  };

  clientPrediction = () => {
    const player = players[this.me];
    if (!player) return;

    const moving = player.instance.getMoving().toObject();
    const speed = player.instance.getSpeed();
    if (moving.up) {
      // @ts-ignore
      player.container.body.setVelocityY(-speed);
      player.instance.setDirection(Schema.Direction.UP);
    }

    if (moving.down) {
      // @ts-ignore
      player.container.body.setVelocityY(speed);
      player.instance.setDirection(Schema.Direction.DOWN);
    }

    if (moving.left) {
      // @ts-ignore
      player.container.body.setVelocityX(-speed);
      player.instance.setDirection(Schema.Direction.LEFT);
    }

    if (moving.right) {
      // @ts-ignore
      player.container.body.setVelocityX(speed);
      player.instance.setDirection(Schema.Direction.RIGHT);
    }

    if (!moving.up && !moving.down) {
      // @ts-ignore
      player.container.body.setVelocityY(0);
    }

    if (!moving.left && !moving.right) {
      // @ts-ignore
      player.container.body.setVelocityX(0);
    }

    player.updateAnimations();

    clientVault.add(
      SI.snapshot.create([
        {
          id: this.me.toString(),
          x: player.container.x,
          y: player.container.y,
        },
      ])
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
          players[Number(id)].container.x = Number(x);
          players[Number(id)].container.y = Number(y);
          players[Number(id)].instance.setDirection(direction as any);
          players[Number(id)].instance.getMoving().setDown(Boolean(moving));
          players[Number(id)].updateAnimations();
        } else {
          if (!disconnected[Number(id)]) {
            const player = new Player({
              id: Number(id),
              scene: this,
              x: 0,
              y: 0,
              sprite: Number(sprite),
            });

            player.label = this.add
              .text(
                player.x,
                player.y - 80,
                `Player ${id}`,
                StyleConstants.TEXT_STYLE
              )
              .setOrigin(0.5, 0.5)
              .setShadow(1, 1, "black")
              .setAlpha(0.8);

            player.messageContent = this.add
              .text(
                player.x,
                player.y - 160,
                `Player ${id}`,
                StyleConstants.TEXT_STYLE
              )
              .setOrigin(0.5, 0.5);

            const gridSize = 64;
            player.message = this.add.existing(
              new NinePatch(
                this,
                0,
                player.y - 160,
                player.messageContent.width + 100,
                100,
                "bubble",
                [gridSize, gridSize, gridSize, gridSize, gridSize],
                [gridSize, gridSize, gridSize, gridSize, gridSize]
              )
            );

            player.message.setAlpha(0);
            player.messageContent.setAlpha(0).setColor("black");

            player.container = this.add.container(Number(x), Number(y), [
              player,
              player.label,
              player.message,
              player.messageContent,
            ]);

            this.physics.world.enable(player.container);
            players[Number(id)] = player;

            this.physics.add.collider(players[Number(id)], this.collisionLayer);
            if (Number(id) === this.me) {
              this.cameras.main.setRoundPixels(true);
              this.cameras.main.startFollow(player.container, true, 1, 1);
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
