import { Chat } from "./components/chat";
import Phaser from "phaser";
import { World } from "./components/world";
import WebFont from "webfontloader";
import { Login } from "./components/login";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: "100%",
    height: "100%",
  },
  parent: "game",
  scene: [Login, World, Chat],
  plugins: {
    scene: [
      {
        key: "UI",
        plugin: RexUIPlugin,
        mapping: "UI",
      },
      // ...
    ],
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      fixedStep: false,
      // debug: true,
    },
  },
  dom: {
    createContainer: true,
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

WebFont.load({
  custom: {
    families: ["Dogica", "DogicaBold"],
  },
  active: () => {
    new Game(config);
  },
});
