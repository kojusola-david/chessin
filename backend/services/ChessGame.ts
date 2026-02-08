import { Chess } from 'chess.js';
import { Player } from 'generated/client';
import { TimeClass } from 'generated/client';
type PlayerColor = 'w' | 'b';
interface GameData {
  startFen: string;
  white: any;
  black: any;
  timeClass: TimeClass;
}

export class ChessGame {
  public game: Chess;
  public whiteTime: number;
  public blackTime: number;
  public lastMoveTimestamp: number;
  public turn: PlayerColor = 'w';
  public isGameOver: boolean = false;

  constructor(gameData: GameData) {
    this.game = new Chess();
    switch (gameData.timeClass) {
      case 'BLITZ':
        this.whiteTime = this.blackTime = 5 * 60 * 1000; //minutes * seconds * milliseconds
        break;
      case 'BULLET':
        this.whiteTime = this.blackTime = 1 * 60 * 1000;
        break;
      default:
        this.blackTime = this.whiteTime = 10 * 60 * 1000; //Rapid as default
    }

    this.lastMoveTimestamp = Date.now();
    this.game.setHeader('White', gameData.white.username);
    this.game.setHeader('Black', gameData.black.username);
    this.game.setHeader(
      'WhiteElo',
      gameData.white.currentRapidRating.toString()
    );
    this.game.setHeader(
      'BlackElo',
      gameData.black.currentRapidRating.toString()
    );
    this.game.setHeader('Variant', 'Standard');
  }

  finalizeGame(result: string, termination: string) {
    this.game.setHeader('Result', result);
    this.game.setHeader('Termination', termination);

    return this.game.pgn();
  }

  public makeMove(from: string, to: string) {
    if (this.isGameOver) return false;

    const now = Date.now();
    const timeSpent = now - this.lastMoveTimestamp;
    if (this.turn === 'w') {
      this.whiteTime -= timeSpent;
        console.log("White time: ", this.whiteTime);

    } else {
      this.blackTime -= timeSpent;
      console.log("Black time: ", this.blackTime);
      
    }

    this.game.move({
      from: from,
      to: to,
    });

    this.turn = this.turn === 'w' ? 'b' : 'w';
    return({
          fen: this.game.fen(),
          pgn: this.game.pgn(),
          isCheckmate: this.game.isCheckmate(),
          isGameOver: this.game.isGameOver(),
          blackTimeLeft: this.blackTime,
          whiteTimeLeft: this.whiteTime
        })
  }

  public checkTimeout() {
    const now = Date.now();
    const timeSpent = now - this.lastMoveTimestamp;

    if (this.turn === 'w' && this.whiteTime - timeSpent <= 0) {
      this.isGameOver = true;
      return { isGameOver: true, winner: 'b' };
    }

    // 3. Check Black
    if (this.turn === 'b' && this.blackTime - timeSpent <= 0) {
      this.isGameOver = true;
      return { isGameOver: true, winner: 'w' };
    }

    // 4. No timeout
    return { isGameOver: false };
  }

  public getLiveState() {
    const now = Date.now();
    const timeSpent = now - this.lastMoveTimestamp;

    let currentWhite = this.whiteTime;
    let currentBlack = this.blackTime;

    // Subtract pending time from whomever's turn it is currently
    if (!this.isGameOver) {
      if (this.turn === 'w') currentWhite -= timeSpent;
      else currentBlack -= timeSpent;
    }

    return {
      whiteTime: Math.max(0, currentWhite),
      blackTime: Math.max(0, currentBlack),
      turn: this.turn,
    };
  }
}
