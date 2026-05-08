import { GameRequest, GameSession, SessionPlayer, TimeClass, GameState } from '@chessin/shared';
import LobbyStore from '../stores/LobbyStore';
import SessionStore from '../stores/SessionStore';
import { nanoid } from 'nanoid';


export default class MatchmakingService{
    private static instance: MatchmakingService;

    private constructor(
        private lobby: LobbyStore,
        private sessions: SessionStore
    ) {}
    public static getInstance(){
        if(!MatchmakingService.instance){
            const lobby = new LobbyStore;
            const sessions = new SessionStore;
            MatchmakingService.instance = new MatchmakingService(lobby, sessions);
        }
        return MatchmakingService.instance;
    }

    //Game request functions
    public createGameRequest(player: SessionPlayer, timeClass: TimeClass): GameRequest{
        const existingRequest = this.getRequestByPlayerId(player.id);
        if (existingRequest) return existingRequest;

        const existingSession = this.sessions.getByUserId(player.id);
        if (existingSession) throw new Error('Player already in a game');

        const roomId = nanoid(6);
        const gameRequest = {
            roomId: roomId,
            player: player,
            timeClass: timeClass,
            createdAt: Date.now(),
        }
        this.lobby.createRequest(roomId, gameRequest);
        return gameRequest;
    }

    public acceptRequest(roomId: string, player: SessionPlayer): GameSession | undefined{
        const request = this.lobby.getRequest(roomId);
        
        if(request){
            if (request.player.id === player.id) throw new Error('Cannot join your own request');
            const gameState: GameState = {
            timeClass: 'RAPID',
            fen: '',
            moves: [],
            turn: 'w',
            whiteTime: 10 * 60 * 1000,
            blackTime: 10 * 60 * 1000,
            lastMoveTimestamp: Date.now(),
        }
        const gameSession = this.sessions.createSession(roomId, request.player, player, gameState);
        this.lobby.deleteRequest(roomId);
        return gameSession;
        }
    }

    public cancelRequest(roomId: string): void {
        this.lobby.deleteRequest(roomId);
    }

    public getRequestByPlayerId(playerId: string): GameRequest | undefined {
        return this.lobby.getLobby()
            .find(request => request.player.id === playerId);
    }
}