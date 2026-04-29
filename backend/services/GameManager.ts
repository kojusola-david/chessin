import { SessionPlayer } from '@chessin/shared';
import { ChessGame } from './ChessGame';
import { TimeClass } from '../generated/client';
import LobbyManager from './LobbyManager';
import { GameRequest } from '@chessin/shared';
interface GameSession {
  game: ChessGame;
  white: SessionPlayer;
  black: SessionPlayer;
  lastActive: number;
}
interface GameData {
  startFen: string;
  white: SessionPlayer;
  black: SessionPlayer;
  timeClass: TimeClass;
}

export class GameManager {
  private static instance: GameManager;
  private sessions: Map<string, GameSession> = new Map();
  private lobbyManager = LobbyManager.getInstance();

  private constructor() {
    setInterval(() => this.cleanupStaleSessions(), 5 * 60 * 1000);
  }

  private cleanupStaleSessions() {
    const now = Date.now();
    const TIMEOUT = 30 * 60 * 1000; // 30 minutes

    for (const [id, data] of this.sessions.entries()) {
      if (now - data.lastActive > TIMEOUT) {
        this.sessions.delete(id);
        console.log(`Removed stale session: ${id}`);
      }
    }
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public getSession(roomId: string): GameSession | undefined {
    return this.sessions.get(roomId);
  }

  public getWaiting(roomId: string): GameRequest | undefined {
    return this.lobbyManager.getRequest(roomId);
  }

  public createWaiting(roomId: string, GameRequest: GameRequest) {
    this.lobbyManager.createRequest(roomId, GameRequest);
  }

  public createSession(roomId: string, player: SessionPlayer): GameSession {
    const waiting = this.lobbyManager.getRequest(roomId);
    const gameData: GameData = {
      white: waiting!.player,
      black: player,
      startFen: '',
      timeClass: waiting!.timeClass,
    };
    const newSession: GameSession = {
      game: new ChessGame(gameData),
      white: waiting!.player,
      black: player,
      lastActive: Date.now(),
    };
    this.lobbyManager.deleteRequest(roomId);

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
