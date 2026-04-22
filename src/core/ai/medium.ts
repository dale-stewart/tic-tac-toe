/**
 * Medium AI — one-ply lookahead: win > block > random.
 *
 * Shares signature (state, mark, rng?) => [row, col] with easy and perfect.
 * Pure: given the same (state, mark, rng), returns the same move. The optional
 * rng lets tests assert deterministic random-fallback selection while the
 * production path defaults to Math.random.
 */
import { placeMark, type BoardState, type Mark } from '../board';
import { detectWin } from '../win-detector';
import { chooseRandomMove } from './easy';
import { opponent } from './perfect';

type Rng = () => number;

const emptyCells = (state: BoardState): ReadonlyArray<readonly [number, number]> => {
  const cells: Array<readonly [number, number]> = [];
  for (let row = 0; row < 3; row += 1) {
    // Stryker disable next-line EqualityOperator: equivalent mutant — col<=3 reads state[row][3]=undefined; undefined === null is false, no extra push. Matches pattern already annotated elsewhere.
    for (let col = 0; col < 3; col += 1) {
      // Stryker disable next-line ConditionalExpression: equivalent mutant — if guard is bypassed (`true`) filled cells get included, but findWinningMove's downstream placeMark returns !ok and continues; no observable difference in selected move.
      if (state[row]![col] === null) cells.push([row, col] as const);
    }
  }
  return cells;
};

// Exported for direct mutation-kill coverage; not part of the adapter's public surface.
export const findWinningMove = (
  state: BoardState,
  mark: Mark,
): readonly [number, number] | null => {
  for (const [row, col] of emptyCells(state)) {
    const placed = placeMark(state, row, col, mark);
    if (!placed.ok) continue;
    if (detectWin(placed.value) !== null) return [row, col] as const;
  }
  return null;
};

export const chooseMediumMove = (
  state: BoardState,
  mark: Mark,
  rng: Rng = Math.random,
): readonly [number, number] => {
  // Win.
  const winning = findWinningMove(state, mark);
  if (winning !== null) return winning;
  // Block.
  const blocking = findWinningMove(state, opponent(mark));
  if (blocking !== null) return blocking;
  // Random legal move.
  return chooseRandomMove(state, mark, rng);
};
