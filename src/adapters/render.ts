/**
 * Render adapter — pure function from view model to a lit-html TemplateResult.
 *
 * Contract:
 *   - No DOM access, no fetch, no schedule — only template construction.
 *   - Inputs (BoardState plus UI-level view data) are read-only.
 *   - Output is a TemplateResult; applying it is the caller's job (bootstrap).
 *
 * Pure string helpers live in ./render-strings (unit-tested separately);
 * this file only holds TemplateResult builders (exercised via Playwright).
 */
import { html, type TemplateResult, nothing } from 'lit-html';
import type { BoardState, Cell, Mark } from '../core/board';
import type { GameResult } from '../core/win-detector';
import {
  ANCIENT_BROWSER_MESSAGE,
  ariaLabelForCell,
  bannerTextFor,
  cellText,
  difficultyGroupAriaLabel,
  difficultyLabelText,
  difficultyRadioAriaLabel,
  DIFFICULTY_OPTIONS,
  MODE_OPTIONS,
  modeGroupAriaLabel,
  modeLabelText,
  modeRadioAriaLabel,
  turnIndicatorText,
} from './render-strings';

export {
  ANCIENT_BROWSER_MESSAGE,
  ariaLabelForCell,
  bannerTextFor,
  cellText,
  turnIndicatorText,
} from './render-strings';

export type GameMode = 'solo' | 'hot-seat';
export type Difficulty = 'easy' | 'medium' | 'perfect';

export interface RenderView {
  readonly board: BoardState;
  readonly turn: Mark;
  readonly mode: GameMode;
  readonly difficulty: Difficulty;
  readonly difficultyDisabled: boolean;
  readonly modeDisabled: boolean;
  readonly result: GameResult;
}

const renderCell = (row: number, col: number, cell: Cell): TemplateResult => html`
  <div
    role="gridcell"
    data-row=${row}
    data-col=${col}
    data-testid="cell-${row}-${col}"
    aria-label=${ariaLabelForCell(row, col, cell)}
    tabindex="0"
  >
    ${cellText(cell)}
  </div>
`;

const renderRow = (row: number, cells: readonly Cell[]): TemplateResult => html`
  <div role="row">${cells.map((cell, col) => renderCell(row, col, cell))}</div>
`;

const renderBanner = (
  result: GameResult,
  humanMark: Mark,
  mode: GameMode,
): TemplateResult | typeof nothing => {
  const text = bannerTextFor(result, humanMark, mode);
  if (text === null) return nothing;
  return html`
    <div data-testid="result-banner" class="result-banner" role="status" aria-live="polite">
      ${text}
    </div>
    <button data-testid="play-again" class="play-again" type="button">Play again</button>
  `;
};

const renderDifficultyRadio = (
  option: Difficulty,
  selected: Difficulty,
  disabled: boolean,
): TemplateResult => html`
  <div
    role="radio"
    data-testid="difficulty-${option}"
    data-difficulty-option=${option}
    aria-checked=${option === selected ? 'true' : 'false'}
    aria-disabled=${disabled ? 'true' : 'false'}
    aria-label=${difficultyRadioAriaLabel(option)}
    tabindex=${option === selected ? '0' : '-1'}
  >
    ${difficultyLabelText(option)}
  </div>
`;

const renderDifficultyGroup = (selected: Difficulty, disabled: boolean): TemplateResult => html`
  <div
    role="radiogroup"
    class="segmented-control difficulty-group"
    data-testid="difficulty-group"
    aria-label=${difficultyGroupAriaLabel()}
    aria-disabled=${disabled ? 'true' : 'false'}
  >
    ${DIFFICULTY_OPTIONS.map((option) => renderDifficultyRadio(option, selected, disabled))}
  </div>
`;

const renderModeRadio = (
  option: GameMode,
  selected: GameMode,
  disabled: boolean,
): TemplateResult => html`
  <div
    role="radio"
    data-testid="mode-${option}"
    data-mode-option=${option}
    aria-checked=${option === selected ? 'true' : 'false'}
    aria-disabled=${disabled ? 'true' : 'false'}
    aria-label=${modeRadioAriaLabel(option)}
    tabindex=${option === selected ? '0' : '-1'}
  >
    ${modeLabelText(option)}
  </div>
`;

const renderModeGroup = (selected: GameMode, disabled: boolean): TemplateResult => html`
  <div
    role="radiogroup"
    class="segmented-control mode-group"
    data-testid="mode-group"
    aria-label=${modeGroupAriaLabel()}
    aria-disabled=${disabled ? 'true' : 'false'}
  >
    ${MODE_OPTIONS.map((option) => renderModeRadio(option, selected, disabled))}
  </div>
`;

export const renderBoard = (view: RenderView): TemplateResult => html`
  <section class="game-shell">
    <div class="controls-row">
      ${renderModeGroup(view.mode, view.modeDisabled)}
      ${renderDifficultyGroup(view.difficulty, view.difficultyDisabled)}
    </div>
    <p data-testid="turn-indicator" class="turn-indicator" aria-live="polite">
      ${turnIndicatorText(view.turn, view.mode)}
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
    ${renderBanner(view.result, 'X', view.mode)}
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
