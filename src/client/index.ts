import Phaser from "phaser";
import { Schema } from "@shared/protobuf";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: "100%",
    height: "100%",
  },
  parent: "game",
  scene: [],
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

new Game(config);

console.log(Schema);
