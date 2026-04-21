/**
 * Composition root. Wires the initial paint of the walking-skeleton slice 01.
 *
 * Responsibilities:
 *   1. Feature-detect a required modern capability. If absent, render the
 *      ancient-browser fallback and also copy the message to the live region.
 *   2. Otherwise, render the empty board + turn indicator with default mode
 *      (solo) and default difficulty (medium). No input wiring yet — that
 *      lands in slice 01-03.
 *
 * This module is the ONLY place with side effects at startup. The render
 * adapter is pure; the core board module is pure.
 */
import { render } from 'lit-html';
import '../styles.css';
import { emptyBoard } from '../core/board';
import {
  ANCIENT_BROWSER_MESSAGE,
  renderAncientBrowserFallback,
  renderBoard,
  type Difficulty,
  type GameMode,
} from './render';

const DEFAULT_MODE: GameMode = 'solo';
const DEFAULT_DIFFICULTY: Difficulty = 'medium';

const hasModernFeatures = (): boolean => {
  const globalScope = globalThis as unknown as Record<string, unknown>;
  return (
    typeof globalScope['queueMicrotask'] === 'function' &&
    typeof globalScope['customElements'] === 'object'
  );
};

const mount = (): void => {
  const app = document.querySelector<HTMLElement>('#app');
  const announce = document.querySelector<HTMLElement>('#announce');
  if (app === null) {
    console.error('bootstrap: #app not found');
    return;
  }

  if (!hasModernFeatures()) {
    render(renderAncientBrowserFallback(), app);
    if (announce !== null) {
      announce.textContent = ANCIENT_BROWSER_MESSAGE;
    }
    return;
  }

  const board = emptyBoard();
  const view = {
    board,
    turn: 'X' as const,
    mode: DEFAULT_MODE,
    difficulty: DEFAULT_DIFFICULTY,
  };
  // Mirror mode/difficulty onto the #app container for test/data introspection.
  app.setAttribute('data-mode', view.mode);
  app.setAttribute('data-difficulty', view.difficulty);
  render(renderBoard(view), app);
};

mount();
