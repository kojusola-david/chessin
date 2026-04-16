import { Chess } from 'chess.js';
import prisma from './Prisma';
import { Player } from 'generated/client';
import { ChessGame } from './ChessGame';
import { TimeClass } from 'generated/client';
import LobbyManager from './LobbyManager';
interface GameSession {
  Chessgame?: ChessGame;
  white?: Player;
  black?: Player;
}
interface GameData {
  startFen: string;
  white: Player;
  black: Player;
  timeClass: TimeClass;
}

interface session {
  GameSession: GameSession;
  lastActive: number;
}

interface gameReq {
  player: Player;
  timeClass: TimeClass
}


export class GameManager {
  private static instance: GameManager;
  private sessions: Map<string, session> = new Map();
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
    return this.sessions.get(roomId)?.GameSession;
  }

  public getWaiting(roomId: string): gameReq | undefined {
    return this.lobbyManager.getRequest(roomId);
  }

  public createWaiting(roomId: string, player: Player, timeClass: TimeClass) {
    this.lobbyManager.createRequest(roomId, player, timeClass)
  }

  public createSession(roomId: string, player: Player): GameSession {
    const waiting = this.lobbyManager.getRequest(roomId)
      const gameData: GameData = {
      white: waiting!.player,
      black: player,
      startFen: '',
      timeClass: waiting!.timeClass
    }; 
      const newSession: GameSession = {
      Chessgame: new ChessGame(gameData),
      white: waiting!.player,
      black: player,
    }
    
    this.sessions.set(roomId, {
      GameSession: newSession,
      lastActive: Date.now(),
    });
    this.lobbyManager.deleteRequest(roomId);

    return newSession;
  }

  public getSessionByUserId(
    socketId: string
  ): { roomId: string; session: session } | undefined {
    for (const [roomId, session] of this.sessions.entries()) {
      if (
        session.GameSession.white!.id === socketId ||
        session.GameSession.black!.id === socketId
      ) {
        return { roomId, session };
      }
    }
    return undefined;
  }

  public removeSession(roomId: string): void {
    this.sessions.delete(roomId);
  }
}
