/**
 * Pure helpers for the announce adapter.
 *
 * Derive a screen-reader message from the diff between two GameStates.
 * DOM writes and debouncing live in announce.ts (DOM-entangled).
 */
import type { BoardState, Mark } from '../core/board';
import type { GameState } from '../core/game';

export interface DiffOptions {
  readonly rejected?: boolean;
  /** Which mark represents the human player. Defaults to 'X'. */
  readonly humanMark?: Mark;
}

// Exported for direct mutation-kill coverage; not part of the adapter's public surface.
export const findPlacement = (
  before: BoardState,
  after: BoardState,
): { readonly row: number; readonly col: number; readonly mark: Mark } | null => {
  for (let row = 0; row < 3; row += 1) {
    // Stryker disable next-line EqualityOperator: equivalent mutant — extending the bound to `col <= 3` reads after[row][3] which is `undefined`; `undefined !== null` is true but `before[row][3]` is also undefined and `undefined === null` is false, so the guard never fires. No observable difference.
    for (let col = 0; col < 3; col += 1) {
      const beforeCell = before[row]![col]!;
      const afterCell = after[row]![col]!;
      if (beforeCell === null && afterCell !== null) {
        return { row, col, mark: afterCell };
      }
    }
  }
  return null;
};

const terminalMessage = (state: GameState, humanMark: Mark): string | null => {
  if (state.result.status === 'draw') return 'Draw.';
  if (state.result.status === 'won') {
    return state.result.winner === humanMark ? 'You win.' : 'AI wins.';
  }
  return null;
};

// Exported for direct mutation-kill coverage; not part of the adapter's public surface.
export const isResetToEmpty = (before: GameState, after: GameState): boolean => {
  if (before.result.status === 'in_progress') return false;
  if (after.result.status !== 'in_progress') return false;
  return after.board.every((row) => row.every((cell) => cell === null));
};

const placementText = (before: BoardState, after: BoardState): string | null => {
  const placement = findPlacement(before, after);
  if (placement === null) return null;
  return `${placement.mark} at row ${placement.row + 1}, column ${placement.col + 1}.`;
};

// Exported for direct mutation-kill coverage; not part of the adapter's public surface.
export const combine = (prefix: string | null, suffix: string | null): string | null => {
  if (prefix !== null && suffix !== null) return `${prefix} ${suffix}`;
  return prefix ?? suffix;
};

/**
 * Build the live-region message for the transition `before -> after`.
 *
 * Returns null when there is nothing worth announcing (no diff, or a RESET
 * clearing the board). When `options.rejected` is true and the state did not
 * change, announces "Cell already taken".
 */
// Exported for direct mutation-kill coverage; not part of the adapter's public surface.
export const difficultyChangeText = (before: GameState, after: GameState): string | null => {
  if (before.difficulty === after.difficulty) return null;
  return `Difficulty: ${after.difficulty}`;
};

export const diffToMessage = (
  before: GameState,
  after: GameState,
  options: DiffOptions = {},
): string | null => {
  if (before === after) {
    return options.rejected === true ? 'Cell already taken' : null;
  }
  // Stryker disable next-line ConditionalExpression: equivalent mutant — if this guard is bypassed (`false`), the reset-to-empty case falls through to placementText (returns null: no marks were added, only removed) and terminalMessage (returns null: after is in_progress), so combine(null, null) → null. Same observable result as the original early-return.
  if (isResetToEmpty(before, after)) return null;

  const difficulty = difficultyChangeText(before, after);
  if (difficulty !== null) return difficulty;

  const humanMark: Mark = options.humanMark ?? 'X';
  return combine(placementText(before.board, after.board), terminalMessage(after, humanMark));
};
