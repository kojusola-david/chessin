import { GameRequest } from '@chessin/shared';

export default class LobbyManager {
  private static instance: LobbyManager;
  public lobby: Map<string, GameRequest> = new Map();

  private constructor() {}

  public static getInstance(): LobbyManager {
    if (!LobbyManager.instance) {
      LobbyManager.instance = new LobbyManager();
    }
    return LobbyManager.instance;
  }

  public getRequest(roomId: string): GameRequest | undefined {
    return this.lobby.get(roomId);
  }

  public createRequest(roomId: string, GameRequest: GameRequest) {
    this.lobby.set(roomId, GameRequest);
  }

  public deleteRequest(roomId: string) {
    this.lobby.delete(roomId);
  }

  public getLobby() {
    const lobbyList = [...this.lobby];
    return lobbyList;
  }
}
