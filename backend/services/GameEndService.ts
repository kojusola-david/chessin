import { GameSession, GameState, GameTermination } from '@chessin/shared';
import { ChessGame } from './ChessGame';
import prisma from './Prisma';
import { Server } from 'socket.io';

export default class GameEndService {
  private static instance: GameEndService;
  private constructor() {}

  private chessGame = new ChessGame();

  public static getInstance() {
    if (!GameEndService.instance) {
      GameEndService.instance = new GameEndService();
    }
    return GameEndService.instance;
  }

  public async handleGameEnd(
    gameState: GameState,
    gameSession: GameSession,
    io: Server
  ) {
    this.chessGame.finalizeGame(gameState);
    try {
      const game = await prisma.game.create({
        data: {
          roomId: gameSession.roomId,
          rated: true,
          timeControl: 'RAPID',
          timeClass: gameState.timeClass,
          fen: gameState.fen,
          pgn: '',
          whiteId: gameSession.white.id,
          blackId: gameSession.black.id,
          result: undefined,
          termination: gameState.status,
          // TO BE FIXED
        },
      });
      io.to(gameSession.roomId).emit('gameOver', game);
    } catch (error) {
      console.log(error);
    }
  }
}
