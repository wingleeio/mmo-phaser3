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
const constants_1 = require("../utls/constants");
const ui_components_1 = require("phaser3-rex-plugins/templates/ui/ui-components");
const server_1 = require("../utls/server");
const players = {};
const disconnected = {};
const SI = new snapshot_interpolation_1.SnapshotInterpolation(15);
const clientVault = new snapshot_interpolation_1.Vault();
class World extends phaser_1.Scene {
    constructor() {
        super({ key: "World" });
        this.init = ({ id }) => {
            this.me = id;
        };
        this.sendMessage = (message) => {
            const packet = new protobuf_1.Schema.ClientPacket();
            packet.setType(protobuf_1.Schema.ClientPacketType.SEND_MESSAGE);
            packet.setMessage(new protobuf_1.Schema.Message());
            packet.getMessage().setContent(message);
            this.server.send(packet.serializeBinary());
        };
        this.sendMovingPacket = (direction, isMoving, facing) => {
            const packet = new protobuf_1.Schema.ClientPacket();
            packet.setType(protobuf_1.Schema.ClientPacketType.MOVEMENT_INPUT);
            packet.setMovementinput(new protobuf_1.Schema.MovementInput());
            packet.getMovementinput().setIsmoving(isMoving);
            packet.getMovementinput().setDirection(direction);
            packet.getMovementinput().setFacing(facing);
            this.server.send(packet.serializeBinary());
        };
        this.handleCursors = () => {
            const player = players[this.me];
            if (!player)
                return;
            if (this.sendingMessage === true) {
                return;
            }
            if (this.inputs.up.isDown && !player.instance.getMoving().getUp()) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.UP, true, player.facing);
                players[this.me].instance.getMoving().setUp(true);
            }
            else if (this.inputs.up.isUp && player.instance.getMoving().getUp()) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.UP, false, player.facing);
                players[this.me].instance.getMoving().setUp(false);
            }
            if (this.inputs.down.isDown && !player.instance.getMoving().getDown()) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.DOWN, true, player.facing);
                players[this.me].instance.getMoving().setDown(true);
            }
            else if (this.inputs.down.isUp && player.instance.getMoving().getDown()) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.DOWN, false, player.facing);
                players[this.me].instance.getMoving().setDown(false);
            }
            if (this.inputs.left.isDown && !player.instance.getMoving().getLeft()) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.LEFT, true, player.facing);
                players[this.me].instance.getMoving().setLeft(true);
            }
            else if (this.inputs.left.isUp && player.instance.getMoving().getLeft()) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.LEFT, false, player.facing);
                players[this.me].instance.getMoving().setLeft(false);
            }
            if (this.inputs.right.isDown && !player.instance.getMoving().getRight()) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.RIGHT, true, player.facing);
                players[this.me].instance.getMoving().setRight(true);
            }
            else if (this.inputs.right.isUp &&
                player.instance.getMoving().getRight()) {
                this.sendMovingPacket(protobuf_1.Schema.Direction.RIGHT, false, player.facing);
                players[this.me].instance.getMoving().setRight(false);
            }
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
                case protobuf_1.Schema.ServerPacketType.BROADCAST_MESSAGE:
                    const chat = this.scene.get("chat");
                    const player = players[packet.getMessage().getId()];
                    packet.getMessage().setName(player.instance.getName());
                    chat.addMessage(player, packet.getMessage());
                    player.sentMessage(packet.getMessage().getContent());
                    break;
                case protobuf_1.Schema.ServerPacketType.PLAYER_DISCONNECTED:
                    players[packet.getId()].destroy();
                    players[packet.getId()].label.destroy();
                    delete players[packet.getId()];
                    disconnected[packet.getId()] = true;
                    break;
                case protobuf_1.Schema.ServerPacketType.ATTACK_SERVER:
                    players[packet.getAttack().getId()].facing = packet
                        .getAttack()
                        .getFacing();
                    players[packet.getAttack().getId()].attack();
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
                player.label.setPosition(player.x, player.y - 80);
                player.message.setPosition(player.x, player.y - 160);
                player.messageContent.setPosition(player.x, player.y - 163);
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
                player.label.body.velocity.y = -speed;
                player.message.body.velocity.y = -speed;
                player.messageContent.body.velocity.y = -speed;
            }
            if (moving.down) {
                player.setVelocityY(speed);
                player.label.body.velocity.y = speed;
                player.message.body.velocity.y = speed;
                player.messageContent.body.velocity.y = speed;
            }
            if (moving.left) {
                player.setVelocityX(-speed);
                player.label.body.velocity.x = -speed;
                player.message.body.velocity.x = -speed;
                player.messageContent.body.velocity.x = -speed;
            }
            if (moving.right) {
                player.setVelocityX(speed);
                player.label.body.velocity.x = speed;
                player.message.body.velocity.x = speed;
                player.messageContent.body.velocity.x = speed;
            }
            if (!moving.up && !moving.down) {
                player.setVelocityY(0);
                player.message.body.velocity.y = 0;
                player.messageContent.body.velocity.y = 0;
                player.label.body.velocity.y = 0;
            }
            if (!moving.left && !moving.right) {
                player.setVelocityX(0);
                player.message.body.velocity.x = 0;
                player.messageContent.body.velocity.x = 0;
                player.label.body.velocity.x = 0;
            }
            if (moving.left || moving.right || moving.up || moving.down) {
                if (player.facing >= -45 && player.facing <= 45) {
                    player.instance.setDirection(protobuf_1.Schema.Direction.RIGHT);
                }
                if (player.facing <= -45 && player.facing >= -135) {
                    player.instance.setDirection(protobuf_1.Schema.Direction.UP);
                }
                if ((player.facing <= -135 && player.facing >= -180) ||
                    (player.facing >= 135 && player.facing <= 180)) {
                    player.instance.setDirection(protobuf_1.Schema.Direction.LEFT);
                }
                if (player.facing <= 135 && player.facing >= 45) {
                    player.instance.setDirection(protobuf_1.Schema.Direction.DOWN);
                }
            }
            player.updateAnimations();
            clientVault.add(SI.snapshot.create([
                {
                    id: this.me.toString(),
                    x: player.x,
                    y: player.y,
                },
            ]));
        };
        this.update = (time, delta) => {
            this.handleCursors();
            this.clientPrediction();
            this.serverReconciliation();
            const snapshot = SI.calcInterpolation("x y");
            if (snapshot) {
                const { state } = snapshot;
                state.forEach((s) => {
                    const { id, x, y, moving, sprite, name, facing } = s;
                    if (players[Number(id)]) {
                        if (this.me === Number(id))
                            return;
                        players[Number(id)].x = Number(x);
                        players[Number(id)].y = Number(y);
                        players[Number(id)].instance.getMoving().setDown(Boolean(moving));
                        players[Number(id)].label.setPosition(Number(x), Number(y) - 80);
                        players[Number(id)].message.setPosition(Number(x), Number(y) - 160);
                        players[Number(id)].messageContent.setPosition(Number(x), Number(y) - 163);
                        const player = players[Number(id)];
                        player.facing = facing;
                        if (moving) {
                            if (player.facing >= -45 && player.facing <= 45) {
                                player.instance.setDirection(protobuf_1.Schema.Direction.RIGHT);
                            }
                            if (player.facing <= -45 && player.facing >= -135) {
                                player.instance.setDirection(protobuf_1.Schema.Direction.UP);
                            }
                            if ((player.facing <= -135 && player.facing >= -180) ||
                                (player.facing >= 135 && player.facing <= 180)) {
                                player.instance.setDirection(protobuf_1.Schema.Direction.LEFT);
                            }
                            if (player.facing <= 135 && player.facing >= 45) {
                                player.instance.setDirection(protobuf_1.Schema.Direction.DOWN);
                            }
                        }
                        players[Number(id)].updateAnimations();
                    }
                    else {
                        if (!disconnected[Number(id)]) {
                            const player = new player_1.Player({
                                id: Number(id),
                                scene: this,
                                x: Number(x),
                                y: Number(y),
                                sprite: Number(sprite),
                                name: name,
                            });
                            player.label = this.add
                                .text(Number(x), Number(y) - 80, name, constants_1.StyleConstants.TEXT_STYLE)
                                .setOrigin(0.5, 0.5)
                                .setShadow(1, 1, "black")
                                .setAlpha(0.8)
                                .setDepth(3);
                            player.messageContent = this.add
                                .text(Number(x), Number(y) - 163, `Player ${id}`, constants_1.StyleConstants.TEXT_STYLE)
                                .setOrigin(0.5, 0.5)
                                .setDepth(4);
                            player.message = this.add
                                .existing(new ui_components_1.NinePatch(this, Number(x), Number(y) - 160, player.messageContent.width + 100, 100, "bubble", [36, 36, 48, 36, 36], [36, 36, 48, 36, 36]))
                                .setDepth(3);
                            player.message.setAlpha(0);
                            player.messageContent.setAlpha(0).setColor("black");
                            this.physics.world.enable([
                                player.label,
                                player.message,
                                player.messageContent,
                            ]);
                            player.setSize(16, 16).setOffset(5, 20);
                            //@ts-ignore
                            player.label.body.setSize(64, 64).setOffset(18, 94);
                            //@ts-ignore
                            player.message.body.setSize(64, 64).setOffset(55, 218);
                            //@ts-ignore
                            player.messageContent.body.setSize(64, 64).setOffset(5, 178);
                            this.physics.add.collider(player, this.collisionLayer);
                            this.physics.add.collider(player.label, this.collisionLayer);
                            this.physics.add.collider(player.message, this.collisionLayer);
                            this.physics.add.collider(player.messageContent, this.collisionLayer);
                            players[Number(id)] = player;
                            if (Number(id) === this.me) {
                                this.cameras.main.setRoundPixels(true);
                                this.cameras.main.startFollow(player, true, 1, 1);
                                this.cameras.main.setBounds(0, 0, this.map.widthInPixels * 4, this.map.heightInPixels * 4);
                            }
                        }
                    }
                });
            }
        };
        this.server = server_1.server;
        this.initConnection();
    }
    preload() {
        this.load.image("bubble", "assets/gui/bubble4x.png");
        this.load.image("rules", "assets/tilesets/rules.png");
        this.load.image("terrain", "assets/tilesets/terrain.png");
        this.load.image("outside", "assets/tilesets/outside.png");
        this.load.image("water", "assets/tilesets/water.png");
        this.load.spritesheet("slash", "assets/animations/slash.png", {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.tilemapTiledJSON("map", "assets/tilemaps/World.json");
    }
    create() {
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
                    Phaser.Math.Angle.Between(players[this.me].x, players[this.me].y, pointer.worldX, pointer.worldY);
        });
        this.input.keyboard.on("keydown", (event) => {
            const chat = this.scene.get("chat");
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
                this.sendingMessage = false;
                chat.messagePrompt.setText("Press enter to type your message");
            }
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
                if (!this.sendingMessage) {
                    this.sendingMessage = true;
                    chat.messagePrompt.setText("");
                }
                else {
                    if (chat.messagePrompt.text.length > 0) {
                        this.sendMessage(chat.messagePrompt.text);
                    }
                    this.sendingMessage = false;
                    chat.messagePrompt.setText("Press enter to type your message");
                }
            }
            else if (event.keyCode === 32 ||
                (event.keyCode >= 48 && event.keyCode < 90) ||
                event.keyCode === 190 ||
                event.keyCode === 90) {
                if (this.sendingMessage) {
                    chat.messagePrompt.setText(chat.messagePrompt.text + event.key);
                }
            }
            else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
                if (this.sendingMessage) {
                    chat.messagePrompt.setText(chat.messagePrompt.text.substring(0, chat.messagePrompt.text.length - 1));
                }
            }
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE &&
                !this.sendingMessage) {
                players[this.me].attack(() => {
                    const packet = new protobuf_1.Schema.ClientPacket();
                    packet.setType(protobuf_1.Schema.ClientPacketType.ATTACK_CLIENT);
                    packet.setFacing(players[this.me].facing);
                    this.server.send(packet.serializeBinary());
                });
            }
        });
    }
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
        this.physics.add.existing(this.add.zone(0, 0, this.map.widthInPixels * 4, this.map.heightInPixels * 4));
    }
    initConnection() {
        this.server.addEventListener("message", this.handleMessage);
    }
}
exports.World = World;
//# sourceMappingURL=world.js.map