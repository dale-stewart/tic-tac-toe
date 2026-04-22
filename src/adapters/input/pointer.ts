/**
 * Pointer input adapter — delegated click handler on the grid container.
 * Reads data-row / data-col from the clicked cell and dispatches PLACE_MARK.
 *
 * Pure except for the act of attaching/dispatching. The handler itself is a
 * function of (event) -> Action | null, making it trivially testable.
 */
import type { Action } from '../../core/game';

export const actionFromClick = (target: EventTarget | null): Action | null => {
  if (!(target instanceof Element)) return null;
  const cell = target.closest('[role="gridcell"]');
  if (cell === null) return null;
  const rowAttr = cell.getAttribute('data-row');
  const colAttr = cell.getAttribute('data-col');
  if (rowAttr === null || colAttr === null) return null;
  const row = Number.parseInt(rowAttr, 10);
  const col = Number.parseInt(colAttr, 10);
  if (!Number.isFinite(row) || !Number.isFinite(col)) return null;
  return { type: 'PLACE_MARK', row, col };
};

export const attachPointer = (
  root: HTMLElement,
  dispatch: (action: Action) => void,
): void => {
  root.addEventListener('click', (event) => {
    const action = actionFromClick(event.target);
    if (action !== null) dispatch(action);
  });
};
