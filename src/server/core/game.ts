import Phaser from "phaser";
import { World } from "../components/world";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  banner: false,
  scene: [World],
  physics: {
    default: "arcade",
    arcade: {
      fps: 60,
      gravity: {
        y: 0,
      },
    },
  },
};

export class Game extends Phaser.Game {
  constructor() {
    super(config);
  }
}

new Game();
