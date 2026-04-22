/**
 * Shared Playwright helpers for driving the app via the exposed __store hook.
 * Centralized to avoid duplication across walking-skeleton, keyboard-aria,
 * and a11y specs (jscpd threshold 5%).
 */
import type { Page } from '@playwright/test';

/**
 * Seed the game store with a sequence of PLACE_MARK actions.
 * Caller passes moves as [row, col] tuples.
 */
export const seedMoves = async (
  page: Page,
  moves: readonly (readonly [number, number])[],
): Promise<void> => {
  await page.evaluate((xs) => {
    const store = (window as unknown as { __store?: unknown }).__store as
      | { dispatch: (action: unknown) => void }
      | undefined;
    if (!store) throw new Error('store not exposed');
    for (const [row, col] of xs) {
      store.dispatch({ type: 'PLACE_MARK', row, col });
    }
  }, moves);
};
