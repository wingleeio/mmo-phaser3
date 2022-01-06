"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const phaser_1 = __importDefault(require("phaser"));
const world_1 = require("../components/world");
const config = {
    type: phaser_1.default.HEADLESS,
    width: 800,
    height: 600,
    banner: false,
    scene: [world_1.World],
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
class Game extends phaser_1.default.Game {
    constructor() {
        super(config);
    }
}
exports.Game = Game;
new Game();
//# sourceMappingURL=game.js.map