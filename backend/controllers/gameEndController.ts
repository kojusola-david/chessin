import { ChessGame } from 'services/ChessGame';
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
  terminationType: Termination = 'RESIGNATION',
  id = ''
) {
  if (!session.Chessgame) return 'Game not found';
  let result: Result;
  switch (terminationType) {
    case 'CHECKMATE':
      result =
        session.Chessgame.game.turn() === 'b' ? 'WHITE_WIN' : 'BLACK_WIN';
      break;
    case 'RESIGNATION':
      result = id === session.white?.id ? 'BLACK_WIN' : 'WHITE_WIN';
      break;
    case 'TIMEOUT':
      result = id === session.white?.id ? 'WHITE_WIN' : 'BLACK_WIN';
      break;

    default:
      result = 'DRAW';
  }
  console.log(session.Chessgame.finalizeGame(result, terminationType));
  try {
    const game = await prisma.game.create({
      data: {
        roomId: roomId,
        rated: true,
        timeControl: '',
        timeClass: session.Chessgame.timeClass,
        fen: session.Chessgame?.game.fen() as string,
        pgn: session.Chessgame?.game.pgn() as string,
        whiteId: session.white!.id,
        blackId: session.black!.id,
        result: result,
        termination: terminationType,
      },
    });
    io.to(roomId).emit('gameOver', game);
  } catch (error) {
    console.log(error);
  }
}
