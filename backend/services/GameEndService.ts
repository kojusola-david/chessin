import prisma from './Prisma';
import { Chess } from 'chess.js';

interface GameSession {
  game: Chess;
  whiteId?: string;
  blackId?: string;
}

class gameEndService {
  private static instance: gameEndService;

  private constructor() {}

  public static getInstance(): gameEndService {
    if (!gameEndService.instance) {
      gameEndService.instance = new gameEndService();
    }
    return gameEndService.instance;
  }

  public gameEndService(
    session: GameSession,
    roomId: string,
    winnerRating: number,
    loserRating: number
  ) {
    const newWinnerRating = winnerRating + 5;
    const newLoserRating = loserRating + 5;

    const game = async () => {
      if (!session.whiteId || !session.blackId) {
        throw new Error('Cannot create a game without both player IDs.');
      }
      await prisma.game.create({
        data: {
          roomId: roomId,
          rated: true,
          timeControl: '600',
          timeClass: 'RAPID',
          fen: session.game.fen(),
          pgn: session.game.pgn(),
          whiteId: session.whiteId,
          blackId: session.blackId,
          result: 'BLACK_WIN',
          termination: 'CHECKMATE',
        },
      });
    };
  }
}
