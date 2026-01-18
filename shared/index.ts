import { Type, type Static } from '@sinclair/typebox';

/*TYPES */

//1. Colors: White/Black
export const ColorSchema = Type.Union([Type.Literal('w'), Type.Literal('b')]);
export type Color = Static<typeof ColorSchema>;

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
export const GameStateSchema = Type.Object({
  fen: Type.String(), // Current board position
  turn: ColorSchema, // Whose turn it is
  isCheck: Type.Boolean(),
  isGameOver: Type.Boolean(),
  history: Type.Array(Type.String()), // SAN notation (e.g., ["e4", "e5", "Nf3"])
  lastMove: Type.Optional(MoveRequestSchema),
});
export type GameState = Static<typeof GameStateSchema>;

//5. Server events
export const ServerEventSchema = Type.Union([
  Type.Object({ type: Type.Literal('GAME_UPDATE'), payload: GameStateSchema }),
  Type.Object({ type: Type.Literal('ERROR'), message: Type.String() }),
]);
export type ServerEvent = Static<typeof ServerEventSchema>;
