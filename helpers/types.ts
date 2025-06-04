export type Color = 'white' | 'black';

export interface Variant {
    "key":
    | "standard"
    | "chess960"
    | "crazyhouse"
    | "antichess"
    | "atomic"
    | "horde"
    | "kingOfTheHill"
    | "racingKings"
    | "threeCheck"
    | "fromPosition"
    "name": string,
    "short"?: string
}

export interface UserInfo {
    id: string;
    username: string;
}

export interface GameFullEvent {
    "id": string,
    "variant": Variant,
    "speed": 'blitz' | 'rapid' | 'classical' | 'ultraBullet' | 'bullet' | 'correspondence',
    "perf": {
        "name": string // Translated perf name (e.g. "Classical" or "Blitz")
    },
    "rated": boolean,
    "createdAt": number,
    "white": GameEventPlayer,
    "black": GameEventPlayer,
    "initialFen": "startpos" | string,
    "clock": {
        "initial": number, // Initial time in milliseconds
        "increment": number, // Increment time in milliseconds
    },
    "type": "gameFull",
    "state": GameStateEvent,
    "tournamentId"?: string,
}

export interface GameEventPlayer {
    aiLevel?: number;
    id: string;
    name: string;
    title?: "GM" | "WGM" | "IM" | "WIM" | "FM" | "WFM" | "NM" | "CM" | "WCM" | "WNM" | "LM" | "BOT" | null;
    rating?: number;
    provisional?: boolean;
}

export type GameStatus =
    | "created"
    | "started"
    | "aborted"
    | "mate"
    | "resign"
    | "stalemate"
    | "timeout"
    | "draw"
    | "outoftime"
    | "cheat"
    | "noStart"
    | "unknownFinish"
    | "variantEnd";

export interface GameStateEvent {
    "type": "gameState",
    "moves": string, // Current moves in UCI format
    "wtime": number, // Integer of milliseconds White has left on the clock
    "btime": number, // Integer of milliseconds Black has left on the clock
    "winc": number, // Integer of White Fisher increment
    "binc": number, // Integer of Black Fisher increment
    "status": GameStatus,
    "winner"?: Color, // "white" or "black" if there is a winner, else omitted
    "wdraw"?: boolean, // true if white is offering draw, else omitted
    "bdraw"?: boolean, // true if black is offering draw, else omitted
    "wtakeback"?: boolean, // true if white is proposing takeback, else omitted
    "btakeback"?: boolean, // true if black is proposing takeback, else omitted
}

export interface ChatLineEvent {
    "type": "chatLine",
    "username": string,
    "text": string,
    "room": "player" | "spectator",
}

export interface OpponentGoneEvent {
    "type": "opponentGone",
    "gone": boolean,
    "claimWinInSeconds"?: number,
}


export type GameState =
    | GameFullEvent
    | GameStateEvent
    | ChatLineEvent
    | OpponentGoneEvent;
