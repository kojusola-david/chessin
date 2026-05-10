import {
  GameRequest,
  GameSession,
  SessionPlayer,
  TimeClass,
  GameState,
} from '@chessin/shared';
import LobbyStore from '../stores/LobbyStore';
import { nanoid } from 'nanoid';
import GameSessionService from './GameSessionService';

export default class MatchmakingService {
  private static instance: MatchmakingService;

  private gameSessionService = GameSessionService.getInstance();
  private constructor(private lobby: LobbyStore) {}
  public static getInstance() {
    if (!MatchmakingService.instance) {
      const lobby = new LobbyStore();
      MatchmakingService.instance = new MatchmakingService(lobby);
    }
    return MatchmakingService.instance;
  }

  //Game request functions
  public createGameRequest(
    player: SessionPlayer,
    timeClass: TimeClass
  ): GameRequest {
    const existingRequest = this.getRequestByPlayerId(player.id);
    if (existingRequest) return existingRequest;

    const existingSession = this.gameSessionService.getSessionByUserId(
      player.id
    );
    if (existingSession) throw new Error('Player already in a game');

    const roomId = nanoid(6);
    const gameRequest = {
      roomId: roomId,
      player: player,
      timeClass: timeClass,
      createdAt: Date.now(),
    };
    this.lobby.createRequest(roomId, gameRequest);
    return gameRequest;
  }

  public acceptRequest(
    roomId: string,
    player: SessionPlayer
  ): GameSession | undefined {
    const request = this.lobby.getRequest(roomId);

    if (request) {
      if (request.player.id === player.id)
        throw new Error('Cannot join your own request');
      const gameState: GameState = {
        timeClass: 'RAPID',
        fen: '',
        moves: [],
        turn: 'w',
        whiteTime: 10 * 60 * 1000,
        blackTime: 10 * 60 * 1000,
        lastMoveTimestamp: Date.now(),
      };
      const gameSession = this.gameSessionService.createSession(
        roomId,
        request.player,
        player,
        gameState
      );
      this.lobby.deleteRequest(roomId);
      return gameSession;
    }
  }

  public cancelRequest(roomId: string): void {
    this.lobby.deleteRequest(roomId);
  }

  public getRequestByPlayerId(playerId: string): GameRequest | undefined {
    return this.lobby
      .getLobby()
      .find((request) => request.player.id === playerId);
  }

  public getActiveRequests(): GameRequest[] {
    return this.lobby.getLobby();
  }
}
