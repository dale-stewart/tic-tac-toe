/**
 * Announce adapter — writes transition messages to the ARIA live region.
 *
 * Owns all writes to #announce. Pure string derivation lives in
 * ./announce-strings (unit-tested via vitest). This module is DOM-entangled
 * and covered by Playwright.
 *
 * Debounce: collapses rapid bursts of transitions (e.g. a human move followed
 * by an immediate AI response) so that each message is audible, without
 * dropping the intermediate announcement.
 */
import type { GameState } from '../core/game';
import { diffToMessage, type DiffOptions } from './announce-strings';

export interface AnnounceAdapter {
  readonly announce: (before: GameState, after: GameState, options?: DiffOptions) => void;
  readonly announceRaw: (message: string) => void;
}

const DEFAULT_DEBOUNCE_MS = 150;

export const createAnnouncer = (
  liveRegion: HTMLElement,
  debounceMs: number = DEFAULT_DEBOUNCE_MS,
): AnnounceAdapter => {
  let queue: string[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = (): void => {
    if (queue.length === 0) return;
    // Concatenate pending messages so the 1s SLA never drops one.
    liveRegion.textContent = queue.join(' ');
    queue = [];
    timer = null;
  };

  const schedule = (): void => {
    if (timer !== null) return;
    timer = setTimeout(flush, debounceMs);
  };

  const announceRaw = (message: string): void => {
    if (message.length === 0) return;
    queue.push(message);
    schedule();
  };

  const announce = (before: GameState, after: GameState, options?: DiffOptions): void => {
    const message = diffToMessage(before, after, options ?? {});
    if (message === null) return;
    announceRaw(message);
  };

  return { announce, announceRaw };
};
