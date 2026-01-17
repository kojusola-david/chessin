import { Socket, Server } from 'socket.io';
import { GameManager } from '../services/GameManager.js';
import { MoveRequestSchema } from '@chessin/shared';
import { Value } from '@sinclair/typebox/value';

export const handleMove = (socket: Socket, io: Server, payload: any) => {
    
    const { roomId, move } = payload;
    console.log("Move received for room:", roomId)
    // 1. Structural Validation (TypeBox)
    if (!Value.Check(MoveRequestSchema, move)) {
        return socket.emit('error', 'Invalid move format');
    }

    // 2. Get Game Instance from GameManager
    const gameManager = GameManager.getInstance();
    const session = gameManager.getSession(roomId);

    if (!session) {
        return socket.emit('error', 'Game not found');
    }

    // 3. Rule Validation & Execution (chess.js)
    try {
        const result = session.game.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion || 'q'
        });

        if (result) {
            // 4. Broadcast the new state
            io.to(roomId).emit('gameUpdate', {
                fen: session.game.fen(),
                history: session.game.history(),
                isCheckmate: session.game.isCheckmate(),
                isGameOver: session.game.isGameOver()
            });
            console.log('Move made');
            
        } else {
            socket.emit('error', 'Illegal chess move');
        }
    } catch (e) {
        socket.emit('error', 'Error processing move');
    }
};