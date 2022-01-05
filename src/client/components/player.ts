import { Schema } from "@shared/protobuf";

export class Player extends Phaser.Physics.Arcade.Sprite {
  instance: Schema.Player;

  constructor(config: {
    id: number;
    scene: Phaser.Scene;
    x: number;
    y: number;
    texture: string | Phaser.Textures.Texture;
    sprite: number;
    frame?: string | number;
  }) {
    const { id, scene, x, y, sprite } = config;
    super(scene, x, y, sprite.toString());
    this.instance = new Schema.Player();
    this.instance.setId(id);
    this.instance.setX(x);
    this.instance.setY(y);
    this.instance.setDirection(Schema.Direction.DOWN);
    this.instance.setMoving(new Schema.Movement());
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
      frames: this.anims.generateFrameNumbers(
        this.instance.getSprite().toString(),
        { start: 0, end: 2 }
      ),
    });

    this.anims.create({
      key: "left",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(
        this.instance.getSprite().toString(),
        { start: 12, end: 14 }
      ),
    });

    this.anims.create({
      key: "right",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(
        this.instance.getSprite().toString(),
        { start: 24, end: 26 }
      ),
    });

    this.anims.create({
      key: "up",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(
        this.instance.getSprite().toString(),
        { start: 36, end: 38 }
      ),
    });
  }
}
