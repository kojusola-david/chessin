import { ChessGame } from 'services/GameManager';
import { Player } from 'generated/client';
import prisma from 'services/Prisma';
import { Server } from 'socket.io';

interface GameSession {
  Chessgame?: ChessGame;
  white?: Player;
  black?: Player;
}

export async function handleGameEnd(
  session: GameSession,
  roomId: string,
  io: Server
) {
  if (!session.Chessgame) return 'Game not found';
  let termination: string = '';
  if (session.Chessgame.game.isCheckmate()) {
    termination = 'CHECKMATE';
  } else if (session.Chessgame.game.isInsufficientMaterial()) {
    termination = 'INSUFFICIENT_MATERIAL';
  } else if (session.Chessgame.game.isDrawByFiftyMoves()) {
    termination = 'FIFTY_MOVE_RULE';
  } else if (session.Chessgame.game.isThreefoldRepetition()) {
    termination = 'REPETITION';
  } else if (session.Chessgame.game.isStalemate()) {
    termination = 'STALEMATE';
  }
  let result;
  switch (termination) {
    case 'CHECKMATE':
      result =
        session.Chessgame.game.turn() === 'b' ? 'WHITE_WIN' : 'BLACK_WIN';
      break;
    default:
      result = 'DRAW';
  }
  console.log(session.Chessgame.finalizeGame(result, termination));
  try {
    const game = await prisma.game.create({
      data: {
        roomId: roomId,
        rated: true,
        timeControl: '600',
        timeClass: 'RAPID',
        fen: session.Chessgame?.game.fen() as string,
        pgn: session.Chessgame?.game.pgn() as string,
        whiteId: session.white!.id,
        blackId: session.black!.id,
        result: 'BLACK_WIN',
        termination: 'CHECKMATE',
      },
    });
    io.to(roomId).emit('gameOver', game);
  } catch (error) {
    console.log(error);
  }
}
