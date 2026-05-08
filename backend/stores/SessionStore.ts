import { SessionPlayer, GameState, GameSession } from '@chessin/shared';
import { TimeClass } from '../generated/enums';
import { Termination } from '../generated/enums';

export default class SessionStore {
  private sessions: Map<string, GameSession> = new Map();

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

  public getSession(roomId: string): GameSession | undefined {
    return this.sessions.get(roomId);
  }

  public createSession(
    roomId: string,
    white: SessionPlayer,
    black: SessionPlayer,
    state: GameState
  ): GameSession {
    const newSession: GameSession = {
      roomId: roomId,
      white: white,
      black: black,
      lastActive: Date.now(),
      gameState: state,
    };

    this.sessions.set(roomId, newSession);
    return newSession;
  }

  public removeSession(roomId: string): void {
    this.sessions.delete(roomId);
  }

  public has(roomId: string): boolean {
    return this.sessions.has(roomId);
  }

  public getByUserId(userId: string): GameSession | undefined {
    return Array.from(this.sessions.values()).find(
      (session) => session.white.id === userId || session.black.id === userId
    );
  }
}
