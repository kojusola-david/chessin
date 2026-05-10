import { Chess } from 'chess.js';
import { PlayerColor, GameState, Move } from '@chessin/shared';

type MoveError =
  | { code: 'INVALID_SQUARE'; square: string }
  | { code: 'NO_PIECE_AT_SOURCE' }
  | { code: 'WRONG_TURN'; expected: PlayerColor }
  | { code: 'ILLEGAL_MOVE'; reason: string }
  | { code: 'GAME_OVER'; result: GameState };

type MoveResult =
  | { success: true; state: GameState }
  | { success: false; error: MoveError };

type TimeoutResult =
  | { isTimeout: true; winner: PlayerColor }
  | { isTimeout: false };

export class ChessGame {
  public game: Chess;

  constructor() {
    this.game = new Chess();

    // this.game.setHeader('White', gameState.white.username);
    // this.game.setHeader('Black', gameState.black.username);
    // this.game.setHeader(
    //   'WhiteElo',
    //   gameState.white.currentRapidRating.toString()
    // );
    // this.game.setHeader(
    //   'BlackElo',
    //   gameState.black.currentRapidRating.toString()
    // );

    //I need to fix pgn headers
    this.game.setHeader('Variant', 'Standard');
  }

  finalizeGame(state: GameState) {
    const game = new Chess(state.fen);
    let result;
    if (!state.winner) {
      result = `Draw by ${state.status}`;
    } else if (state.winner === 'w') {
      result = `White wins by ${state.status}`;
    } else if (state.winner === 'b') {
      result = `Black wins by ${state.status}`;
    }
    if (result) game.setHeader('Result', result);
    if (state.status) game.setHeader('Termination', state.status);

    return this.toGameState(game);
  }

  public initializeGameState(): GameState {
    return {
      fen: '',
      moves: [],
      turn: 'w',
      whiteTime: Date.now(),
      blackTime: Date.now(),
      lastMoveTimestamp: Date.now(),
      timeClass: 'RAPID',
    };
  }

  public toGameState(game: Chess): GameState {
    return {
      fen: game.fen(),
      moves: game.moves(),
      turn: game.turn(),
      whiteTime: 0,
      blackTime: 0,
      lastMoveTimestamp: Date.now(),
      timeClass: 'RAPID',
    };
  }

  // public serializeGame(gameState: GameState): Chess{
  //   const game = new Chess(gameState.fen);
  //   return game;
  // }

  public makeMove(gameState: GameState, move: Move): MoveResult {
    const game = new Chess(gameState.fen);
    if (game.isGameOver())
      return {
        success: false,
        error: { code: 'GAME_OVER', result: gameState },
      };

    const now = Date.now();
    let whiteTime = gameState.whiteTime;
    let blackTime = gameState.blackTime;
    if (whiteTime <= 0)
      return {
        success: false,
        error: {
          code: 'GAME_OVER',
          result: { ...gameState, winner: 'b', status: 'TIMEOUT' },
        },
      };
    if (blackTime <= 0)
      return {
        success: false,
        error: {
          code: 'GAME_OVER',
          result: { ...gameState, winner: 'b', status: 'TIMEOUT' },
        },
      };
    const timeSpent = now - gameState.lastMoveTimestamp;
    if (gameState.turn === 'w') {
      whiteTime = gameState.whiteTime - timeSpent;
      blackTime = gameState.blackTime;
    } else {
      blackTime = gameState.blackTime - timeSpent;
      whiteTime = gameState.whiteTime;
    }
    const lastMoveTimestamp = Date.now();
    const result = game.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
    if (result === null)
      return {
        success: false,
        error: { code: 'ILLEGAL_MOVE', reason: 'chess.js rejected the move' },
      };

    const nextTurn = gameState.turn === 'w' ? 'b' : 'w';
    const newState: GameState = {
      fen: game.fen(),
      moves: game.moves(),
      turn: nextTurn,
      whiteTime: whiteTime,
      blackTime: blackTime,
      lastMoveTimestamp: lastMoveTimestamp,
      timeClass: gameState.timeClass,
    };
    return { success: true, state: newState };
  }

  public checkTimeout(gameState: GameState, now: number): TimeoutResult {
    const timeSpent = now - gameState.lastMoveTimestamp;

    if (gameState.turn === 'w' && gameState.whiteTime - timeSpent <= 0) {
      return { isTimeout: true, winner: 'b' };
    }

    if (gameState.turn === 'b' && gameState.blackTime - timeSpent <= 0) {
      return { isTimeout: true, winner: 'w' };
    }

    return { isTimeout: false };
  }

  // public getLiveState() {
  //   const now = Date.now();
  //   const timeSpent = now - this.lastMoveTimestamp;

  //   let currentWhite = this.whiteTime;
  //   let currentBlack = this.blackTime;

  //   // Subtract pending time from whomever's turn it is currently
  //   if (!this.isGameOver) {
  //     if (this.turn === 'w') currentWhite -= timeSpent;
  //     else currentBlack -= timeSpent;
  //   }

  //   return {
  //     whiteTime: Math.max(0, currentWhite),
  //     blackTime: Math.max(0, currentBlack),
  //     turn: this.turn,
  //   };
  // }
}
