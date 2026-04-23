/**
 * Shared board-construction helpers for vitest specs.
 *
 * `buildBoard` applies a sequence of [row, col, mark] triples on top of an
 * empty board via `placeMark`, throwing on any illegal placement. Used by
 * win-detector and AI specs that need to stage a specific board configuration.
 */
import { emptyBoard, placeMark, type BoardState, type Mark } from '../../src/core/board';

export type Placement = readonly [number, number, Mark];

export const buildBoard = (moves: ReadonlyArray<Placement>): BoardState => {
  let board: BoardState = emptyBoard();
  for (const [row, col, mark] of moves) {
    const result = placeMark(board, row, col, mark);
    if (!result.ok) throw new Error(`buildBoard: illegal placement (${result.error})`);
    board = result.value;
  }
  return board;
};
