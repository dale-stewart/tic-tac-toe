/**
 * Pure string helpers used by the render adapter. Split from render.ts so
 * coverage can observe them without pulling in lit-html TemplateResult
 * builders (which are exercised end-to-end via Playwright, not vitest).
 */
import type { Cell, Mark } from '../core/board';
import type { GameResult, WinLine } from '../core/win-detector';

export const ANCIENT_BROWSER_MESSAGE =
  'This game needs a modern browser. Try Firefox, Chrome, Safari, or Edge.';

export type GameMode = 'solo' | 'hot-seat';

// P1 always plays X, P2 always plays O. Mapping is pure view-layer vocabulary;
// the core reducer never knows about P1/P2.
const hotSeatPlayerLabel = (turn: Mark): string => (turn === 'X' ? 'P1' : 'P2');

export const turnIndicatorText = (turn: Mark, mode: GameMode = 'solo'): string =>
  mode === 'hot-seat' ? `${hotSeatPlayerLabel(turn)}'s turn (${turn}).` : `Your turn (${turn}).`;

export const ariaLabelForCell = (row: number, col: number, cell: Cell): string => {
  const contents = cell === null ? 'empty' : cell;
  return `Row ${row + 1} column ${col + 1}, ${contents}`;
};

export const cellText = (cell: Cell): string => (cell === null ? '' : cell);

export const bannerTextFor = (
  result: GameResult,
  humanMark: Mark,
  mode: GameMode = 'solo',
): string | null => {
  if (result.status === 'in_progress') return null;
  if (result.status === 'draw') return 'Draw.';
  if (mode === 'hot-seat') {
    return `${hotSeatPlayerLabel(result.winner)} wins!`;
  }
  return result.winner === humanMark ? 'You win!' : 'AI wins.';
};

export type Difficulty = 'easy' | 'medium' | 'perfect';

export const DIFFICULTY_OPTIONS: readonly Difficulty[] = ['easy', 'medium', 'perfect'];

export const difficultyLabelText = (difficulty: Difficulty): string => difficulty;

export const difficultyRadioAriaLabel = (difficulty: Difficulty): string =>
  `Difficulty: ${difficulty}`;

export const difficultyGroupAriaLabel = (): string => 'Difficulty';

export const MODE_OPTIONS: readonly GameMode[] = ['solo', 'hot-seat'];

// Display label capitalizes the literal mode name: 'solo' → 'Solo', 'hot-seat' → 'Hot-seat'.
export const modeLabelText = (mode: GameMode): string => (mode === 'solo' ? 'Solo' : 'Hot-seat');

export const modeRadioAriaLabel = (mode: GameMode): string => `Mode: ${mode}`;

export const modeGroupAriaLabel = (): string => 'Mode';

// ─── Slice 07 — no-ads footer + source link ────────────────────────────────
// Footer copy is static product-trust text. Keeping it as a pure helper keeps
// render.ts free of magic strings and gives the value one source of truth.
export const footerCopy = (): string => 'No ads. No signup. No tracking.';

export const sourceLinkLabel = (): string => '[source]';

export const SOURCE_REPO_URL = 'https://github.com/dale-stewart/tic-tac-toe';

// ─── Slice 06 — winning-line geometry ──────────────────────────────────────
// Maps a WinLine (3 cell positions) to SVG endpoint coordinates in a unit
// grid where each cell spans 1×1 and centers sit at (col+0.5, row+0.5). The
// SVG consumer uses `viewBox="0 0 3 3"` and `preserveAspectRatio="none"` so
// the same coordinates scale to whatever the rendered board size is — no JS
// reflow math, no dependency on --cell-size.
export interface WinLineEndpoints {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export const winLineEndpoints = (line: WinLine): WinLineEndpoints => {
  const [first, , third] = line;
  return {
    x1: first.col + 0.5,
    y1: first.row + 0.5,
    x2: third.col + 0.5,
    y2: third.row + 0.5,
  };
};
