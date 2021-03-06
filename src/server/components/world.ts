import { Direction, Message } from "@shared/protobuf/schema_pb";

import { Player } from "./player";
import { Schema } from "@shared/protobuf";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import { decodeBinary } from "@shared/utils/serialization";
import { io } from "../core/server";
import Web3 from "web3";
import { PrismaClient } from "@prisma/client";
import path from "path";
let interval: number = 0;
let tick: number = 0;

const clients: { [key: number]: WebSocket } = {};
const players: { [key: number]: Player } = {};
const addresses: { [key: number]: string } = {};

export class World extends Phaser.Scene {
  SI: SnapshotInterpolation;
  web3: Web3 = new Web3();
  prisma: PrismaClient;
  map: Phaser.Tilemaps.Tilemap;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  constructor() {
    super({ key: "World" });
    this.SI = new SnapshotInterpolation();
    this.prisma = new PrismaClient();
  }

  preload() {
    this.load.tilemapTiledJSON(
      "map",
      path.join(__dirname, "../assets/tilemaps/World.json")
    );
    this.load.image(
      "rules",
      path.join(__dirname, "../assets/tilesets/rules.png")
    );
  }

  create() {
    io.on("connection", this.handleConnection);

    this.map = this.make.tilemap({ key: "map" });

    const rules = this.map.addTilesetImage("rules", "rules", 16, 16);
    const tilesets = [rules];

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
  }

  handleConnection = (client: WebSocket) => {
    const id = interval;

    clients[id] = client;

    console.log(`Client ${id} connected`);

    const packet = new Schema.ServerPacket();

    packet.setType(Schema.ServerPacketType.INITIALIZE);
    packet.setId(id);

    client.send(packet.serializeBinary());

    client.addEventListener("message", (e) => this.handleMessage(id, e));

    client.addEventListener("close", () => this.handleClose(id));
    interval++;
  };

  update(time: number, delta: number): void {
    tick++;

    for (const [id, player] of Object.entries(players)) {
      if (player.instance.getMoving().getUp()) {
        player.body.velocity.y = -player.instance.getSpeed();
        player.instance.setDirection(Schema.Direction.UP);
      }

      if (player.instance.getMoving().getDown()) {
        player.body.velocity.y = player.instance.getSpeed();
        player.instance.setDirection(Schema.Direction.DOWN);
      }

      if (player.instance.getMoving().getLeft()) {
        player.body.velocity.x = -player.instance.getSpeed();
        player.instance.setDirection(Schema.Direction.LEFT);
      }

      if (player.instance.getMoving().getRight()) {
        player.body.velocity.x = player.instance.getSpeed();
        player.instance.setDirection(Schema.Direction.RIGHT);
      }

      if (
        !player.instance.getMoving().getUp() &&
        !player.instance.getMoving().getDown()
      ) {
        player.body.velocity.y = 0;
      }

      if (
        !player.instance.getMoving().getLeft() &&
        !player.instance.getMoving().getRight()
      ) {
        player.body.velocity.x = 0;
      }
    }

    if (tick % 4 === 0) {
      this.broadcastPlayerMovement();
    }
  }

  broadcastPlayerMovement() {
    const snapshot = this.SI.snapshot.create([]);
    const packet = new Schema.ServerPacket();

    packet.setType(Schema.ServerPacketType.PLAYER_MOVEMENT);
    packet.setSnapshot(new Schema.Snapshot());
    packet.getSnapshot().setId(snapshot.id);
    packet.getSnapshot().setTime(snapshot.time);

    for (const [id, player] of Object.entries(players)) {
      const position = new Schema.Position();

      position.setId(Number(id));
      position.setX(player.x);
      position.setY(player.y);
      position.setDirection(player.instance.getDirection());
      position.setSprite(player.instance.getSprite());
      position.setFacing(player.facing);
      position.setMoving(
        player.instance.getMoving().getUp() ||
          player.instance.getMoving().getDown() ||
          player.instance.getMoving().getLeft() ||
          player.instance.getMoving().getRight()
      );
      position.setName(player.instance.getName());
      packet.getSnapshot().addState(position);
    }

    this.broadcast(packet.serializeBinary());
  }

  async handleMessage(id: number, e: MessageEvent<any>) {
    const packet = await decodeBinary<Schema.ClientPacket>(
      e.data,
      Schema.ClientPacket
    );
    const newPacket = new Schema.ServerPacket();

    switch (packet.getType()) {
      case Schema.ClientPacketType.ATTACK_CLIENT:
        newPacket.setType(Schema.ServerPacketType.ATTACK_SERVER);
        newPacket.setAttack(new Schema.Attack());
        newPacket.getAttack().setId(id);
        newPacket.getAttack().setFacing(packet.getFacing());
        this.broadcast(newPacket.serializeBinary());
        break;
      case Schema.ClientPacketType.MOVEMENT_INPUT:
        this.handleMovementInput(id, packet);
        break;
      case Schema.ClientPacketType.SEND_MESSAGE:
        newPacket.setType(Schema.ServerPacketType.BROADCAST_MESSAGE);
        newPacket.setMessage(packet.getMessage());
        newPacket.getMessage().setId(id);
        this.broadcast(newPacket.serializeBinary());
        break;
      case Schema.ClientPacketType.NONCE:
        const address = packet.getAddress();
        const isAddress = this.web3.utils.isAddress(address);

        if (!isAddress) return;

        let user = await this.prisma.user.findFirst({
          where: { id: address },
        });

        if (!user) {
          user = await this.prisma.user.create({
            data: {
              id: address,
              nonce: Math.floor(Math.random() * 1000000000),
            },
          });
        } else {
          user = await this.prisma.user.update({
            where: {
              id: address,
            },
            data: {
              nonce: Math.floor(Math.random() * 1000000000),
            },
          });
        }
        newPacket.setType(Schema.ServerPacketType.SERVER_NONCE);
        newPacket.setNonce(user.nonce);

        clients[id].send(newPacket.serializeBinary());
        break;
      case Schema.ClientPacketType.LOGIN:
        const handleLogin = async () => {
          const address = packet.getLogin().getAddress();
          const signature = packet.getLogin().getSignature();

          let user = await this.prisma.user.findFirst({
            where: { id: address },
          });

          if (!user) return;
          const signer = this.web3.eth.accounts.recover(
            `Logging into Legends of Ethereum with my one-time nonce: ${user.nonce}`,
            signature
          );

          if (signer !== this.web3.utils.toChecksumAddress(address)) return;
          addresses[id] = address;

          if (!user.sprite || !user.name) {
            newPacket.setType(Schema.ServerPacketType.MISSING_DETAILS);
            clients[id].send(newPacket.serializeBinary());
          } else {
            players[id] = new Player({
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

            newPacket.setType(Schema.ServerPacketType.LOGIN_SUCCESS);
            newPacket.setId(id);
            clients[id].send(newPacket.serializeBinary());
          }
        };

        await handleLogin();
        break;
      case Schema.ClientPacketType.UPDATE_ACCOUNT:
        const handleUpdate = async () => {
          const sprite = packet.getUpdate().getSprite();
          const name = packet.getUpdate().getName();

          let user = await this.prisma.user.findFirst({ where: { name } });

          if (user) return;

          user = await this.prisma.user.update({
            where: {
              id: addresses[id],
            },
            data: {
              sprite,
              name,
            },
          });
          players[id] = new Player({
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

          newPacket.setType(Schema.ServerPacketType.LOGIN_SUCCESS);
          newPacket.setId(id);
          clients[id].send(newPacket.serializeBinary());
        };
        await handleUpdate();
        break;
      default:
        break;
    }
  }

  async handleClose(id: number) {
    {
      console.log(`Client ${id} disconnected.`);

      delete clients[id];
      delete players[id];

      const packet: Schema.ServerPacket = new Schema.ServerPacket();

      packet.setType(Schema.ServerPacketType.PLAYER_DISCONNECTED);
      packet.setId(id);

      this.broadcast(packet.serializeBinary());
    }
  }

  handleMovementInput(id: number, packet: Schema.ClientPacket) {
    players[id].facing = packet.getMovementinput().getFacing();
    switch (packet.getMovementinput().getDirection()) {
      case Schema.Direction.UP:
        players[id].instance.setDirection(Direction.UP);
        players[id].instance
          .getMoving()
          .setUp(packet.getMovementinput().getIsmoving());
        break;
      case Schema.Direction.DOWN:
        players[id].instance.setDirection(Direction.DOWN);
        players[id].instance
          .getMoving()
          .setDown(packet.getMovementinput().getIsmoving());
        break;
      case Schema.Direction.LEFT:
        players[id].instance.setDirection(Direction.LEFT);
        players[id].instance
          .getMoving()
          .setLeft(packet.getMovementinput().getIsmoving());
        break;
      case Schema.Direction.RIGHT:
        players[id].instance.setDirection(Direction.RIGHT);
        players[id].instance
          .getMoving()
          .setRight(packet.getMovementinput().getIsmoving());
        break;
      default:
        break;
    }
  }

  broadcast(message: any) {
    Object.keys(clients).map((key) => {
      clients[Number(key)].send(message);
    });
  }
}
