type userId = String;
type socketId = String;

export class PresenceService {
  private static instance: PresenceService;
  private sessions: Map<userId, Set<socketId>> = new Map();

  private constructor() {}

  public static getInstance(): PresenceService {
    if (!PresenceService.instance) {
      PresenceService.instance = new PresenceService();
    }
    return PresenceService.instance;
  }

  public addUser(userId: string, socketId: string) {
    const existingSessions = this.sessions.get(userId);

    if (existingSessions) {
      existingSessions.add(socketId);
    } else {
      this.sessions.set(userId, new Set([socketId]));
    }
  }

  public removeUser(userId: string, socketId: string) {
    const session = this.sessions.get(userId);

    if (session) {
      session.delete(socketId);

      // Cleanup: If this was the last socket, remove the user from the Map entirely
      if (session.size === 0) {
        this.sessions.delete(userId);
      }
    }
  }

  public getUser(userId: string) {
    return this.sessions.get(userId)
  }
}
