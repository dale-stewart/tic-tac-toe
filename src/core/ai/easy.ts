/**
 * Easy AI — picks a uniformly random empty cell.
 * Pure when rng is provided; defaults to Math.random for the production path.
 * Signature fixed per architecture brief: (state, mark) => [row, col].
 */
import { emptyCells, type BoardState, type Mark } from '../board';

type Rng = () => number;

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
