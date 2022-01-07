import Phaser from "phaser";
import WebFont from "webfontloader";
import { World } from "./components/world";

WebFont.load({
  custom: {
    families: ["Dogica"],
    urls: ["/assets/css/fonts.css"],
  },
});

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: "100%",
    height: "100%",
  },
  parent: "game",
  scene: [World],
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      fixedStep: false,
    },
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

new Game(config);
