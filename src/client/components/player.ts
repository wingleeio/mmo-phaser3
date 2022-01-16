import { Schema } from "@shared/protobuf";
import { NinePatch } from "phaser3-rex-plugins/templates/ui/ui-components.js";
export class Player extends Phaser.Physics.Arcade.Sprite {
  instance: Schema.Player;
  label: Phaser.GameObjects.Text;
  container: Phaser.GameObjects.Container;
  message: NinePatch;
  messageContent: Phaser.GameObjects.Text;
  messageTimeout: NodeJS.Timeout;
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
  }

  sentMessage = (message: string) => {
    clearTimeout(this.messageTimeout);
    this.messageContent.setText(message).setAlpha(0.8);
    this.message.displayWidth = this.messageContent.width + 100;
    this.message.setAlpha(0.8);

    this.messageTimeout = setTimeout(() => {
      this.messageContent.setAlpha(0);
      this.message.setAlpha(0);
    }, 3000);
  };

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
