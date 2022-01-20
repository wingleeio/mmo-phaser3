"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const protobuf_1 = require("@shared/protobuf");
const ui_components_js_1 = require("phaser3-rex-plugins/templates/ui/ui-components.js");
const constants_1 = require("../utls/constants");
const slash_1 = require("./attacks/slash");
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, "1");
        this.attackCoolDown = 350;
        this.canAttack = true;
        this.sentMessage = (message) => {
            clearTimeout(this.messageTimeout);
            this.messageContent.setText(message).setAlpha(0.8);
            this.message.resize(this.messageContent.width + 100, this.message.height);
            this.message.setAlpha(0.9);
            this.messageTimeout = setTimeout(() => {
                this.messageContent.setAlpha(0);
                this.message.setAlpha(0);
            }, 6000);
        };
        this.attack = (callback) => {
            if (this.canAttack) {
                callback && callback();
                new slash_1.Slash(this.scene, this.x, this.y, "slash", this.facing);
                this.canAttack = false;
                setTimeout(() => {
                    this.canAttack = true;
                }, this.attackCoolDown);
            }
        };
        this.updateAnimations = () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            const moving = this.instance.getMoving().toObject();
            const direction = this.instance.getDirection();
            switch (direction) {
                case protobuf_1.Schema.Direction.UP:
                    if (moving.up || moving.down || moving.left || moving.right) {
                        if (((_b = (_a = this.anims) === null || _a === void 0 ? void 0 : _a.currentAnim) === null || _b === void 0 ? void 0 : _b.key) !== "up") {
                            this.anims.play("up");
                        }
                    }
                    else {
                        if (((_d = (_c = this.anims) === null || _c === void 0 ? void 0 : _c.currentAnim) === null || _d === void 0 ? void 0 : _d.key) !== "upIdle") {
                            this.anims.play("upIdle");
                        }
                    }
                    break;
                case protobuf_1.Schema.Direction.DOWN:
                    if (moving.up || moving.down || moving.left || moving.right) {
                        if (((_f = (_e = this.anims) === null || _e === void 0 ? void 0 : _e.currentAnim) === null || _f === void 0 ? void 0 : _f.key) !== "down") {
                            this.anims.play("down");
                        }
                    }
                    else {
                        if (((_h = (_g = this.anims) === null || _g === void 0 ? void 0 : _g.currentAnim) === null || _h === void 0 ? void 0 : _h.key) !== "downIdle") {
                            this.anims.play("downIdle");
                        }
                    }
                    break;
                case protobuf_1.Schema.Direction.LEFT:
                    if (moving.up || moving.down || moving.left || moving.right) {
                        if (((_k = (_j = this.anims) === null || _j === void 0 ? void 0 : _j.currentAnim) === null || _k === void 0 ? void 0 : _k.key) !== "left") {
                            this.anims.play("left");
                        }
                    }
                    else {
                        if (((_m = (_l = this.anims) === null || _l === void 0 ? void 0 : _l.currentAnim) === null || _m === void 0 ? void 0 : _m.key) !== "leftIdle") {
                            this.anims.play("leftIdle");
                        }
                    }
                    break;
                case protobuf_1.Schema.Direction.RIGHT:
                    if (moving.up || moving.down || moving.left || moving.right) {
                        if (((_p = (_o = this.anims) === null || _o === void 0 ? void 0 : _o.currentAnim) === null || _p === void 0 ? void 0 : _p.key) !== "right") {
                            this.anims.play("right");
                        }
                    }
                    else {
                        if (((_r = (_q = this.anims) === null || _q === void 0 ? void 0 : _q.currentAnim) === null || _r === void 0 ? void 0 : _r.key) !== "rightIdle") {
                            this.anims.play("rightIdle");
                        }
                    }
                    break;
                default:
                    break;
            }
        };
        const { id, x, y, sprite, name } = config;
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
        const sprite = this.instance.getSprite();
        const walk = `${sprite}`;
        this.anims.create({
            key: "down",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(walk, { start: 0, end: 2 }),
        });
        this.anims.create({
            key: "left",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(walk, { start: 3, end: 5 }),
        });
        this.anims.create({
            key: "right",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(walk, { start: 6, end: 8 }),
        });
        this.anims.create({
            key: "up",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(walk, { start: 9, end: 11 }),
        });
        this.anims.create({
            key: "downIdle",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(walk, { start: 1, end: 1 }),
        });
        this.anims.create({
            key: "leftIdle",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(walk, { start: 4, end: 4 }),
        });
        this.anims.create({
            key: "rightIdle",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(walk, { start: 7, end: 7 }),
        });
        this.anims.create({
            key: "upIdle",
            frameRate: 6,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers(walk, { start: 10, end: 10 }),
        });
        this.label = this.scene.add
            .text(this.x, this.y - 80, this.instance.getName(), constants_1.StyleConstants.USERNAME_TEXT_STYLE)
            .setOrigin(0.5, 0.5)
            .setShadow(1, 1, "black")
            .setAlpha(0.8)
            .setDepth(3);
        this.messageContent = this.scene.add
            .text(this.x, this.y - 163, "", constants_1.StyleConstants.TEXT_STYLE)
            .setOrigin(0.5, 0.5)
            .setAlpha(0)
            .setColor("black")
            .setDepth(4);
        this.message = this.scene.add
            .existing(new ui_components_js_1.NinePatch(this.scene, this.x, this.y - 160, this.messageContent.width + 100, 100, "bubble", [36, 36, 48, 36, 36], [36, 36, 48, 36, 36]))
            .setDepth(3)
            .setAlpha(0);
        this.setSize(16, 16).setOffset(5, 20);
        const test = document.createElement("div");
        test.innerText = "Angry Dude";
        test.style.fontFamily = "Dogica";
        test.style.fontSize = "12px";
        test.style.color = "white";
        test.style.textShadow = " 1px 1px #000000";
        test.style.userSelect = "none";
        this.test = this.scene.add.dom(this.x, this.y - 100, test).setAlpha(0.8);
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map