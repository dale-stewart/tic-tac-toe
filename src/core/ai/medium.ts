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

type Rng = () => number;

const opponent = (mark: Mark): Mark => (mark === 'X' ? 'O' : 'X');

const emptyCells = (state: BoardState): ReadonlyArray<readonly [number, number]> => {
  const cells: Array<readonly [number, number]> = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
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
