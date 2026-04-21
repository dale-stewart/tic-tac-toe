/**
 * Pure board module — the core domain type and its simplest constructor.
 *
 * Slice 01 scope: types + `emptyBoard()` only. `placeMark`, `cellsRemaining`,
 * and `toReadableString` land in later slices driven by their own tests.
 *
 * Invariants:
 *   - No DOM, no browser, no I/O. Core has zero adapter imports.
 *   - BoardState is immutable (readonly at every level).
 *   - `Cell` is a closed sum: `Mark | null`, making illegal states unrepresentable.
 */

export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type BoardRow = readonly [Cell, Cell, Cell];
export type BoardState = readonly [BoardRow, BoardRow, BoardRow];

const emptyRow = (): BoardRow => [null, null, null];

export const emptyBoard = (): BoardState => [emptyRow(), emptyRow(), emptyRow()];
