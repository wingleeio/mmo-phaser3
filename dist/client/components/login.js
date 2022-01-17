"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const protobuf_1 = require("@shared/protobuf");
const serialization_1 = require("@shared/utils/serialization");
const phaser_1 = require("phaser");
const web3_1 = __importDefault(require("web3"));
const constants_1 = require("../utls/constants");
const server_1 = require("../utls/server");
const inputtext_js_1 = __importDefault(require("phaser3-rex-plugins/plugins/inputtext.js"));
class Login extends phaser_1.Scene {
    constructor() {
        super({ key: "Login" });
        this.buttons = {};
        this.preload = () => {
            for (let i = 1; i <= 32; i++) {
                this.load.spritesheet(`${i}`, `assets/sprites/${i}.png`, {
                    frameWidth: 26,
                    frameHeight: 36,
                });
            }
        };
        this.create = () => __awaiter(this, void 0, void 0, function* () {
            const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
            const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
            this.add
                .text(screenCenterX, screenCenterY - 150, `LEGENDS OF ETHEREUM`, constants_1.StyleConstants.LOGO_STYLE)
                .setOrigin(0.5);
            this.accounts = yield this.web3.eth.getAccounts();
            if (window["ethereum"] && this.accounts.length === 0) {
                this.buttons["connect"] = this.addButton(screenCenterX, screenCenterY + 50, "Connect Wallet", () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        this.accounts = yield window["ethereum"].request({
                            method: "eth_requestAccounts",
                        });
                        if (this.accounts.length > 0) {
                            this.buttons["connect"].destroy();
                            this.addLoginButton();
                        }
                    }
                    catch (e) { }
                }));
            }
            else if (this.accounts.length > 0) {
                this.addLoginButton();
            }
            else {
                this.add
                    .text(screenCenterX, screenCenterY + 50, `You must have MetaMask installed to play this game.`, constants_1.StyleConstants.TEXT_STYLE)
                    .setOrigin(0.5);
            }
            this.input.setDefaultCursor("url(assets/gui/cursor.cur), pointer");
            this.server.addEventListener("message", this.handleMessage);
        });
        this.addLoginButton = () => {
            const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
            const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
            this.buttons["login"] = this.addButton(screenCenterX, screenCenterY + 50, "Login", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const packet = new protobuf_1.Schema.ClientPacket();
                    packet.setType(protobuf_1.Schema.ClientPacketType.NONCE);
                    packet.setAddress(this.accounts[0]);
                    this.server.send(packet.serializeBinary());
                }
                catch (e) { }
            }));
        };
        this.addCharacterCreation = () => {
            const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
            const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
            let sprite = 1;
            let name = "Enter Name";
            let displaySprite = this.add
                .sprite(screenCenterX, screenCenterY + 100, sprite.toString(), 1)
                .setOrigin(0.5)
                .setScale(4);
            this.nameInput = this.add
                .existing(new inputtext_js_1.default(this, screenCenterX, screenCenterY, 150, 25, {
                type: "text",
                fontFamily: "Dogica",
                fontSize: "12px",
                text: name,
                align: "center",
            }))
                .setOrigin(0.5)
                .on("textchange", function (inputText) {
                name = inputText.text;
            });
            this.buttons["prev"] = this.addButton(screenCenterX - 150, screenCenterY + 100, "prev", () => {
                if (sprite > 1) {
                    sprite--;
                    displaySprite.setTexture(sprite.toString()).setFrame(1);
                }
            });
            this.buttons["next"] = this.addButton(screenCenterX + 150, screenCenterY + 100, "next", () => {
                if (sprite < 32) {
                    sprite++;
                    displaySprite.setTexture(sprite.toString()).setFrame(1);
                }
            });
            this.buttons["confirm"] = this.addButton(screenCenterX, screenCenterY + 250, "Click Here to confirm", () => {
                const packet = new protobuf_1.Schema.ClientPacket();
                packet.setType(protobuf_1.Schema.ClientPacketType.UPDATE_ACCOUNT);
                packet.setUpdate(new protobuf_1.Schema.UpdateAccount());
                packet.getUpdate().setSprite(sprite);
                packet.getUpdate().setName(name);
                this.server.send(packet.serializeBinary());
            });
        };
        this.addButton = (x, y, text, onClick) => {
            const button = this.add
                .text(x, y, text, constants_1.StyleConstants.TEXT_STYLE)
                .setOrigin(0.5)
                .setInteractive({ cursor: "url(assets/gui/cursor-hover.cur), pointer" });
            button.on("pointerover", () => {
                button.setText(`[ ${text} ]`);
            });
            button.on("pointerout", () => {
                button.setText(text);
            });
            button.on("pointerdown", onClick);
            return button;
        };
        this.handleMessage = (e) => __awaiter(this, void 0, void 0, function* () {
            const packet = yield (0, serialization_1.decodeBinary)(e.data, protobuf_1.Schema.ServerPacket);
            const newPacket = new protobuf_1.Schema.ClientPacket();
            switch (packet.getType()) {
                case protobuf_1.Schema.ServerPacketType.SERVER_NONCE:
                    //@ts-ignore
                    const signature = yield this.web3.eth.personal.sign(this.web3.utils.fromUtf8(`Logging into Legends of Ethereum with my one-time nonce: ${packet.getNonce()}`), this.accounts[0]);
                    newPacket.setType(protobuf_1.Schema.ClientPacketType.LOGIN);
                    newPacket.setLogin(new protobuf_1.Schema.Login());
                    newPacket.getLogin().setSignature(signature);
                    newPacket.getLogin().setAddress(this.accounts[0]);
                    this.server.send(newPacket.serializeBinary());
                    break;
                case protobuf_1.Schema.ServerPacketType.MISSING_DETAILS:
                    this.buttons["login"].destroy();
                    this.addCharacterCreation();
                    break;
                case protobuf_1.Schema.ServerPacketType.LOGIN_SUCCESS:
                    this.scene.start("World", { id: packet.getId() });
                    break;
                default:
                    break;
            }
        });
        this.server = server_1.server;
        if (window["ethereum"]) {
            this.web3 = new web3_1.default(window["ethereum"]);
        }
    }
}
exports.Login = Login;
//# sourceMappingURL=login.js.map