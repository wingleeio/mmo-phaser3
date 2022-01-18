"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slash = void 0;
class Slash extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, angle) {
        super(scene, x, y + 15, texture);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setScale(4);
        this.setDepth(3);
        this.setOrigin(0.5);
        this.setAngle(angle - 95);
        this.anims.create({
            key: "attackSlash",
            frameRate: 15,
            repeat: 0,
            frames: this.anims.generateFrameNumbers("slash", { start: 0, end: 3 }),
        });
        this.anims.play("attackSlash");
        this.on("animationcomplete", () => {
            this.destroy();
        });
    }
}
exports.Slash = Slash;
//# sourceMappingURL=slash.js.map