"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const protobuf_1 = require("@shared/protobuf");
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {
        const { id, scene, x, y, texture, sprite, name } = config;
        super(scene, x, y, texture);
        this.instance = new protobuf_1.Schema.Player();
        this.instance.setId(id);
        this.instance.setX(x);
        this.instance.setY(y);
        this.instance.setDirection(protobuf_1.Schema.Direction.DOWN);
        this.instance.setMoving(new protobuf_1.Schema.Movement());
        this.instance.setSpeed(150);
        this.instance.setSprite(sprite);
        this.instance.setName(name);
        this.setScale(4, 4);
        this.init();
    }
    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map