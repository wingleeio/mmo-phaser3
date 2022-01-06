"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
const player_1 = require("./player");
const phaser_1 = require("phaser");
const protobuf_1 = require("@shared/protobuf");
const snapshot_interpolation_1 = require("@geckos.io/snapshot-interpolation");
const serialization_1 = require("@shared/utils/serialization");
const players = {};
const disconnected = {};
const SI = new snapshot_interpolation_1.SnapshotInterpolation(100);
class World extends phaser_1.Scene {
    constructor() {
        super({ key: "World" });
        this.sendMovingPacket = (direction, isMoving) => {
            const packet = new protobuf_1.Schema.ClientPacket();
            packet.setType(protobuf_1.Schema.ClientPacketType.MOVEMENT_INPUT);
            packet.setMovementinput(new protobuf_1.Schema.MovementInput());
            packet.getMovementinput().setIsmoving(isMoving);
            packet.getMovementinput().setDirection(direction);
            this.server.send(packet.serializeBinary());
        };
        this.handleMessage = (e) => __awaiter(this, void 0, void 0, function* () {
            const packet = yield (0, serialization_1.decodeBinary)(e.data, protobuf_1.Schema.ServerPacket);
            switch (packet.getType()) {
                case protobuf_1.Schema.ServerPacketType.INITIALIZE:
                    this.me = packet.getId();
                    break;
                case protobuf_1.Schema.ServerPacketType.PLAYER_MOVEMENT:
                    const temp = packet.toObject();
                    if (temp.snapshot) {
                        const state = {
                            id: temp.snapshot.id,
                            time: temp.snapshot.time,
                            state: temp.snapshot.stateList,
                        };
                        if (SI.snapshot) {
                            SI.snapshot.add(state);
                        }
                    }
                    break;
                case protobuf_1.Schema.ServerPacketType.PLAYER_DISCONNECTED:
                    players[packet.getId()].destroy();
                    delete players[packet.getId()];
                    disconnected[packet.getId()] = true;
                    break;
                default:
                    break;
            }
        });
        this.update = (time, delta) => {
            const snapshot = SI.calcInterpolation("x y");
            if (snapshot) {
                const { state } = snapshot;
                state.forEach((s) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    const { id, x, y, direction, moving } = s;
                    if (players[Number(id)]) {
                        players[Number(id)].x = Number(x);
                        players[Number(id)].y = Number(y);
                        if (moving) {
                            switch (direction) {
                                case protobuf_1.Schema.Direction.UP:
                                    if (!players[Number(id)].anims.isPlaying ||
                                        ((_b = (_a = players[Number(id)].anims) === null || _a === void 0 ? void 0 : _a.currentAnim) === null || _b === void 0 ? void 0 : _b.key) !== "up") {
                                        players[Number(id)].anims.play("up");
                                    }
                                    break;
                                case protobuf_1.Schema.Direction.DOWN:
                                    if (!players[Number(id)].anims.isPlaying ||
                                        ((_d = (_c = players[Number(id)].anims) === null || _c === void 0 ? void 0 : _c.currentAnim) === null || _d === void 0 ? void 0 : _d.key) !== "down") {
                                        players[Number(id)].anims.play("down");
                                    }
                                    break;
                                case protobuf_1.Schema.Direction.LEFT:
                                    if (!players[Number(id)].anims.isPlaying ||
                                        ((_f = (_e = players[Number(id)].anims) === null || _e === void 0 ? void 0 : _e.currentAnim) === null || _f === void 0 ? void 0 : _f.key) !== "left") {
                                        players[Number(id)].anims.play("left");
                                    }
                                    break;
                                case protobuf_1.Schema.Direction.RIGHT:
                                    if (!players[Number(id)].anims.isPlaying ||
                                        ((_h = (_g = players[Number(id)].anims) === null || _g === void 0 ? void 0 : _g.currentAnim) === null || _h === void 0 ? void 0 : _h.key) !== "right") {
                                        players[Number(id)].anims.play("right");
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                        else {
                            if (players[Number(id)].anims.isPlaying) {
                                players[Number(id)].anims.stop();
                            }
                        }
                    }
                    else {
                        if (!disconnected[Number(id)]) {
                            const player = new player_1.Player({
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
                this.sendMovingPacket(protobuf_1.Schema.Direction.DOWN, true);
            }
            if (this.inputs.up.isDown) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.UP, true);
            }
            if (this.inputs.left.isDown) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.LEFT, true);
            }
            if (this.inputs.right.isDown) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.RIGHT, true);
            }
        });
        this.input.keyboard.addListener("keyup", () => {
            if (this.inputs.down.isUp) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.DOWN, false);
            }
            if (this.inputs.up.isUp) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.UP, false);
            }
            if (this.inputs.left.isUp) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.LEFT, false);
            }
            if (this.inputs.right.isUp) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.RIGHT, false);
            }
        });
    }
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
}
exports.World = World;
//# sourceMappingURL=world.js.map