import { Entity } from "@geckos.io/snapshot-interpolation/lib/types";
import { Player } from "./player";
import { Scene } from "phaser";
import { Schema } from "@shared/protobuf";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import { decodeBinary } from "@shared/utils/serialization";

const players: { [key: number]: Player } = {};
const disconnected: any = {};
const SI: SnapshotInterpolation = new SnapshotInterpolation(100);

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
      }

      if (this.inputs.up.isDown) {
        this.sendMovingPacket(Schema.Direction.UP, true);
      }

      if (this.inputs.left.isDown) {
        this.sendMovingPacket(Schema.Direction.LEFT, true);
      }

      if (this.inputs.right.isDown) {
        this.sendMovingPacket(Schema.Direction.RIGHT, true);
      }
    });

    this.input.keyboard.addListener("keyup", () => {
      if (this.inputs.down.isUp) {
        this.sendMovingPacket(Schema.Direction.DOWN, false);
      }

      if (this.inputs.up.isUp) {
        this.sendMovingPacket(Schema.Direction.UP, false);
      }

      if (this.inputs.left.isUp) {
        this.sendMovingPacket(Schema.Direction.LEFT, false);
      }

      if (this.inputs.right.isUp) {
        this.sendMovingPacket(Schema.Direction.RIGHT, false);
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

  update = (time: number, delta: number): void => {
    const snapshot = SI.calcInterpolation("x y");

    if (snapshot) {
      const { state } = snapshot;
      state.forEach((s) => {
        const { id, x, y, direction, moving } = s;
        if (players[Number(id)]) {
          players[Number(id)].x = Number(x);
          players[Number(id)].y = Number(y);
          if (moving) {
            switch (direction) {
              case Schema.Direction.UP:
                if (
                  !players[Number(id)].anims.isPlaying ||
                  players[Number(id)].anims?.currentAnim?.key !== "up"
                ) {
                  players[Number(id)].anims.play("up");
                }
                break;
              case Schema.Direction.DOWN:
                if (
                  !players[Number(id)].anims.isPlaying ||
                  players[Number(id)].anims?.currentAnim?.key !== "down"
                ) {
                  players[Number(id)].anims.play("down");
                }
                break;
              case Schema.Direction.LEFT:
                if (
                  !players[Number(id)].anims.isPlaying ||
                  players[Number(id)].anims?.currentAnim?.key !== "left"
                ) {
                  players[Number(id)].anims.play("left");
                }
                break;
              case Schema.Direction.RIGHT:
                if (
                  !players[Number(id)].anims.isPlaying ||
                  players[Number(id)].anims?.currentAnim?.key !== "right"
                ) {
                  players[Number(id)].anims.play("right");
                }
                break;
              default:
                break;
            }
          } else {
            if (players[Number(id)].anims.isPlaying) {
              players[Number(id)].anims.stop();
            }
          }
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
