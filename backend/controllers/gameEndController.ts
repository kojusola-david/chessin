import { ChessGame } from 'services/GameManager';
import { Player } from 'generated/client';
import prisma from 'services/Prisma';
import { Server } from 'socket.io';

type Result = 'BLACK_WIN' | 'WHITE_WIN' | 'DRAW';
type Termination =
  | 'CHECKMATE'
  | 'TIMEOUT'
  | 'RESIGNATION'
  | 'ABANDONMENT'
  | 'AGREEMENT'
  | 'INSUFFICIENT_MATERIAL'
  | 'FIFTY_MOVE_RULE'
  | 'REPETITION'
  | 'STALEMATE';

interface GameSession {
  Chessgame?: ChessGame;
  white?: Player;
  black?: Player;
}

export async function handleGameEnd(
  session: GameSession,
  roomId: string,
  io: Server,
  isResignation = false,
  id = ''
) {
  if (!session.Chessgame) return 'Game not found';
  let termination: Termination = 'CHECKMATE';
  if (isResignation) {
    termination = 'RESIGNATION';
  }
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
  let result: Result;
  switch (termination) {
    case 'CHECKMATE':
      result =
        session.Chessgame.game.turn() === 'b' ? 'WHITE_WIN' : 'BLACK_WIN';
      break;
    case 'RESIGNATION':
      result = id === session.white?.id ? 'BLACK_WIN' : 'WHITE_WIN';
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
        result: result,
        termination: termination,
      },
    });
    io.to(roomId).emit('gameOver', game);
  } catch (error) {
    console.log(error);
  }
}
