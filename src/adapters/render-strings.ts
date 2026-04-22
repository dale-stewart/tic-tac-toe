/**
 * Pure string helpers used by the render adapter. Split from render.ts so
 * coverage can observe them without pulling in lit-html TemplateResult
 * builders (which are exercised end-to-end via Playwright, not vitest).
 */
import type { Cell, Mark } from '../core/board';
import type { GameResult } from '../core/win-detector';

export const ANCIENT_BROWSER_MESSAGE =
  'This game needs a modern browser. Try Firefox, Chrome, Safari, or Edge.';

export const turnIndicatorText = (turn: Mark): string => `Your turn (${turn}).`;

export const ariaLabelForCell = (row: number, col: number, cell: Cell): string => {
  const contents = cell === null ? 'empty' : cell;
  return `Row ${row + 1} column ${col + 1}, ${contents}`;
};

export const cellText = (cell: Cell): string => (cell === null ? '' : cell);

export const bannerTextFor = (result: GameResult, humanMark: Mark): string | null => {
  if (result.status === 'in_progress') return null;
  if (result.status === 'draw') return 'Draw.';
  return result.winner === humanMark ? 'You win!' : 'AI wins.';
};

export type Difficulty = 'easy' | 'medium' | 'perfect';

export const DIFFICULTY_OPTIONS: readonly Difficulty[] = ['easy', 'medium', 'perfect'];

export const difficultyLabelText = (difficulty: Difficulty): string => difficulty;

export const difficultyRadioAriaLabel = (difficulty: Difficulty): string =>
  `Difficulty: ${difficulty}`;

export const difficultyGroupAriaLabel = (): string => 'Difficulty';
