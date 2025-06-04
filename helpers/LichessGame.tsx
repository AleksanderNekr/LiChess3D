'use client';
import { Chess } from 'chess.js';
import { Stream } from './ndJsonStream';
import { Color, GameFullEvent as GameFullEvent, GameState } from './types';


export class LichessGame {
    currentPlayerColor: Color;
    lastMove?: string;
    lastMoveAbsNumber: number = 0;
    game: GameFullEvent;
    chessPosition!: Chess; // The chess position object initialized from the game's initial FEN
    lastUpdateAt!: number; // Timestamp of the last update is initialized in the constructor

    constructor(
        game: GameFullEvent,
        readonly stateStream: Stream,
        currentUserId: string,
        private callback: (chessPosition: Chess, lastMove: string, lastMoveAbsNumber: number) => void) {
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
        this.lastMove = moves[moves.length - 1];
        this.lastMoveAbsNumber = moves.length;
        this.lastUpdateAt = Date.now();

        this.callback(this.chessPosition, this.lastMove, this.lastMoveAbsNumber);
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
