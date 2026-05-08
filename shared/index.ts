import { Type, type Static } from '@sinclair/typebox';
import { Termination, type Player } from '../backend/generated/client';

/*TYPES */

// Different modules of the app require different parts of the player schema
// export type PublicPlayer = Omit<Player, 'password_hash'>;
// export type SessionPlayer = Pick<Player, 'id' | 'username'>;
// export type  GamePlayer = Pick<Player, 'id' | 'username' | 'currentRapidRating'>;

//1. Colors: White/Black
export const PlayerColorSchema = Type.Union([
  Type.Literal('w'),
  Type.Literal('b'),
]);
export type PlayerColor = Static<typeof PlayerColorSchema>;

//2. Pieces: Pawn(p), Knight(k), Bishop(b), Rook(r), Queen(q), King(k)
export const PieceTypeSchema = Type.Union([
  Type.Literal('p'),
  Type.Literal('n'),
  Type.Literal('b'),
  Type.Literal('r'),
  Type.Literal('q'),
  Type.Literal('k'),
]);
export type PieceType = Static<typeof PieceTypeSchema>;

//3. Move request from the frontend to the backend(e.g {from: e2, to: e4} )
export const MoveRequestSchema = Type.Object({
  from: Type.String({ pattern: '^[a-h][1-8]$' }),
  to: Type.String({ pattern: '^[a-h][1-8]$' }),
  promotion: Type.Optional(PieceTypeSchema),
});
export type MoveRequest = Static<typeof MoveRequestSchema>;

//4. Game state object containing the game info
// export const GameStateSchema = Type.Object({
//   fen: Type.String(), // Current board position
//   turn: PlayerColorSchema, // Whose turn it is
//   isCheck: Type.Boolean(),
//   isGameOver: Type.Boolean(),
//   history: Type.Array(Type.String()), // SAN notation (e.g., ["e4", "e5", "Nf3"])
//   lastMove: Type.Optional(MoveRequestSchema),
// });
// export type GameState = Static<typeof GameStateSchema>;

//5. Server events
// export const ServerEventSchema = Type.Union([
//   Type.Object({ type: Type.Literal('GAME_UPDATE'), payload: GameStateSchema }),
//   Type.Object({ type: Type.Literal('ERROR'), message: Type.String() }),
// ]);
// export type ServerEvent = Static<typeof ServerEventSchema>;

//6. Game result
export const GameResultSchema = Type.Union([
  Type.Literal('BLACK_WIN'),
  Type.Literal('WHITE_WIN'),
  Type.Literal('DRAW'),
]);
export type GameResult = Static<typeof GameResultSchema>;

//7. Game Termination
export const GameTerminationSchema = Type.Union([
  Type.Literal('CHECKMATE'),
  Type.Literal('TIMEOUT'),
  Type.Literal('RESIGNATION'),
  Type.Literal('ABANDONMENT'),
  Type.Literal('AGREEMENT'),
  Type.Literal('INSUFFICIENT_MATERIAL'),
  Type.Literal('FIFTY_MOVE_RULE'),
  Type.Literal('REPETITION'),
  Type.Literal('STALEMATE'),
]);

export type GameTermination = Static<typeof GameTerminationSchema>;

//8. Player Types
export const PublicPlayerSchema = Type.Object({
  name: Type.Optional(Type.String()),
  id: Type.String(),
  username: Type.String(),
  email: Type.String(),
  currentRapidRating: Type.Number(),
  currentBlitzRating: Type.Number(),
  currentBulletRating: Type.Number(),
  createdAt: Type.Date(),
});
export type PublicPlayer = Static<typeof PublicPlayerSchema>;

export const SessionPlayerSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
});
export type SessionPlayer = Static<typeof SessionPlayerSchema>;

export const GamePlayerSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
  currentRapidRating: Type.Number(),
  currentBlitzRating: Type.Number(),
  currentBulletRating: Type.Number(),
});
export type GamePlayer = Static<typeof GamePlayerSchema>;

//8. Time Class
export const TimeClassSchema = Type.Union([
    Type.Literal('BULLET'),
    Type.Literal('BLITZ'),
    Type.Literal('RAPID'),
  ]);
export type TimeClass = Static<typeof TimeClassSchema>;

//9. Game Request
export const GameRequestSchema = Type.Object({
  roomId: Type.String(),
  player: SessionPlayerSchema,
  timeClass: TimeClassSchema,
  createdAt: Type.Number(),
});
export type GameRequest = Static<typeof GameRequestSchema>;

//10. Game State
export const GameStateSchema = Type.Object({
  fen: Type.String(),
  moves: Type.Array(Type.String()),
  turn: PlayerColorSchema,
  whiteTime: Type.Number(),
  blackTime: Type.Number(),
  lastMoveTimestamp: Type.Number(),
  status: Type.Optional(GameTerminationSchema),
  winner: Type.Optional(PlayerColorSchema),
  timeClass: TimeClassSchema,
})
export type GameState = Static<typeof GameStateSchema>;

//11. Game Session
export const GameSessionSchema = Type.Object({
  roomId: Type.String(),
  white: SessionPlayerSchema,
  black: SessionPlayerSchema,
  gameState: GameStateSchema,
  lastActive: Type.Number(),
})
export type GameSession = Static<typeof GameSessionSchema>