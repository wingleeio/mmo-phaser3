"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const protobuf_1 = require("@shared/protobuf");
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {
        const { id, scene, x, y, sprite } = config;
        super(scene, x, y, sprite.toString());
        this.instance = new protobuf_1.Schema.Player();
        this.instance.setId(id);
        this.instance.setX(x);
        this.instance.setY(y);
        this.instance.setDirection(protobuf_1.Schema.Direction.DOWN);
        this.instance.setMoving(new protobuf_1.Schema.Movement());
        this.instance.setSpeed(150);
        this.instance.setSprite(sprite);
        this.init();
    }
    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.anims.create({
            key: "down",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(this.instance.getSprite().toString(), { start: 0, end: 2 }),
        });
        this.anims.create({
            key: "left",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(this.instance.getSprite().toString(), { start: 12, end: 14 }),
        });
        this.anims.create({
            key: "right",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(this.instance.getSprite().toString(), { start: 24, end: 26 }),
        });
        this.anims.create({
            key: "up",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(this.instance.getSprite().toString(), { start: 36, end: 38 }),
        });
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map