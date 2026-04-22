/**
 * Composition root. Wires the dispatch loop for slices 01+02.
 *
 * Responsibilities:
 *   1. Feature-detect a required modern capability; fall back cleanly if absent.
 *   2. Hold the single GameState in a module-scoped store.
 *   3. On each dispatch: reduce, render, manage focus, and schedule maybeRunAi.
 *   4. Wire pointer input via delegated click + Play-again button.
 *
 * This module is the ONLY place with side effects at startup.
 */
import { render } from 'lit-html';
import '../styles.css';
import {
  gameReducer,
  initialState,
  type Action,
  type GameState,
} from '../core/game';
import { chooseRandomMove } from '../core/ai/easy';
import {
  ANCIENT_BROWSER_MESSAGE,
  bannerTextFor,
  renderAncientBrowserFallback,
  renderBoard,
} from './render';
import { attachPointer } from './input/pointer';

interface Store {
  getState(): GameState;
  dispatch(action: Action): void;
  subscribe(listener: () => void): () => void;
}

const createStore = (initial: GameState): Store => {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    dispatch: (action: Action) => {
      state = gameReducer(state, action);
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

const hasModernFeatures = (): boolean => {
  const globalScope = globalThis as unknown as Record<string, unknown>;
  return (
    typeof globalScope['queueMicrotask'] === 'function' &&
    typeof globalScope['customElements'] === 'object'
  );
};

const isAiDisabled = (): boolean => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('ai') === 'off';
  } catch {
    return false;
  }
};

const maybeRunAi = (store: Store, aiDisabled: boolean): void => {
  if (aiDisabled) return;
  const state = store.getState();
  if (state.result.status !== 'in_progress') return;
  if (state.mode !== 'solo') return;
  if (state.turn !== 'O') return;
  const [row, col] = chooseRandomMove(state.board, 'O');
  store.dispatch({ type: 'PLACE_MARK', row, col });
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

  const store = createStore(initialState());
  const aiDisabled = isAiDisabled();

  // Expose the store for e2e tests. No sensitive data; pure client UI state.
  (window as unknown as { __store: Store }).__store = store;

  const renderApp = (): void => {
    const state = store.getState();
    app.setAttribute('data-mode', state.mode);
    app.setAttribute('data-difficulty', state.difficulty);
    render(
      renderBoard({
        board: state.board,
        turn: state.turn,
        mode: state.mode,
        difficulty: state.difficulty,
        result: state.result,
      }),
      app,
    );

    // Focus management: on terminal state, focus Play again.
    if (state.result.status !== 'in_progress') {
      const playAgain = app.querySelector<HTMLButtonElement>('[data-testid="play-again"]');
      if (playAgain !== null) playAgain.focus();
    }

    // Announce banner text via the shared live region when terminal.
    if (announce !== null) {
      const banner = bannerTextFor(state.result, 'X');
      announce.textContent = banner ?? '';
    }

    // Schedule AI move on the microtask queue if it is its turn.
    if (
      state.result.status === 'in_progress' &&
      state.mode === 'solo' &&
      state.turn === 'O' &&
      !aiDisabled
    ) {
      queueMicrotask(() => maybeRunAi(store, aiDisabled));
    }
  };

  store.subscribe(renderApp);

  // Pointer input — delegated.
  attachPointer(app, (action) => store.dispatch(action));

  // Play-again: delegated click on the app container. Since the button is
  // rendered anew each time, we rely on delegation on the app root.
  app.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-testid="play-again"]') !== null) {
      store.dispatch({ type: 'RESET' });
    }
  });

  // Initial paint.
  renderApp();
};

mount();
