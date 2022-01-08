import { Schema } from "@shared/protobuf";

export class Player extends Phaser.Physics.Arcade.Sprite {
  instance: Schema.Player;
  label: Phaser.GameObjects.BitmapText;

  constructor(config: {
    id: number;
    scene: Phaser.Scene;
    x: number;
    y: number;
    sprite: number;
    frame?: string | number;
  }) {
    super(config.scene, config.x, config.y, "1");
    const { id, x, y, sprite } = config;
    this.instance = new Schema.Player();
    this.instance.setId(id);
    this.instance.setX(x);
    this.instance.setY(y);
    this.instance.setDirection(Schema.Direction.DOWN);
    this.instance.setMoving(new Schema.Movement());
    this.instance.setSpeed(150);
    this.instance.setSprite(sprite);
    this.setDepth(y);
    this.setScale(4, 4);
    this.init();
  }

  init() {
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    const sprite = this.instance.getSprite();

    const walk = `${sprite}_walk`;
    const idle = `${sprite}_idle`;
    this.anims.create({
      key: "down",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(walk, { start: 0, end: 3 }),
    });

    this.anims.create({
      key: "left",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(walk, { start: 4, end: 7 }),
    });

    this.anims.create({
      key: "right",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(walk, { start: 8, end: 11 }),
    });

    this.anims.create({
      key: "up",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(walk, { start: 12, end: 15 }),
    });

    this.anims.create({
      key: "downIdle",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(idle, {
        start: 0,
        end: 3,
      }),
    });

    this.anims.create({
      key: "leftIdle",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(idle, {
        start: 4,
        end: 7,
      }),
    });

    this.anims.create({
      key: "rightIdle",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(idle, {
        start: 8,
        end: 11,
      }),
    });

    this.anims.create({
      key: "upIdle",
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNumbers(idle, {
        start: 12,
        end: 15,
      }),
    });
  }

  updateAnimations: any = (): void => {
    const moving = this.instance.getMoving().toObject();
    const direction = this.instance.getDirection();
    switch (direction) {
      case Schema.Direction.UP:
        if (moving.up || moving.down || moving.left || moving.right) {
          if (this.anims?.currentAnim?.key !== "up") {
            this.anims.play("up");
          }
        } else {
          if (this.anims?.currentAnim?.key !== "upIdle") {
            this.anims.play("upIdle");
          }
        }
        break;
      case Schema.Direction.DOWN:
        if (moving.up || moving.down || moving.left || moving.right) {
          if (this.anims?.currentAnim?.key !== "down") {
            this.anims.play("down");
          }
        } else {
          if (this.anims?.currentAnim?.key !== "downIdle") {
            this.anims.play("downIdle");
          }
        }
        break;
      case Schema.Direction.LEFT:
        if (moving.up || moving.down || moving.left || moving.right) {
          if (this.anims?.currentAnim?.key !== "left") {
            this.anims.play("left");
          }
        } else {
          if (this.anims?.currentAnim?.key !== "leftIdle") {
            this.anims.play("leftIdle");
          }
        }
        break;
      case Schema.Direction.RIGHT:
        if (moving.up || moving.down || moving.left || moving.right) {
          if (this.anims?.currentAnim?.key !== "right") {
            this.anims.play("right");
          }
        } else {
          if (this.anims?.currentAnim?.key !== "rightIdle") {
            this.anims.play("rightIdle");
          }
        }
        break;
      default:
        break;
    }
  };
}
