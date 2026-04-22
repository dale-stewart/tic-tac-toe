/**
 * Keyboard input adapter.
 *
 * Wires the pure keyboard-pure helpers to DOM events on the grid root:
 *   - Arrow keys move focus across cells without wrapping
 *   - Enter / Space dispatch PLACE_MARK on the focused cell
 *
 * All pure logic lives in ./keyboard-pure. This module only handles DOM
 * translation (reading focused cell coords; calling focus()) and dispatch.
 */
import type { Action, GameState } from '../../core/game';
import { keyToDifficulty, keyToIntent, keyToMode, nextFocusFor } from './keyboard-pure';

const readCoord = (element: Element): readonly [number, number] | null => {
  const rowAttr = element.getAttribute('data-row');
  const colAttr = element.getAttribute('data-col');
  if (rowAttr === null || colAttr === null) return null;
  const row = Number.parseInt(rowAttr, 10);
  const col = Number.parseInt(colAttr, 10);
  if (!Number.isFinite(row) || !Number.isFinite(col)) return null;
  return [row, col];
};

const findCell = (root: HTMLElement, row: number, col: number): HTMLElement | null =>
  root.querySelector<HTMLElement>(`[data-testid="cell-${row}-${col}"]`);

const activate = (cell: Element, dispatch: (action: Action) => void): void => {
  const coord = readCoord(cell);
  if (coord === null) return;
  dispatch({ type: 'PLACE_MARK', row: coord[0], col: coord[1] });
};

const handleIntent = (
  root: HTMLElement,
  cell: Element,
  intent: NonNullable<ReturnType<typeof keyToIntent>>,
  dispatch: (action: Action) => void,
): void => {
  if (intent.kind === 'activate') {
    activate(cell, dispatch);
    return;
  }
  const from = readCoord(cell);
  if (from === null) return;
  const [nextRow, nextCol] = nextFocusFor(from, intent.direction);
  if (nextRow === from[0] && nextCol === from[1]) return;
  const nextCell = findCell(root, nextRow, nextCol);
  if (nextCell !== null) nextCell.focus();
};

export const attachKeyboard = (
  root: HTMLElement,
  dispatch: (action: Action) => void,
  getState?: () => GameState,
): void => {
  root.addEventListener('keydown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    // Global difficulty shortcuts: 1/2/3 work from anywhere on the page, but
    // not when the user is typing inside the grid (the grid consumes Enter
    // and Space — digit keys are intentionally not consumed there either,
    // but dispatching SET_DIFFICULTY from any focused element is the spec).
    const difficulty = keyToDifficulty(event.key);
    if (difficulty !== null) {
      event.preventDefault();
      dispatch({ type: 'SET_DIFFICULTY', difficulty });
      return;
    }

    // Global mode toggle: H/h flips solo <-> hot-seat from anywhere. The reducer
    // rejects mid-game as a correctness backstop, but we skip dispatch here when
    // the store hook is available — avoids noisy no-op dispatches.
    const modeSignal = keyToMode(event.key);
    if (modeSignal !== null) {
      event.preventDefault();
      if (getState !== undefined) {
        const state = getState();
        const next = state.mode === 'solo' ? 'hot-seat' : 'solo';
        dispatch({ type: 'SET_MODE', mode: next });
      }
      return;
    }

    const cell = target.closest('[role="gridcell"]');
    if (cell === null) return;

    // Normalize Space: prefer event.key; " " and "Space" both mean activate.
    const key = event.key === ' ' ? 'Space' : event.key;
    const intent = keyToIntent(key);
    if (intent === null) return;

    event.preventDefault();
    handleIntent(root, cell, intent, dispatch);
  });
};
