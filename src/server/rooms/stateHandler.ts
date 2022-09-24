import { Schema, type, MapSchema } from "@colyseus/schema";

export interface PressedKeys {
    x: number;
    y: number;
}

export class Position extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

// export class Score extends Schema {
//     @type("number") score: number  = 0
// }

export class Player extends Schema {
    @type("string") name: string;
    @type(Position) position = new Position();
    @type("number") score: number = 0;

    pressedKeys: PressedKeys = { x: 0, y: 0 };
    static position: any;
    static score: number;
}

export class StateHandler extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
}
