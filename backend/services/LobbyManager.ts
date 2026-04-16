import { Player, TimeClass } from "generated/client";

interface gameRequest {
  player: Player;
  timeClass: TimeClass
}

export default class LobbyManager{
    private static instance: LobbyManager;
    public lobby: Map<string, gameRequest> = new Map();

    private constructor(){}

    public static getInstance(): LobbyManager {
    if (!LobbyManager.instance) {
      LobbyManager.instance = new LobbyManager();
    }
    return LobbyManager.instance;
  }

    public getRequest(roomId: string): gameRequest | undefined {
    return this.lobby.get(roomId);
  }

    public createRequest(roomId: string, player: Player, timeClass: TimeClass){
        this.lobby.set(roomId, {player, timeClass})
    }

    public deleteRequest(roomId: string){
        this.lobby.delete(roomId)
    }

    public getLobby(){
        const lobbyList = [...this.lobby]
        return lobbyList
    }
}