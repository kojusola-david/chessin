import { Socket, Server } from 'socket.io';
import { GameManager } from '../services/GameManager.js';
import { MoveRequestSchema } from '@chessin/shared';
import { Value } from '@sinclair/typebox/value';
import { handleGameEnd } from './gameEndController.js';

export const handleMove = (socket: Socket, io: Server, payload: any) => {
  const { roomId, move } = payload;
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
  if (session.Chessgame)
    try {
      const result = session.Chessgame.game.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });

      if (result) {
        // 4. Broadcast the new state
        io.to(roomId).emit('gameUpdate', {
          fen: session.Chessgame.game.fen(),
          pgn: session.Chessgame.game.pgn(),
          isCheckmate: session.Chessgame.game.isCheckmate(),
          isGameOver: session.Chessgame.game.isGameOver(),
        });
        if (session.Chessgame.game.isGameOver()) {
          handleGameEnd(session, roomId, io);
        }
      } else {
        socket.emit('error', 'Illegal chess move');
      }
    } catch (e) {
      socket.emit('error', 'Error processing move');
    }
};
