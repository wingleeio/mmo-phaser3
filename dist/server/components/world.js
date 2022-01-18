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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
const schema_pb_1 = require("@shared/protobuf/schema_pb");
const player_1 = require("./player");
const protobuf_1 = require("@shared/protobuf");
const snapshot_interpolation_1 = require("@geckos.io/snapshot-interpolation");
const serialization_1 = require("@shared/utils/serialization");
const server_1 = require("../core/server");
const web3_1 = __importDefault(require("web3"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
let interval = 0;
let tick = 0;
const clients = {};
const players = {};
const addresses = {};
class World extends Phaser.Scene {
    constructor() {
        super({ key: "World" });
        this.web3 = new web3_1.default();
        this.handleConnection = (client) => {
            const id = interval;
            clients[id] = client;
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
        this.prisma = new client_1.PrismaClient();
    }
    preload() {
        this.load.tilemapTiledJSON("map", path_1.default.join(__dirname, "../assets/tilemaps/World.json"));
        this.load.image("rules", path_1.default.join(__dirname, "../assets/tilesets/rules.png"));
    }
    create() {
        server_1.io.on("connection", this.handleConnection);
        this.map = this.make.tilemap({ key: "map" });
        const rules = this.map.addTilesetImage("rules", "rules", 16, 16);
        const tilesets = [rules];
        this.collisionLayer = this.map
            .createLayer("collision", tilesets)
            .setScale(4, 4)
            .setAlpha(0)
            .setCollisionByExclusion([-1]);
        this.physics.add.existing(this.add.zone(0, 0, this.map.widthInPixels * 4, this.map.heightInPixels * 4));
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
            position.setFacing(player.facing);
            position.setMoving(player.instance.getMoving().getUp() ||
                player.instance.getMoving().getDown() ||
                player.instance.getMoving().getLeft() ||
                player.instance.getMoving().getRight());
            position.setName(player.instance.getName());
            packet.getSnapshot().addState(position);
        }
        this.broadcast(packet.serializeBinary());
    }
    handleMessage(id, e) {
        return __awaiter(this, void 0, void 0, function* () {
            const packet = yield (0, serialization_1.decodeBinary)(e.data, protobuf_1.Schema.ClientPacket);
            const newPacket = new protobuf_1.Schema.ServerPacket();
            switch (packet.getType()) {
                case protobuf_1.Schema.ClientPacketType.ATTACK_CLIENT:
                    newPacket.setType(protobuf_1.Schema.ServerPacketType.ATTACK_SERVER);
                    newPacket.setAttack(new protobuf_1.Schema.Attack());
                    newPacket.getAttack().setId(id);
                    newPacket.getAttack().setFacing(packet.getFacing());
                    this.broadcast(newPacket.serializeBinary());
                    break;
                case protobuf_1.Schema.ClientPacketType.MOVEMENT_INPUT:
                    this.handleMovementInput(id, packet);
                    break;
                case protobuf_1.Schema.ClientPacketType.SEND_MESSAGE:
                    newPacket.setType(protobuf_1.Schema.ServerPacketType.BROADCAST_MESSAGE);
                    newPacket.setMessage(packet.getMessage());
                    newPacket.getMessage().setId(id);
                    this.broadcast(newPacket.serializeBinary());
                    break;
                case protobuf_1.Schema.ClientPacketType.NONCE:
                    const address = packet.getAddress();
                    const isAddress = this.web3.utils.isAddress(address);
                    if (!isAddress)
                        return;
                    let user = yield this.prisma.user.findFirst({
                        where: { id: address },
                    });
                    if (!user) {
                        user = yield this.prisma.user.create({
                            data: {
                                id: address,
                                nonce: Math.floor(Math.random() * 1000000000),
                            },
                        });
                    }
                    else {
                        user = yield this.prisma.user.update({
                            where: {
                                id: address,
                            },
                            data: {
                                nonce: Math.floor(Math.random() * 1000000000),
                            },
                        });
                    }
                    newPacket.setType(protobuf_1.Schema.ServerPacketType.SERVER_NONCE);
                    newPacket.setNonce(user.nonce);
                    clients[id].send(newPacket.serializeBinary());
                    break;
                case protobuf_1.Schema.ClientPacketType.LOGIN:
                    const handleLogin = () => __awaiter(this, void 0, void 0, function* () {
                        const address = packet.getLogin().getAddress();
                        const signature = packet.getLogin().getSignature();
                        let user = yield this.prisma.user.findFirst({
                            where: { id: address },
                        });
                        if (!user)
                            return;
                        const signer = this.web3.eth.accounts.recover(`Logging into Legends of Ethereum with my one-time nonce: ${user.nonce}`, signature);
                        if (signer !== this.web3.utils.toChecksumAddress(address))
                            return;
                        addresses[id] = address;
                        if (!user.sprite || !user.name) {
                            newPacket.setType(protobuf_1.Schema.ServerPacketType.MISSING_DETAILS);
                            clients[id].send(newPacket.serializeBinary());
                        }
                        else {
                            players[id] = new player_1.Player({
                                id,
                                scene: this,
                                x: user.x,
                                y: user.y,
                                texture: "player",
                                sprite: user.sprite,
                                name: user.name,
                            });
                            players[id].setSize(16, 16).setOffset(5, 20);
                            this.physics.add.collider(players[id], this.collisionLayer);
                            newPacket.setType(protobuf_1.Schema.ServerPacketType.LOGIN_SUCCESS);
                            newPacket.setId(id);
                            clients[id].send(newPacket.serializeBinary());
                        }
                    });
                    yield handleLogin();
                    break;
                case protobuf_1.Schema.ClientPacketType.UPDATE_ACCOUNT:
                    const handleUpdate = () => __awaiter(this, void 0, void 0, function* () {
                        const sprite = packet.getUpdate().getSprite();
                        const name = packet.getUpdate().getName();
                        let user = yield this.prisma.user.findFirst({ where: { name } });
                        if (user)
                            return;
                        user = yield this.prisma.user.update({
                            where: {
                                id: addresses[id],
                            },
                            data: {
                                sprite,
                                name,
                            },
                        });
                        players[id] = new player_1.Player({
                            id,
                            scene: this,
                            x: user.x,
                            y: user.y,
                            texture: "player",
                            sprite: user.sprite,
                            name: user.name,
                        });
                        players[id].setSize(16, 16).setOffset(5, 20);
                        this.physics.add.collider(players[id], this.collisionLayer);
                        newPacket.setType(protobuf_1.Schema.ServerPacketType.LOGIN_SUCCESS);
                        newPacket.setId(id);
                        clients[id].send(newPacket.serializeBinary());
                    });
                    yield handleUpdate();
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
        players[id].facing = packet.getMovementinput().getFacing();
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