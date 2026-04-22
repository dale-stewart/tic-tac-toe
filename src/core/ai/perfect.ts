/**
 * Perfect AI — minimax with memoization over the canonical board string.
 *
 * Guarantees: from any legal in-progress position it never loses. Returns
 * [row, col] for the optimal move; ties are broken deterministically by
 * scanning in row-major order so tests are stable.
 *
 * Signature matches the shared AiFn port (state, mark, rng?) => [row, col].
 * rng is accepted but unused (determinism is the whole point).
 */
import { placeMark, type BoardState, type Mark } from '../board';
import { detectResult } from '../win-detector';

type Rng = () => number;

// Exported for direct mutation-kill coverage; not part of the adapter's public surface.
export const opponent = (mark: Mark): Mark => (mark === 'X' ? 'O' : 'X');

// 9-character board key: 'X' / 'O' / '-' per cell in row-major order.
// Kept internal; exported only for direct test coverage of the encoder.
export const boardKey = (state: BoardState, toPlay: Mark): string => {
  let key = '';
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const cell = state[row]![col];
      key += cell === null ? '-' : cell;
    }
  }
  return `${key}|${toPlay}`;
};

// Scores from the perspective of `maximizer`.
//   +1 = maximizer wins, 0 = draw, -1 = maximizer loses.
interface Evaluation {
  readonly score: number;
  readonly move: readonly [number, number] | null;
}

const emptyCellsRowMajor = (state: BoardState): ReadonlyArray<readonly [number, number]> => {
  const cells: Array<readonly [number, number]> = [];
  for (let row = 0; row < 3; row += 1) {
    // Stryker disable next-line EqualityOperator: equivalent mutant — iterating col to 3 reads state[row][3] which is undefined; undefined === null is false, so no extra cell is pushed. Matches the pattern already annotated in easy.ts and announce-strings.ts.
    for (let col = 0; col < 3; col += 1) {
      // Stryker disable next-line ConditionalExpression: equivalent mutant — if the guard is bypassed (`true`) the list would include filled cells, but minimax's downstream placeMark returns !ok for filled cells and `continue`s, so the chosen move is unchanged.
      if (state[row]![col] === null) cells.push([row, col] as const);
    }
  }
  return cells;
};

const terminalEvaluation = (state: BoardState, maximizer: Mark): Evaluation | null => {
  const result = detectResult(state);
  if (result.status === 'won') {
    return { score: result.winner === maximizer ? 1 : -1, move: null };
  }
  if (result.status === 'draw') return { score: 0, move: null };
  return null;
};

// Exported for direct mutation-kill coverage; not part of the adapter's public surface.
export const pickBetter = (
  current: Evaluation,
  candidate: Evaluation,
  move: readonly [number, number],
  isMaxTurn: boolean,
): Evaluation => {
  const better = isMaxTurn ? candidate.score > current.score : candidate.score < current.score;
  return better ? { score: candidate.score, move } : current;
};

export type { Evaluation };

const minimax = (
  state: BoardState,
  toPlay: Mark,
  maximizer: Mark,
  cache: Map<string, Evaluation>,
): Evaluation => {
  const key = boardKey(state, toPlay);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const terminal = terminalEvaluation(state, maximizer);
  if (terminal !== null) {
    cache.set(key, terminal);
    return terminal;
  }

  const isMaxTurn = toPlay === maximizer;
  let best: Evaluation = { score: isMaxTurn ? -Infinity : Infinity, move: null };

  for (const [row, col] of emptyCellsRowMajor(state)) {
    const placed = placeMark(state, row, col, toPlay);
    if (!placed.ok) continue;
    const child = minimax(placed.value, opponent(toPlay), maximizer, cache);
    best = pickBetter(best, child, [row, col] as const, isMaxTurn);
  }

  cache.set(key, best);
  return best;
};

export const choosePerfectMove = (
  state: BoardState,
  mark: Mark,
  _rng: Rng = Math.random,
): readonly [number, number] => {
  const cache = new Map<string, Evaluation>();
  const result = minimax(state, mark, mark, cache);
  if (result.move === null) {
    throw new Error('choosePerfectMove: no legal move (board terminal or full)');
  }
  return result.move;
};
