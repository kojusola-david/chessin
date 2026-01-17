import { Color, GameState, MoveRequest, ServerEvent, PieceType } from '@chessin/shared';
import { Chess } from 'chess.js';

interface GameSession {
    game: Chess;
    whiteId?: string;
    blackId?: string;
}

export class GameManager {
    private static instance: GameManager;
    private games: Map<string, GameSession> = new Map();

    private constructor() {} // Prevents direct construction

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public getSession(roomId: string): GameSession | undefined {
        return this.games.get(roomId);
    }

    public createSession(roomId: string, whiteSocketId: string): GameSession {
        const newSession: GameSession ={
            game: new Chess,
            whiteId: whiteSocketId,
        };
        this.games.set(roomId, newSession);
        return newSession;
    }

    public joinGame(roomId: string, socketId: string): GameSession | undefined {
    const session = this.getSession(roomId);
    
    if (session) {
        // 1. Prevent the White player from also becoming the Black player
        if (session.whiteId === socketId) {
            return session; 
        }

        // 2. Assign Black only if the seat is empty
        if (!session.blackId) {
            session.blackId = socketId;
            console.log(`Player ${socketId} joined as Black in room ${roomId}`);
        }
        
        // 3. If someone else joins now, they are just a spectator
        return session;
    }
    return undefined;
}

    public getSessionBySocketId(socketId: string): { roomId: string, session: GameSession } | undefined {
        for (const [roomId, session] of this.games.entries()) {
            if (session.whiteId === socketId || session.blackId === socketId) {
                return { roomId, session };
            }
        }
        return undefined;
    }

    public removeSession(roomId: string): void {
        this.games.delete(roomId);
    }
}