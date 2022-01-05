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
    const { id, scene, x, y, texture, sprite, frame } = config;
    super(scene, x, y, texture);
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
  }
}
