import { Socket, Server } from 'socket.io';
import { GameManager } from '../services/GameManager.js';
import { MoveRequestSchema } from '@chessin/shared';
import { Value } from '@sinclair/typebox/value';
import { handleGameEnd } from './gameEndController.js';

export const handleMove = (
  socket: Socket,
  io: Server,
  payload: any,
  termination = ''
) => {
  const { roomId, move } = payload;
  const gameManager = GameManager.getInstance();
  const session = gameManager.getSession(roomId);
  if (!session) {
    return socket.emit('error', 'Game not found');
  }
  if (termination === 'TIMEOUT') {
    let result = session.Chessgame?.checkTimeout();
    if (result?.isGameOver) {
      let winner =
        result.winner === 'w' ? session.white?.id : session.black?.id;
      handleGameEnd(session, roomId, io, 'TIMEOUT', winner);
    }
  }
  if (termination === 'RESIGNATION') {
    handleGameEnd(session, roomId, io, 'RESIGNATION', socket.id);
  }

  // 1. Structural Validation (TypeBox)
  if (!Value.Check(MoveRequestSchema, move)) {
    return socket.emit('error', 'Invalid move format');
  }

  // 3. Rule Validation & Execution (chess.js)
  if (session.Chessgame)
    try {
      const result = session.Chessgame.makeMove(move.from, move.to);

      if (result) {
        // 4. Broadcast the new state
        io.to(roomId).emit('gameUpdate', result);
        if (result.isCheckmate) {
          handleGameEnd(session, roomId, io, 'CHECKMATE');
        }
      } else {
        socket.emit('error', 'Illegal chess move');
      }
    } catch (e) {
      socket.emit('error', 'Error processing move');
    }
};
