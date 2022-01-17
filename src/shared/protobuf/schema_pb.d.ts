// package: 
// file: schema.proto

import * as jspb from "google-protobuf";

export class Movement extends jspb.Message {
  getUp(): boolean;
  setUp(value: boolean): void;

  getDown(): boolean;
  setDown(value: boolean): void;

  getLeft(): boolean;
  setLeft(value: boolean): void;

  getRight(): boolean;
  setRight(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Movement.AsObject;
  static toObject(includeInstance: boolean, msg: Movement): Movement.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Movement, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Movement;
  static deserializeBinaryFromReader(message: Movement, reader: jspb.BinaryReader): Movement;
}

export namespace Movement {
  export type AsObject = {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
  }
}

export class MovementInput extends jspb.Message {
  getDirection(): DirectionMap[keyof DirectionMap];
  setDirection(value: DirectionMap[keyof DirectionMap]): void;

  getIsmoving(): boolean;
  setIsmoving(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MovementInput.AsObject;
  static toObject(includeInstance: boolean, msg: MovementInput): MovementInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MovementInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MovementInput;
  static deserializeBinaryFromReader(message: MovementInput, reader: jspb.BinaryReader): MovementInput;
}

export namespace MovementInput {
  export type AsObject = {
    direction: DirectionMap[keyof DirectionMap],
    ismoving: boolean,
  }
}

export class Player extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getSprite(): number;
  setSprite(value: number): void;

  getDirection(): DirectionMap[keyof DirectionMap];
  setDirection(value: DirectionMap[keyof DirectionMap]): void;

  hasMoving(): boolean;
  clearMoving(): void;
  getMoving(): Movement | undefined;
  setMoving(value?: Movement): void;

  getSpeed(): number;
  setSpeed(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Player.AsObject;
  static toObject(includeInstance: boolean, msg: Player): Player.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Player, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Player;
  static deserializeBinaryFromReader(message: Player, reader: jspb.BinaryReader): Player;
}

export namespace Player {
  export type AsObject = {
    id: number,
    name: string,
    x: number,
    y: number,
    sprite: number,
    direction: DirectionMap[keyof DirectionMap],
    moving?: Movement.AsObject,
    speed: number,
  }
}

export class PlayersState extends jspb.Message {
  getPlayersMap(): jspb.Map<number, Player>;
  clearPlayersMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlayersState.AsObject;
  static toObject(includeInstance: boolean, msg: PlayersState): PlayersState.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlayersState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlayersState;
  static deserializeBinaryFromReader(message: PlayersState, reader: jspb.BinaryReader): PlayersState;
}

export namespace PlayersState {
  export type AsObject = {
    playersMap: Array<[number, Player.AsObject]>,
  }
}

export class Position extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getDirection(): DirectionMap[keyof DirectionMap];
  setDirection(value: DirectionMap[keyof DirectionMap]): void;

  getMoving(): boolean;
  setMoving(value: boolean): void;

  getSprite(): number;
  setSprite(value: number): void;

  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Position.AsObject;
  static toObject(includeInstance: boolean, msg: Position): Position.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Position, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Position;
  static deserializeBinaryFromReader(message: Position, reader: jspb.BinaryReader): Position;
}

export namespace Position {
  export type AsObject = {
    id: number,
    x: number,
    y: number,
    direction: DirectionMap[keyof DirectionMap],
    moving: boolean,
    sprite: number,
    name: string,
  }
}

export class Snapshot extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  hasTime(): boolean;
  clearTime(): void;
  getTime(): number;
  setTime(value: number): void;

  clearStateList(): void;
  getStateList(): Array<Position>;
  setStateList(value: Array<Position>): void;
  addState(value?: Position, index?: number): Position;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Snapshot.AsObject;
  static toObject(includeInstance: boolean, msg: Snapshot): Snapshot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Snapshot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Snapshot;
  static deserializeBinaryFromReader(message: Snapshot, reader: jspb.BinaryReader): Snapshot;
}

export namespace Snapshot {
  export type AsObject = {
    id: string,
    time: number,
    stateList: Array<Position.AsObject>,
  }
}

export class Message extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number;
  setId(value: number): void;

  getContent(): string;
  setContent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Message.AsObject;
  static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Message, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Message;
  static deserializeBinaryFromReader(message: Message, reader: jspb.BinaryReader): Message;
}

export namespace Message {
  export type AsObject = {
    id: number,
    content: string,
  }
}

export class Login extends jspb.Message {
  getAddress(): string;
  setAddress(value: string): void;

  getSignature(): string;
  setSignature(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Login.AsObject;
  static toObject(includeInstance: boolean, msg: Login): Login.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Login, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Login;
  static deserializeBinaryFromReader(message: Login, reader: jspb.BinaryReader): Login;
}

export namespace Login {
  export type AsObject = {
    address: string,
    signature: string,
  }
}

export class UpdateAccount extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getSprite(): number;
  setSprite(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateAccount.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateAccount): UpdateAccount.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateAccount, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateAccount;
  static deserializeBinaryFromReader(message: UpdateAccount, reader: jspb.BinaryReader): UpdateAccount;
}

export namespace UpdateAccount {
  export type AsObject = {
    name: string,
    sprite: number,
  }
}

export class ClientPacket extends jspb.Message {
  getType(): ClientPacketTypeMap[keyof ClientPacketTypeMap];
  setType(value: ClientPacketTypeMap[keyof ClientPacketTypeMap]): void;

  hasMovementinput(): boolean;
  clearMovementinput(): void;
  getMovementinput(): MovementInput | undefined;
  setMovementinput(value?: MovementInput): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): Message | undefined;
  setMessage(value?: Message): void;

  hasLogin(): boolean;
  clearLogin(): void;
  getLogin(): Login | undefined;
  setLogin(value?: Login): void;

  hasAddress(): boolean;
  clearAddress(): void;
  getAddress(): string;
  setAddress(value: string): void;

  hasUpdate(): boolean;
  clearUpdate(): void;
  getUpdate(): UpdateAccount | undefined;
  setUpdate(value?: UpdateAccount): void;

  getDataCase(): ClientPacket.DataCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientPacket.AsObject;
  static toObject(includeInstance: boolean, msg: ClientPacket): ClientPacket.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientPacket, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientPacket;
  static deserializeBinaryFromReader(message: ClientPacket, reader: jspb.BinaryReader): ClientPacket;
}

export namespace ClientPacket {
  export type AsObject = {
    type: ClientPacketTypeMap[keyof ClientPacketTypeMap],
    movementinput?: MovementInput.AsObject,
    message?: Message.AsObject,
    login?: Login.AsObject,
    address: string,
    update?: UpdateAccount.AsObject,
  }

  export enum DataCase {
    DATA_NOT_SET = 0,
    MOVEMENTINPUT = 3,
    MESSAGE = 4,
    LOGIN = 5,
    ADDRESS = 6,
    UPDATE = 7,
  }
}

export class ServerPacket extends jspb.Message {
  getType(): ServerPacketTypeMap[keyof ServerPacketTypeMap];
  setType(value: ServerPacketTypeMap[keyof ServerPacketTypeMap]): void;

  hasPlayers(): boolean;
  clearPlayers(): void;
  getPlayers(): PlayersState | undefined;
  setPlayers(value?: PlayersState): void;

  hasId(): boolean;
  clearId(): void;
  getId(): number;
  setId(value: number): void;

  hasSnapshot(): boolean;
  clearSnapshot(): void;
  getSnapshot(): Snapshot | undefined;
  setSnapshot(value?: Snapshot): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): Message | undefined;
  setMessage(value?: Message): void;

  hasNonce(): boolean;
  clearNonce(): void;
  getNonce(): number;
  setNonce(value: number): void;

  getDataCase(): ServerPacket.DataCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerPacket.AsObject;
  static toObject(includeInstance: boolean, msg: ServerPacket): ServerPacket.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerPacket, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerPacket;
  static deserializeBinaryFromReader(message: ServerPacket, reader: jspb.BinaryReader): ServerPacket;
}

export namespace ServerPacket {
  export type AsObject = {
    type: ServerPacketTypeMap[keyof ServerPacketTypeMap],
    players?: PlayersState.AsObject,
    id: number,
    snapshot?: Snapshot.AsObject,
    message?: Message.AsObject,
    nonce: number,
  }

  export enum DataCase {
    DATA_NOT_SET = 0,
    PLAYERS = 3,
    ID = 4,
    SNAPSHOT = 5,
    MESSAGE = 6,
    NONCE = 7,
  }
}

export interface DirectionMap {
  UP: 0;
  DOWN: 1;
  LEFT: 2;
  RIGHT: 3;
}

export const Direction: DirectionMap;

export interface ClientPacketTypeMap {
  MOVEMENT_INPUT: 0;
  SEND_MESSAGE: 1;
  LOGIN: 2;
  NONCE: 3;
  UPDATE_ACCOUNT: 4;
}

export const ClientPacketType: ClientPacketTypeMap;

export interface ServerPacketTypeMap {
  PLAYER_MOVEMENT: 0;
  PLAYER_DISCONNECTED: 1;
  INITIALIZE: 2;
  BROADCAST_MESSAGE: 3;
  SERVER_NONCE: 4;
  MISSING_DETAILS: 5;
  LOGIN_SUCCESS: 6;
}

export const ServerPacketType: ServerPacketTypeMap;

