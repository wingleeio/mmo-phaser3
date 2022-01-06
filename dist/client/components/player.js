"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const protobuf_1 = require("@shared/protobuf");
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.sprite.toString());
        this.updateAnimations = () => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const moving = this.instance.getMoving().toObject();
            const direction = this.instance.getDirection();
            if (moving.up || moving.down || moving.left || moving.right) {
                switch (direction) {
                    case protobuf_1.Schema.Direction.UP:
                        if (!this.anims.isPlaying || ((_b = (_a = this.anims) === null || _a === void 0 ? void 0 : _a.currentAnim) === null || _b === void 0 ? void 0 : _b.key) !== "up") {
                            this.anims.play("up");
                        }
                        break;
                    case protobuf_1.Schema.Direction.DOWN:
                        if (!this.anims.isPlaying ||
                            ((_d = (_c = this.anims) === null || _c === void 0 ? void 0 : _c.currentAnim) === null || _d === void 0 ? void 0 : _d.key) !== "down") {
                            this.anims.play("down");
                        }
                        break;
                    case protobuf_1.Schema.Direction.LEFT:
                        if (!this.anims.isPlaying ||
                            ((_f = (_e = this.anims) === null || _e === void 0 ? void 0 : _e.currentAnim) === null || _f === void 0 ? void 0 : _f.key) !== "left") {
                            this.anims.play("left");
                        }
                        break;
                    case protobuf_1.Schema.Direction.RIGHT:
                        if (!this.anims.isPlaying ||
                            ((_h = (_g = this.anims) === null || _g === void 0 ? void 0 : _g.currentAnim) === null || _h === void 0 ? void 0 : _h.key) !== "right") {
                            this.anims.play("right");
                        }
                        break;
                    default:
                        break;
                }
            }
            else {
                if (this.anims.isPlaying) {
                    this.anims.stop();
                }
            }
        };
        const { id, x, y, sprite } = config;
        this.instance = new protobuf_1.Schema.Player();
        this.instance.setId(id);
        this.instance.setX(x);
        this.instance.setY(y);
        this.instance.setDirection(protobuf_1.Schema.Direction.DOWN);
        this.instance.setMoving(new protobuf_1.Schema.Movement());
        this.instance.setSpeed(80);
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