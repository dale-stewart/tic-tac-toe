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

const findPlacement = (
  before: BoardState,
  after: BoardState,
): { readonly row: number; readonly col: number; readonly mark: Mark } | null => {
  for (let row = 0; row < 3; row += 1) {
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

const isResetToEmpty = (before: GameState, after: GameState): boolean => {
  if (before.result.status === 'in_progress') return false;
  if (after.result.status !== 'in_progress') return false;
  return after.board.every((row) => row.every((cell) => cell === null));
};

const placementText = (before: BoardState, after: BoardState): string | null => {
  const placement = findPlacement(before, after);
  if (placement === null) return null;
  return `${placement.mark} at row ${placement.row + 1}, column ${placement.col + 1}.`;
};

const combine = (prefix: string | null, suffix: string | null): string | null => {
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
export const diffToMessage = (
  before: GameState,
  after: GameState,
  options: DiffOptions = {},
): string | null => {
  if (before === after) {
    return options.rejected === true ? 'Cell already taken' : null;
  }
  if (isResetToEmpty(before, after)) return null;

  const humanMark: Mark = options.humanMark ?? 'X';
  return combine(placementText(before.board, after.board), terminalMessage(after, humanMark));
};
