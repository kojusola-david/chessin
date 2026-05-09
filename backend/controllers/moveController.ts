import { Socket, Server } from 'socket.io';
import MatchmakingService from '../services/MatchmakingService';
import { MoveRequestSchema } from '@chessin/shared';
import { Value } from '@sinclair/typebox/value';
import { ChessGame } from '../services/ChessGame';

const chessgame = new ChessGame();
export const handleMove = (socket: Socket, io: Server, payload: any) => {
  const { roomId, move } = payload;
  const matchmakingService = MatchmakingService.getInstance();
  const session = matchmakingService.getSession(roomId);
  if (!session) {
    return socket.emit('error', 'Game not found');
  }

  // 1. Structural Validation (TypeBox)
  if (!Value.Check(MoveRequestSchema, move)) {
    return socket.emit('error', 'Invalid move format');
  }

  // 3. Rule Validation & Execution (chess.js)
  if (session)
    try {
      const result = chessgame.makeMove(session.gameState, move);

      if (result.success) {
        // 4. Broadcast the new state
        io.to(roomId).emit('gameUpdate', result.state);
      } else {
        socket.emit('error', 'Illegal chess move');
      }
    } catch (e) {
      socket.emit('error', 'Error processing move');
    }
};
