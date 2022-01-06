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
const snapshot_interpolation_1 = require("@geckos.io/snapshot-interpolation");
const player_1 = require("./player");
const phaser_1 = require("phaser");
const protobuf_1 = require("@shared/protobuf");
const serialization_1 = require("@shared/utils/serialization");
const players = {};
const disconnected = {};
const SI = new snapshot_interpolation_1.SnapshotInterpolation(15);
const clientVault = new snapshot_interpolation_1.Vault();
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
        this.serverReconciliation = () => {
            const player = players[this.me];
            if (!player)
                return;
            const serverSnapshot = SI.vault.get();
            const clientSnapshot = clientVault.get(serverSnapshot.time, true);
            if (serverSnapshot && clientSnapshot) {
                const serverPos = serverSnapshot.state.find((e) => Number(e.id) === this.me);
                const offsetX = clientSnapshot.state[0].x - serverPos.x;
                const offsetY = clientSnapshot.state[0].y - serverPos.y;
                const moving = player.instance.getMoving().toObject();
                const isMoving = moving.left || moving.right || moving.up || moving.down;
                const correction = isMoving ? 60 : 180;
                player.x -= offsetX / correction;
                player.y -= offsetY / correction;
            }
        };
        this.clientPrediction = () => {
            const player = players[this.me];
            if (!player)
                return;
            const moving = player.instance.getMoving().toObject();
            const speed = player.instance.getSpeed();
            if (moving.up) {
                player.setVelocityY(-speed);
                player.instance.setDirection(protobuf_1.Schema.Direction.UP);
            }
            if (moving.down) {
                player.setVelocityY(speed);
                player.instance.setDirection(protobuf_1.Schema.Direction.DOWN);
            }
            if (moving.left) {
                player.setVelocityX(-speed);
                player.instance.setDirection(protobuf_1.Schema.Direction.LEFT);
            }
            if (moving.right) {
                player.setVelocityX(speed);
                player.instance.setDirection(protobuf_1.Schema.Direction.RIGHT);
            }
            if (!moving.up && !moving.down) {
                player.setVelocityY(0);
            }
            if (!moving.left && !moving.right) {
                player.setVelocityX(0);
            }
            player.updateAnimations();
            clientVault.add(SI.snapshot.create([{ id: this.me.toString(), x: player.x, y: player.y }]));
        };
        this.update = (time, delta) => {
            this.clientPrediction();
            this.serverReconciliation();
            const snapshot = SI.calcInterpolation("x y");
            if (snapshot) {
                const { state } = snapshot;
                state.forEach((s) => {
                    const { id, x, y, direction, moving } = s;
                    if (players[Number(id)]) {
                        if (this.me === Number(id))
                            return;
                        players[Number(id)].x = Number(x);
                        players[Number(id)].y = Number(y);
                        players[Number(id)].instance.setDirection(direction);
                        players[Number(id)].instance.getMoving().setDown(Boolean(moving));
                        players[Number(id)].updateAnimations();
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
        this.load.image("tiles", "assets/tilesets/rpg_tileset.png");
        this.load.tilemapTiledJSON("map", "assets/tilemaps/mmo.json");
        this.load.spritesheet("1", "assets/sprites/spritesheet.png", {
            frameWidth: 16,
            frameHeight: 24,
        });
    }
    create() {
        this.initMap();
        this.inputs = this.input.keyboard.createCursorKeys();
        this.input.keyboard.addListener("keydown", () => {
            if (this.inputs.down.isDown) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.DOWN, true);
                players[this.me].instance.getMoving().setDown(true);
            }
            if (this.inputs.up.isDown) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.UP, true);
                players[this.me].instance.getMoving().setUp(true);
            }
            if (this.inputs.left.isDown) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.LEFT, true);
                players[this.me].instance.getMoving().setLeft(true);
            }
            if (this.inputs.right.isDown) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.RIGHT, true);
                players[this.me].instance.getMoving().setRight(true);
            }
        });
        this.input.keyboard.addListener("keyup", () => {
            if (this.inputs.down.isUp) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.DOWN, false);
                players[this.me].instance.getMoving().setDown(false);
            }
            if (this.inputs.up.isUp) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.UP, false);
                players[this.me].instance.getMoving().setUp(false);
            }
            if (this.inputs.left.isUp) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.LEFT, false);
                players[this.me].instance.getMoving().setLeft(false);
            }
            if (this.inputs.right.isUp) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.RIGHT, false);
                players[this.me].instance.getMoving().setRight(false);
            }
        });
    }
    initMap() {
        this.cameras.main.zoom = 4;
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("rpg_tileset", "tiles");
        map.createLayer("Ground", tileset);
        map.createLayer("Layer1", tileset);
        map.createLayer("Layer2", tileset);
    }
    initConnection() {
        this.server.addEventListener("message", this.handleMessage);
    }
}
exports.World = World;
//# sourceMappingURL=world.js.map