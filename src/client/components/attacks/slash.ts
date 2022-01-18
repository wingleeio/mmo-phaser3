export class Slash extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    angle: number
  ) {
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
