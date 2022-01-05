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

  hasMovement(): boolean;
  clearMovement(): void;
  getMovement(): Movement | undefined;
  setMovement(value?: Movement): void;

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
    movement?: Movement.AsObject,
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

export class ClientPacket extends jspb.Message {
  hasTime(): boolean;
  clearTime(): void;
  getTime(): number;
  setTime(value: number): void;

  getType(): ClientPacketTypeMap[keyof ClientPacketTypeMap];
  setType(value: ClientPacketTypeMap[keyof ClientPacketTypeMap]): void;

  hasMovementinput(): boolean;
  clearMovementinput(): void;
  getMovementinput(): MovementInput | undefined;
  setMovementinput(value?: MovementInput): void;

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
    time: number,
    type: ClientPacketTypeMap[keyof ClientPacketTypeMap],
    movementinput?: MovementInput.AsObject,
  }

  export enum DataCase {
    DATA_NOT_SET = 0,
    MOVEMENTINPUT = 3,
  }
}

export class ServerPacket extends jspb.Message {
  hasTime(): boolean;
  clearTime(): void;
  getTime(): number;
  setTime(value: number): void;

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
    time: number,
    type: ServerPacketTypeMap[keyof ServerPacketTypeMap],
    players?: PlayersState.AsObject,
    id: number,
  }

  export enum DataCase {
    DATA_NOT_SET = 0,
    PLAYERS = 3,
    ID = 4,
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
}

export const ClientPacketType: ClientPacketTypeMap;

export interface ServerPacketTypeMap {
  PLAYERS: 0;
  PLAYER_DISCONNECTED: 1;
  INITIALIZE: 2;
}

export const ServerPacketType: ServerPacketTypeMap;

