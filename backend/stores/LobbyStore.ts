import { GameRequest } from '@chessin/shared';

export default class LobbyStore {
  private lobby: Map<string, GameRequest> = new Map();

  public getRequest(roomId: string): GameRequest | undefined {
    return this.lobby.get(roomId);
  }

  public createRequest(roomId: string, request: GameRequest): void {
    this.lobby.set(roomId, request);
  }

  public deleteRequest(roomId: string) {
    this.lobby.delete(roomId);
  }

  public getLobby(): GameRequest[] {
    return Array.from(this.lobby.values());
  }

  public has(roomId: string): boolean {
    return this.lobby.has(roomId);
  }
}
