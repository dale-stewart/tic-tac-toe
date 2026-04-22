/**
 * Pure board module — the core domain type and its operations.
 *
 * Invariants:
 *   - No DOM, no browser, no I/O. Core has zero adapter imports.
 *   - BoardState is immutable (readonly at every level).
 *   - `Cell` is a closed sum: `Mark | null`, making illegal states unrepresentable.
 *   - Errors cross the port as typed `Result<T, E>`, never thrown.
 */

export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type BoardRow = readonly [Cell, Cell, Cell];
export type BoardState = readonly [BoardRow, BoardRow, BoardRow];

// Railway-oriented: success or typed error as values.
export type Result<T, E> = { readonly ok: true; readonly value: T } | {
  readonly ok: false;
  readonly error: E;
};

export type PlacementError = 'out_of_bounds' | 'cell_taken';

const emptyRow = (): BoardRow => [null, null, null];

export const emptyBoard = (): BoardState => [emptyRow(), emptyRow(), emptyRow()];

const isInBounds = (row: number, col: number): boolean =>
  Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < 3 && col >= 0 && col < 3;

const replaceRow = (row: BoardRow, col: number, mark: Mark): BoardRow => {
  const cells: Cell[] = [row[0], row[1], row[2]];
  cells[col] = mark;
  return [cells[0]!, cells[1]!, cells[2]!] as const;
};

export const placeMark = (
  state: BoardState,
  row: number,
  col: number,
  mark: Mark,
): Result<BoardState, PlacementError> => {
  if (!isInBounds(row, col)) {
    return { ok: false, error: 'out_of_bounds' };
  }
  const targetRow = state[row]!;
  if (targetRow[col] !== null) {
    return { ok: false, error: 'cell_taken' };
  }
  const nextRow = replaceRow(targetRow, col, mark);
  const rows: BoardRow[] = [state[0], state[1], state[2]];
  rows[row] = nextRow;
  const nextState: BoardState = [rows[0]!, rows[1]!, rows[2]!] as const;
  return { ok: true, value: nextState };
};
