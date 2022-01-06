import {
  SnapshotInterpolation,
  Vault,
} from "@geckos.io/snapshot-interpolation";

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

  constructor() {
    super({ key: "World" });
    this.server = new WebSocket("wss://mmo-phaser3.herokuapp.com/ws");
    // this.server = new WebSocket("ws://localhost:3000/ws");
    this.initConnection();
  }

  preload() {
    this.load.image("tiles", "assets/tilesets/atlas_16x.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/map1.json");
    this.load.spritesheet("1", "assets/sprites/1.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("2", "assets/sprites/2.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("3", "assets/sprites/3.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("4", "assets/sprites/4.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("5", "assets/sprites/5.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("6", "assets/sprites/6.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("7", "assets/sprites/7.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("8", "assets/sprites/8.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
  }

  create() {
    this.initMap();
    this.inputs = this.input.keyboard.createCursorKeys();

    this.input.keyboard.addListener("keydown", () => {
      if (this.inputs.down.isDown) {
        this.sendMovingPacket(Schema.Direction.DOWN, true);
        players[this.me].instance.getMoving().setDown(true);
      }

      if (this.inputs.up.isDown) {
        this.sendMovingPacket(Schema.Direction.UP, true);
        players[this.me].instance.getMoving().setUp(true);
      }

      if (this.inputs.left.isDown) {
        this.sendMovingPacket(Schema.Direction.LEFT, true);
        players[this.me].instance.getMoving().setLeft(true);
      }

      if (this.inputs.right.isDown) {
        this.sendMovingPacket(Schema.Direction.RIGHT, true);
        players[this.me].instance.getMoving().setRight(true);
      }
    });

    this.input.keyboard.addListener("keyup", () => {
      if (this.inputs.down.isUp) {
        this.sendMovingPacket(Schema.Direction.DOWN, false);
        players[this.me].instance.getMoving().setDown(false);
      }

      if (this.inputs.up.isUp) {
        this.sendMovingPacket(Schema.Direction.UP, false);
        players[this.me].instance.getMoving().setUp(false);
      }

      if (this.inputs.left.isUp) {
        this.sendMovingPacket(Schema.Direction.LEFT, false);
        players[this.me].instance.getMoving().setLeft(false);
      }

      if (this.inputs.right.isUp) {
        this.sendMovingPacket(Schema.Direction.RIGHT, false);
        players[this.me].instance.getMoving().setRight(false);
      }
    });
  }

  sendMovingPacket = (direction: any, isMoving: boolean) => {
    const packet = new Schema.ClientPacket();
    packet.setType(Schema.ClientPacketType.MOVEMENT_INPUT);
    packet.setMovementinput(new Schema.MovementInput());
    packet.getMovementinput().setIsmoving(isMoving);
    packet.getMovementinput().setDirection(direction);
    this.server.send(packet.serializeBinary());
  };

  initMap() {
    this.cameras.main.zoom = 4;
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("atlas_16x", "tiles");
    map.createLayer("Tile Layer 1", tileset);
    map.createLayer("Tile Layer 2", tileset);
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
      case Schema.ServerPacketType.PLAYER_DISCONNECTED:
        players[packet.getId()].destroy();
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

    clientVault.add(
      SI.snapshot.create([{ id: this.me.toString(), x: player.x, y: player.y }])
    );
  };

  update = (time: number, delta: number): void => {
    this.clientPrediction();
    this.serverReconciliation();
    const snapshot = SI.calcInterpolation("x y");

    if (snapshot) {
      const { state } = snapshot;
      state.forEach((s) => {
        const { id, x, y, direction, moving } = s;
        if (players[Number(id)]) {
          if (this.me === Number(id)) return;
          players[Number(id)].x = Number(x);
          players[Number(id)].y = Number(y);
          players[Number(id)].instance.setDirection(direction as any);
          players[Number(id)].instance.getMoving().setDown(Boolean(moving));
          players[Number(id)].updateAnimations();
        } else {
          if (!disconnected[Number(id)]) {
            const player = new Player({
              id: Number(id),
              scene: this,
              x: Number(x),
              y: Number(y),
              texture: "player",
              sprite: Math.floor(Math.random() * 7) + 1,
            });

            players[Number(id)] = player;

            if (Number(id) === this.me) {
              this.cameras.main.startFollow(player, true);
            }
          }
        }
      });
    }
  };
}
