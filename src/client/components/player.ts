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
    super(config.scene, config.x, config.y, config.sprite.toString());
    const { id, x, y, sprite } = config;
    this.instance = new Schema.Player();
    this.instance.setId(id);
    this.instance.setX(x);
    this.instance.setY(y);
    this.instance.setDirection(Schema.Direction.DOWN);
    this.instance.setMoving(new Schema.Movement());
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

  updateAnimations: any = (): void => {
    const moving = this.instance.getMoving().toObject();
    const direction = this.instance.getDirection();

    if (moving.up || moving.down || moving.left || moving.right) {
      switch (direction) {
        case Schema.Direction.UP:
          if (!this.anims.isPlaying || this.anims?.currentAnim?.key !== "up") {
            this.anims.play("up");
          }
          break;
        case Schema.Direction.DOWN:
          if (
            !this.anims.isPlaying ||
            this.anims?.currentAnim?.key !== "down"
          ) {
            this.anims.play("down");
          }
          break;
        case Schema.Direction.LEFT:
          if (
            !this.anims.isPlaying ||
            this.anims?.currentAnim?.key !== "left"
          ) {
            this.anims.play("left");
          }
          break;
        case Schema.Direction.RIGHT:
          if (
            !this.anims.isPlaying ||
            this.anims?.currentAnim?.key !== "right"
          ) {
            this.anims.play("right");
          }
          break;
        default:
          break;
      }
    } else {
      if (this.anims.isPlaying) {
        this.anims.stop();
      }
    }
  };
}
