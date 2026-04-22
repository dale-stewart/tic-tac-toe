/**
 * Pure game reducer. Single producer of new GameState.
 * (GameState, Action) -> GameState. Total, pure, no I/O.
 *
 * Invariants:
 *   - Invalid PLACE_MARK (OOB, filled cell, post-terminal) returns the same state reference.
 *   - RESET preserves mode and difficulty.
 *   - `result` is recomputed via detectResult after every accepted placement.
 */
import {
  emptyBoard,
  placeMark,
  type BoardState,
  type Mark,
} from './board';
import { detectResult, type GameResult } from './win-detector';

export type GameMode = 'solo' | 'hot-seat';
export type Difficulty = 'easy' | 'medium' | 'perfect';

export interface GameState {
  readonly board: BoardState;
  readonly turn: Mark;
  readonly mode: GameMode;
  readonly difficulty: Difficulty;
  readonly result: GameResult;
}

export type Action =
  | { readonly type: 'PLACE_MARK'; readonly row: number; readonly col: number }
  | { readonly type: 'RESET' };

const nextTurn = (mark: Mark): Mark => (mark === 'X' ? 'O' : 'X');

export const initialState = (): GameState => ({
  board: emptyBoard(),
  turn: 'X',
  mode: 'solo',
  difficulty: 'medium',
  result: { status: 'in_progress' },
});

const handlePlaceMark = (
  state: GameState,
  row: number,
  col: number,
): GameState => {
  // Reject moves after the game ends. Returning `state` preserves reference equality.
  if (state.result.status !== 'in_progress') return state;

  const placed = placeMark(state.board, row, col, state.turn);
  if (!placed.ok) return state;

  const nextBoard = placed.value;
  const nextResult = detectResult(nextBoard);
  return {
    board: nextBoard,
    turn: nextTurn(state.turn),
    mode: state.mode,
    difficulty: state.difficulty,
    result: nextResult,
  };
};

export const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'PLACE_MARK':
      return handlePlaceMark(state, action.row, action.col);
    case 'RESET':
      return {
        board: emptyBoard(),
        turn: 'X',
        mode: state.mode,
        difficulty: state.difficulty,
        result: { status: 'in_progress' },
      };
  }
};
