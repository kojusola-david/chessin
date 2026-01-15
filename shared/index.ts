import { Type, Static } from '@sinclair/typebox'

export const GameStateSchema = Type.Object({
  board: Type.String(),
  turn: Type.Union([Type.Literal('w'), Type.Literal('b')])
})

export type GameState = Static<typeof GameStateSchema>