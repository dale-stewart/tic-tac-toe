/**
 * Pure win-detector. Given a BoardState, reports win/draw/in_progress.
 * Total function: every input maps to exactly one GameResult.
 */
import type { BoardState, Mark } from './board';

export interface Position {
  readonly row: number;
  readonly col: number;
}

export type WinLine = readonly [Position, Position, Position];

export type GameResult =
  | { readonly status: 'in_progress' }
  | { readonly status: 'won'; readonly winner: Mark; readonly line: WinLine }
  | { readonly status: 'draw' };

// Enumerate the 8 winning lines statically.
const LINES: readonly WinLine[] = [
  // Rows
  [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
  ],
  [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ],
  [
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ],
  // Columns
  [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
  ],
  [
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 2 },
    { row: 2, col: 2 },
  ],
  // Diagonals
  [
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 1 },
    { row: 2, col: 0 },
  ],
];

const cellAt = (state: BoardState, position: Position): BoardState[number][number] =>
  state[position.row]![position.col]!;

const lineWinner = (state: BoardState, line: WinLine): Mark | null => {
  const [a, b, c] = line;
  const first = cellAt(state, a);
  // Stryker disable next-line ConditionalExpression: equivalent mutant — if this early return is removed, the subsequent `!== first` checks still return null in every branch where `first === null`. No observable behavior difference.
  if (first === null) return null;
  if (cellAt(state, b) !== first) return null;
  if (cellAt(state, c) !== first) return null;
  return first;
};

export const detectWin = (state: BoardState): WinLine | null => {
  for (const line of LINES) {
    if (lineWinner(state, line) !== null) return line;
  }
  return null;
};

const isFull = (state: BoardState): boolean => {
  for (const row of state) {
    for (const cell of row) {
      if (cell === null) return false;
    }
  }
  return true;
};

export const detectDraw = (state: BoardState): boolean =>
  isFull(state) && detectWin(state) === null;

export const detectResult = (state: BoardState): GameResult => {
  for (const line of LINES) {
    const winner = lineWinner(state, line);
    if (winner !== null) {
      return { status: 'won', winner, line };
    }
  }
  if (isFull(state)) {
    return { status: 'draw' };
  }
  return { status: 'in_progress' };
};
