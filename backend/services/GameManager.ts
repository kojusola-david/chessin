import { Chess } from 'chess.js';
import prisma from './Prisma';
import { Player } from 'generated/client';

interface GameSession {
  Chessgame?: ChessGame;
  white?: Player;
  black?: Player;
}

export class ChessGame {
  public game: Chess;
  constructor(gameData: any) {
    this.game = new Chess();
    this.game.setHeader('White', gameData.whitePlayer.username);
    this.game.setHeader('Black', gameData.blackPlayer.username);
    this.game.setHeader(
      'WhiteElo',
      gameData.whitePlayer.currentRapidRating.toString()
    );
    this.game.setHeader(
      'BlackElo',
      gameData.blackPlayer.currentRapidRating.toString()
    );
    this.game.setHeader('Variant', 'Standard');
  }

  finalizeGame(result: string, termination: string) {
    this.game.setHeader('Result', result);
    this.game.setHeader('Termination', termination);

    return this.game.pgn();
  }
}

export class GameManager {
  private static instance: GameManager;
  private sessions: Map<string, GameSession> = new Map();
  private waiting = {};
  public waitingId: string = '';

  private constructor() {}

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public getSession(roomId: string): GameSession | undefined {
    return this.sessions.get(roomId);
  }

  public createWaiting(player: Player) {
    this.waiting = player;
    this.waitingId = player.id;
  }

  public createSession(roomId: string, player: Player): GameSession {
    const newSession: GameSession = {
      white: this.waiting as Player,
      black: player,
    };
    const gameData = {
      whitePlayer: newSession.white,
      blackPlayer: newSession.black,
    };
    newSession.Chessgame = new ChessGame(gameData);
    this.sessions.set(roomId, newSession);
    this.waiting = {};
    this.waitingId = '';

    return newSession;
  }

  public getSessionByUserId(
    socketId: string
  ): { roomId: string; session: GameSession } | undefined {
    for (const [roomId, session] of this.sessions.entries()) {
      if (session.white!.id === socketId || session.black!.id === socketId) {
        return { roomId, session };
      }
    }
    return undefined;
  }

  public removeSession(roomId: string): void {
    this.sessions.delete(roomId);
  }
}
