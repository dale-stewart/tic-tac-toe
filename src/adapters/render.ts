/**
 * Render adapter — pure function from domain state to a lit-html TemplateResult.
 *
 * Contract:
 *   - No DOM access, no fetch, no schedule — only template construction.
 *   - Inputs (BoardState plus UI-level view data) are read-only.
 *   - Output is a TemplateResult; applying it is the caller's job (bootstrap).
 *
 * Slice 01 scope: empty-grid render + turn indicator + ancient-browser fallback
 * branch. Click/keyboard handlers land in slice 01-03.
 */
import { html, type TemplateResult, nothing } from 'lit-html';
import type { BoardState, Mark } from '../core/board';

export const ANCIENT_BROWSER_MESSAGE =
  'This game needs a modern browser. Try Firefox, Chrome, Safari, or Edge.';

export type GameMode = 'solo' | 'hot-seat';
export type Difficulty = 'easy' | 'medium' | 'perfect';

export interface RenderView {
  readonly board: BoardState;
  readonly turn: Mark;
  readonly mode: GameMode;
  readonly difficulty: Difficulty;
}

const turnIndicatorText = (turn: Mark): string => `Your turn (${turn}).`;

const ariaLabelForCell = (row: number, col: number): string =>
  `Row ${row + 1} column ${col + 1}, empty`;

const renderCell = (row: number, col: number): TemplateResult => html`
  <div
    role="gridcell"
    data-row=${row}
    data-col=${col}
    data-testid="cell-${row}-${col}"
    aria-label=${ariaLabelForCell(row, col)}
    tabindex="-1"
  ></div>
`;

const renderRow = (row: number, cells: readonly unknown[]): TemplateResult => html`
  <div role="row">${cells.map((_cell, col) => renderCell(row, col))}</div>
`;

export const renderBoard = (view: RenderView): TemplateResult => html`
  <section class="game-shell">
    <p data-testid="turn-indicator" class="turn-indicator" aria-live="polite">
      ${turnIndicatorText(view.turn)}
    </p>
    <div
      role="grid"
      class="board"
      aria-label="Tic-tac-toe board"
      data-mode=${view.mode}
      data-difficulty=${view.difficulty}
    >
      ${view.board.map((row, rowIndex) => renderRow(rowIndex, row))}
    </div>
  </section>
`;

export const renderAncientBrowserFallback = (): TemplateResult => html`
  <section
    class="ancient-browser-fallback"
    data-testid="ancient-browser-fallback"
    role="alert"
    aria-live="assertive"
  >
    ${ANCIENT_BROWSER_MESSAGE}
  </section>
`;

// `nothing` sentinel export — future slices may compose conditional branches.
export const _emptyTemplate = nothing;
