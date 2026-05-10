import SessionStore from '../stores/SessionStore';
import { GameSession, SessionPlayer, GameState } from '@chessin/shared';

export default class GameSessionService {
  private static instance: GameSessionService;

  private constructor(private sessions: SessionStore) {}

  public static getInstance() {
    if (!GameSessionService.instance) {
      const sessions = new SessionStore();
      GameSessionService.instance = new GameSessionService(sessions);
    }
    return GameSessionService.instance;
  }

  public createSession(
    roomId: string,
    white: SessionPlayer,
    black: SessionPlayer,
    state: GameState
  ): GameSession {
    const newSession = this.sessions.createSession(roomId, white, black, state);
    return newSession;
  }

  public getSession(roomId: string): GameSession | undefined {
    return this.sessions.getSession(roomId);
  }

  public removeSession(roomId: string): void {
    this.sessions.removeSession(roomId);
  }
  public has(roomId: string): boolean {
    return this.sessions.has(roomId);
  }
  public getSessionByUserId(userId: string): GameSession | undefined {
    return this.sessions.getByUserId(userId);
  }
}
