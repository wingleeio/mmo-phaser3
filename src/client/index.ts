import { Chat } from "./components/chat";
import Phaser from "phaser";
import { World } from "./components/world";
import WebFont from "webfontloader";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: "100%",
    height: "100%",
  },
  parent: "game",
  scene: [World, Chat],
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

WebFont.load({
  custom: {
    families: ["Dogica"],
  },
  active: () => {
    new Game(config);
  },
});
