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
const schema_pb_1 = require("@shared/protobuf/schema_pb");
const player_1 = require("./player");
const protobuf_1 = require("@shared/protobuf");
const snapshot_interpolation_1 = require("@geckos.io/snapshot-interpolation");
const serialization_1 = require("@shared/utils/serialization");
const server_1 = require("../core/server");
let interval = 0;
let tick = 0;
const clients = {};
const players = {};
class World extends Phaser.Scene {
    constructor() {
        super({ key: "World" });
        this.handleConnection = (client) => {
            const id = interval;
            clients[id] = client;
            players[id] = new player_1.Player({
                id,
                scene: this,
                x: 3487,
                y: 1812,
                texture: "player",
                sprite: Math.floor(Math.random() * 7) + 1,
            });
            console.log(`Client ${id} connected`);
            const packet = new protobuf_1.Schema.ServerPacket();
            packet.setType(protobuf_1.Schema.ServerPacketType.INITIALIZE);
            packet.setId(id);
            client.send(packet.serializeBinary());
            client.addEventListener("message", (e) => this.handleMessage(id, e));
            client.addEventListener("close", () => this.handleClose(id));
            interval++;
        };
        this.SI = new snapshot_interpolation_1.SnapshotInterpolation();
    }
    create() {
        server_1.io.on("connection", this.handleConnection);
    }
    update(time, delta) {
        tick++;
        for (const [id, player] of Object.entries(players)) {
            if (player.instance.getMoving().getUp()) {
                player.body.velocity.y = -player.instance.getSpeed();
                player.instance.setDirection(protobuf_1.Schema.Direction.UP);
            }
            if (player.instance.getMoving().getDown()) {
                player.body.velocity.y = player.instance.getSpeed();
                player.instance.setDirection(protobuf_1.Schema.Direction.DOWN);
            }
            if (player.instance.getMoving().getLeft()) {
                player.body.velocity.x = -player.instance.getSpeed();
                player.instance.setDirection(protobuf_1.Schema.Direction.LEFT);
            }
            if (player.instance.getMoving().getRight()) {
                player.body.velocity.x = player.instance.getSpeed();
                player.instance.setDirection(protobuf_1.Schema.Direction.RIGHT);
            }
            if (!player.instance.getMoving().getUp() &&
                !player.instance.getMoving().getDown()) {
                player.body.velocity.y = 0;
            }
            if (!player.instance.getMoving().getLeft() &&
                !player.instance.getMoving().getRight()) {
                player.body.velocity.x = 0;
            }
        }
        if (tick % 4 === 0) {
            this.broadcastPlayerMovement();
        }
    }
    broadcastPlayerMovement() {
        const snapshot = this.SI.snapshot.create([]);
        const packet = new protobuf_1.Schema.ServerPacket();
        packet.setType(protobuf_1.Schema.ServerPacketType.PLAYER_MOVEMENT);
        packet.setSnapshot(new protobuf_1.Schema.Snapshot());
        packet.getSnapshot().setId(snapshot.id);
        packet.getSnapshot().setTime(snapshot.time);
        for (const [id, player] of Object.entries(players)) {
            const position = new protobuf_1.Schema.Position();
            position.setId(Number(id));
            position.setX(player.x);
            position.setY(player.y);
            position.setDirection(player.instance.getDirection());
            position.setSprite(player.instance.getSprite());
            position.setMoving(player.instance.getMoving().getUp() ||
                player.instance.getMoving().getDown() ||
                player.instance.getMoving().getLeft() ||
                player.instance.getMoving().getRight());
            packet.getSnapshot().addState(position);
        }
        this.broadcast(packet.serializeBinary());
    }
    handleMessage(id, e) {
        return __awaiter(this, void 0, void 0, function* () {
            const packet = yield (0, serialization_1.decodeBinary)(e.data, protobuf_1.Schema.ClientPacket);
            switch (packet.getType()) {
                case protobuf_1.Schema.ClientPacketType.MOVEMENT_INPUT:
                    this.handleMovementInput(id, packet);
                    break;
                case protobuf_1.Schema.ClientPacketType.SEND_MESSAGE:
                    const newPacket = new protobuf_1.Schema.ServerPacket();
                    newPacket.setType(protobuf_1.Schema.ServerPacketType.BROADCAST_MESSAGE);
                    newPacket.setMessage(packet.getMessage());
                    newPacket.getMessage().setId(id);
                    this.broadcast(newPacket.serializeBinary());
                    break;
                default:
                    break;
            }
        });
    }
    handleClose(id) {
        return __awaiter(this, void 0, void 0, function* () {
            {
                console.log(`Client ${id} disconnected.`);
                delete clients[id];
                delete players[id];
                const packet = new protobuf_1.Schema.ServerPacket();
                packet.setType(protobuf_1.Schema.ServerPacketType.PLAYER_DISCONNECTED);
                packet.setId(id);
                this.broadcast(packet.serializeBinary());
            }
        });
    }
    handleMovementInput(id, packet) {
        switch (packet.getMovementinput().getDirection()) {
            case protobuf_1.Schema.Direction.UP:
                players[id].instance.setDirection(schema_pb_1.Direction.UP);
                players[id].instance
                    .getMoving()
                    .setUp(packet.getMovementinput().getIsmoving());
                break;
            case protobuf_1.Schema.Direction.DOWN:
                players[id].instance.setDirection(schema_pb_1.Direction.DOWN);
                players[id].instance
                    .getMoving()
                    .setDown(packet.getMovementinput().getIsmoving());
                break;
            case protobuf_1.Schema.Direction.LEFT:
                players[id].instance.setDirection(schema_pb_1.Direction.LEFT);
                players[id].instance
                    .getMoving()
                    .setLeft(packet.getMovementinput().getIsmoving());
                break;
            case protobuf_1.Schema.Direction.RIGHT:
                players[id].instance.setDirection(schema_pb_1.Direction.RIGHT);
                players[id].instance
                    .getMoving()
                    .setRight(packet.getMovementinput().getIsmoving());
                break;
            default:
                break;
        }
    }
    broadcast(message) {
        Object.keys(clients).map((key) => {
            clients[Number(key)].send(message);
        });
    }
}
exports.World = World;
//# sourceMappingURL=world.js.map