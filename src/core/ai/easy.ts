/**
 * Easy AI — picks a uniformly random empty cell.
 * Pure when rng is provided; defaults to Math.random for the production path.
 * Signature fixed per architecture brief: (state, mark) => [row, col].
 */
import type { BoardState, Mark } from '../board';

type Rng = () => number;

const emptyCells = (state: BoardState): ReadonlyArray<readonly [number, number]> => {
  const cells: Array<readonly [number, number]> = [];
  for (let row = 0; row < 3; row += 1) {
    // Stryker disable next-line EqualityOperator: equivalent mutant — extending the bound to `col <= 3` reads state[row][3] which is `undefined`; `undefined === null` is false, so no extra cell is pushed. No observable behavior difference.
    for (let col = 0; col < 3; col += 1) {
      if (state[row]![col] === null) cells.push([row, col] as const);
    }
  }
  return cells;
};

export const chooseRandomMove = (
  state: BoardState,
  _mark: Mark,
  rng: Rng = Math.random,
): readonly [number, number] => {
  const available = emptyCells(state);
  if (available.length === 0) {
    // Should never be called on a full board; return a sentinel OOB to surface bugs.
    throw new Error('chooseRandomMove: no empty cells');
  }
  const index = Math.floor(rng() * available.length) % available.length;
  return available[index]!;
};
