'use client';
import { Chess } from 'chess.js';
import { Stream } from './ndJsonStream';
import { Color, GameFullEvent as GameFullEvent, GameState, UserInfo } from './types';


export class LichessGame {
    currentPlayerColor: Color;
    lastMove?: [string, string];
    game: GameFullEvent;
    chessPosition!: Chess; // The chess position object initialized from the game's initial FEN
    lastUpdateAt!: number; // Timestamp of the last update is initialized in the constructor

    constructor(game: GameFullEvent, readonly stateStream: Stream, currentUserId: string) {
        this.game = game;
        this.currentPlayerColor = game.white.id === currentUserId
            ? 'white'
            : 'black';
        this.onGameStateUpdate();
    }

    private onGameStateUpdate = () => {
        this.chessPosition = this.game.initialFen === 'startpos'
            ? new Chess()
            : new Chess(this.game.initialFen, { skipValidation: true });

        const moves = this.game.state.moves.split(' ').filter((m: string) => m);
        moves.forEach((uci: string) => this.chessPosition.move(uci));
        const lastMove = moves[moves.length - 1];
        this.lastMove = lastMove ? [lastMove.substr(0, 2), lastMove.substr(2, 2)] : undefined;
        this.lastUpdateAt = Date.now();
    };

    timeOf = (color: Color) => {
        if (color === 'white') return this.game.state.wtime;
        if (color === 'black') return this.game.state.btime;
        throw new Error('Invalid color');
    };

    handleStateChange = (msg: GameState) => {
        switch (msg.type) {
            case 'gameFull':
                this.game = msg;
                this.onGameStateUpdate();
                break;
            case 'gameState':
                this.game.state = msg;
                this.onGameStateUpdate();
                break;
            default:
                console.error(`Unknown message type: ${msg.type}`, msg);
        }
    };
}
