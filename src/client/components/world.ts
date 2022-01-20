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
import { server } from "../utls/server";
import { Direction } from "@shared/protobuf/schema_pb";

const players: { [key: number]: Player } = {};
const disconnected: any = {};
const SI: SnapshotInterpolation = new SnapshotInterpolation(15);
const clientVault = new Vault();
export class World extends Scene {
  server: WebSocket;
  me: number;
  inputs: any;

  map: Phaser.Tilemaps.Tilemap;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  sendingMessage: boolean;
  animatedTiles: any;

  constructor() {
    super({ key: "World" });
    this.server = server;
    this.initConnection();
  }

  preload = () => {
    this.load.audio("bgMusic", "assets/music/Track_6.wav");
    this.load.scenePlugin(
      "AnimatedTiles",
      "assets/plugins/AnimatedTiles.js",
      "animatedTiles",
      "animatedTiles"
    );
  };

  init = ({ id }: { id: number }) => {
    this.me = id;
  };

  create() {
    this.sound.play("bgMusic", { loop: true });
    this.initMap();
    this.input.keyboard.addKeys("W,A,S,D");

    this.inputs = this.input.keyboard.addKeys({
      up: "W",
      left: "A",
      down: "S",
      right: "D",
    });

    this.scene.launch("chat");
    this.sendingMessage = false;

    this.input.on("pointermove", (pointer) => {
      const player = players[this.me];
      player.facing =
        Phaser.Math.RAD_TO_DEG *
        Phaser.Math.Angle.Between(
          players[this.me].x,
          players[this.me].y,
          pointer.worldX,
          pointer.worldY
        );
    });

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

      if (
        event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE &&
        !this.sendingMessage
      ) {
        players[this.me].attack(() => {
          const packet = new Schema.ClientPacket();
          packet.setType(Schema.ClientPacketType.ATTACK_CLIENT);
          packet.setFacing(players[this.me].facing);
          this.server.send(packet.serializeBinary());
        });
      }

      this.events.on("postupdate", () => {
        const player = players[this.me];
        if (!player) return;
        player.label.setPosition(player.x, player.y - 80);
        player.message.setPosition(player.x, player.y - 160);
        player.messageContent.setPosition(player.x, player.y - 163);
        player.test.setPosition(player.x, player.y - 100);
      });
    });
  }

  sendMessage = (message: string) => {
    const packet = new Schema.ClientPacket();
    packet.setType(Schema.ClientPacketType.SEND_MESSAGE);
    packet.setMessage(new Schema.Message());
    packet.getMessage().setContent(message);
    this.server.send(packet.serializeBinary());
  };

  sendMovingPacket = (direction: any, isMoving: boolean, facing: number) => {
    const packet = new Schema.ClientPacket();
    packet.setType(Schema.ClientPacketType.MOVEMENT_INPUT);
    packet.setMovementinput(new Schema.MovementInput());
    packet.getMovementinput().setIsmoving(isMoving);
    packet.getMovementinput().setDirection(direction);
    packet.getMovementinput().setFacing(facing);
    this.server.send(packet.serializeBinary());
  };

  handleCursors = () => {
    const player = players[this.me];
    if (!player) return;
    if (this.sendingMessage === true) {
      return;
    }
    if (this.inputs.up.isDown && !player.instance.getMoving().getUp()) {
      this.sendMovingPacket(Schema.Direction.UP, true, player.facing);
      players[this.me].instance.getMoving().setUp(true);
    } else if (this.inputs.up.isUp && player.instance.getMoving().getUp()) {
      this.sendMovingPacket(Schema.Direction.UP, false, player.facing);
      players[this.me].instance.getMoving().setUp(false);
    }

    if (this.inputs.down.isDown && !player.instance.getMoving().getDown()) {
      this.sendMovingPacket(Schema.Direction.DOWN, true, player.facing);
      players[this.me].instance.getMoving().setDown(true);
    } else if (this.inputs.down.isUp && player.instance.getMoving().getDown()) {
      this.sendMovingPacket(Schema.Direction.DOWN, false, player.facing);
      players[this.me].instance.getMoving().setDown(false);
    }

    if (this.inputs.left.isDown && !player.instance.getMoving().getLeft()) {
      this.sendMovingPacket(Schema.Direction.LEFT, true, player.facing);
      players[this.me].instance.getMoving().setLeft(true);
    } else if (this.inputs.left.isUp && player.instance.getMoving().getLeft()) {
      this.sendMovingPacket(Schema.Direction.LEFT, false, player.facing);
      players[this.me].instance.getMoving().setLeft(false);
    }

    if (this.inputs.right.isDown && !player.instance.getMoving().getRight()) {
      this.sendMovingPacket(Schema.Direction.RIGHT, true, player.facing);
      players[this.me].instance.getMoving().setRight(true);
    } else if (
      this.inputs.right.isUp &&
      player.instance.getMoving().getRight()
    ) {
      this.sendMovingPacket(Schema.Direction.RIGHT, false, player.facing);
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
    this.map.createLayer("objects_upper", tilesets).setScale(4, 4).setDepth(3);
    this.collisionLayer = this.map
      .createLayer("collision", tilesets)
      .setScale(4, 4)
      .setAlpha(0)
      .setCollisionByExclusion([-1]);

    this.physics.add.existing(
      this.add.zone(
        0,
        0,
        this.map.widthInPixels * 4,
        this.map.heightInPixels * 4
      )
    );

    this.animatedTiles.init(this.map);
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
        packet.getMessage().setName(player.instance.getName());
        chat.addMessage(player, packet.getMessage());
        player.sentMessage(packet.getMessage().getContent());
        break;
      case Schema.ServerPacketType.PLAYER_DISCONNECTED:
        players[packet.getId()].destroy();
        players[packet.getId()].label.destroy();
        delete players[packet.getId()];
        disconnected[packet.getId()] = true;
        break;

      case Schema.ServerPacketType.ATTACK_SERVER:
        players[packet.getAttack().getId()].facing = packet
          .getAttack()
          .getFacing();
        players[packet.getAttack().getId()].attack();
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
      player.instance.setDirection(Direction.UP);
    }

    if (moving.down) {
      player.setVelocityY(speed);
      player.instance.setDirection(Direction.DOWN);
    }

    if (moving.left) {
      player.setVelocityX(-speed);
      player.instance.setDirection(Direction.LEFT);
    }

    if (moving.right) {
      player.setVelocityX(speed);
      player.instance.setDirection(Direction.RIGHT);
    }

    if (!moving.up && !moving.down) {
      player.setVelocityY(0);
    }

    if (!moving.left && !moving.right) {
      player.setVelocityX(0);
    }

    player.updateAnimations();

    clientVault.add(
      SI.snapshot.create([
        {
          id: this.me.toString(),
          x: player.x,
          y: player.y,
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
        const { id, x, y, moving, sprite, name, direction } = s;
        if (players[Number(id)]) {
          if (this.me === Number(id)) return;
          players[Number(id)].x = Number(x);
          players[Number(id)].y = Number(y);
          players[Number(id)].instance.setDirection(direction as any);
          players[Number(id)].instance.getMoving().setDown(Boolean(moving));
          players[Number(id)].label.setPosition(Number(x), Number(y) - 80);
          players[Number(id)].message.setPosition(Number(x), Number(y) - 160);
          players[Number(id)].messageContent.setPosition(
            Number(x),
            Number(y) - 163
          );
          players[Number(id)].updateAnimations();
        } else {
          if (!disconnected[Number(id)]) {
            const player = new Player({
              id: Number(id),
              scene: this,
              x: Number(x),
              y: Number(y),
              sprite: Number(sprite),
              name: name as string,
            });

            this.physics.add.collider(player, this.collisionLayer);

            players[Number(id)] = player;

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
