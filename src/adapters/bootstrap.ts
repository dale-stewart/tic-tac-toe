/**
 * Composition root. Wires the dispatch loop for slices 01+02+03.
 *
 * Responsibilities:
 *   1. Feature-detect a required modern capability; fall back cleanly if absent.
 *   2. Hold the single GameState in a module-scoped store.
 *   3. On each dispatch: reduce, render, manage focus, announce, schedule AI.
 *   4. Wire pointer + keyboard input; own a single announce adapter on #announce.
 *
 * This module is the ONLY place with side effects at startup.
 */
import { render } from 'lit-html';
import '../styles.css';
import { initialState, type GameState } from '../core/game';
import { chooseRandomMove } from '../core/ai/easy';
import { ANCIENT_BROWSER_MESSAGE, renderAncientBrowserFallback, renderBoard } from './render';
import { attachPointer } from './input/pointer';
import { attachKeyboard } from './input/keyboard';
import { createAnnouncer, type AnnounceAdapter } from './announce';
import { createStore, type Store } from './store';

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

/**
 * Dispatch wrapper that also announces rejected PLACE_MARK attempts.
 *
 * Accepted transitions are announced by renderApp via previousState diff; this
 * wrapper only handles the no-op case (cell already taken, post-terminal
 * input), where the state reference does not change and renderApp never runs.
 */
const dispatchWithAnnounce = (
  store: Store,
  announcer: AnnounceAdapter | null,
  action: Parameters<Store['dispatch']>[0],
): void => {
  const before = store.getState();
  store.dispatch(action);
  const after = store.getState();
  if (announcer === null) return;
  if (action.type === 'PLACE_MARK' && before === after) {
    announcer.announce(before, after, { rejected: true });
  }
};

const renderAncientFallback = (app: HTMLElement, announceEl: HTMLElement | null): void => {
  render(renderAncientBrowserFallback(), app);
  if (announceEl !== null) announceEl.textContent = ANCIENT_BROWSER_MESSAGE;
};

const focusPlayAgain = (app: HTMLElement): void => {
  const playAgain = app.querySelector<HTMLButtonElement>('[data-testid="play-again"]');
  if (playAgain !== null) playAgain.focus();
};

/**
 * Focus the center cell — discoverability affordance for arrow-key navigation.
 * Called on initial mount, and again on the terminal→in_progress transition
 * after Play again (where focus was on the now-removed button and would
 * otherwise fall back to <body>).
 */
const focusCenterCell = (app: HTMLElement): void => {
  const center = app.querySelector<HTMLElement>('[data-testid="cell-1-1"]');
  if (center !== null) center.focus();
};

/**
 * Initial-mount variant: only claim focus if nothing else on the page has it
 * (don't steal focus from a user who already interacted before mount).
 */
const focusInitialCell = (app: HTMLElement): void => {
  if (document.activeElement !== null && document.activeElement !== document.body) return;
  focusCenterCell(app);
};

const wirePlayAgainClick = (app: HTMLElement, store: Store): void => {
  app.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-testid="play-again"]') !== null) {
      store.dispatch({ type: 'RESET' });
    }
  });
};

interface RuntimeContext {
  readonly app: HTMLElement;
  readonly store: Store;
  readonly announcer: AnnounceAdapter | null;
  readonly aiDisabled: boolean;
  previousState: GameState;
}

const createRenderApp =
  (ctx: RuntimeContext): (() => void) =>
  () => {
    const state = ctx.store.getState();
    ctx.app.setAttribute('data-mode', state.mode);
    ctx.app.setAttribute('data-difficulty', state.difficulty);
    render(
      renderBoard({
        board: state.board,
        turn: state.turn,
        mode: state.mode,
        difficulty: state.difficulty,
        result: state.result,
      }),
      ctx.app,
    );
    if (state.result.status !== 'in_progress') {
      focusPlayAgain(ctx.app);
    } else if (ctx.previousState.result.status !== 'in_progress') {
      // terminal → in_progress (Play again): previous focus was on the now-removed
      // Play-again button. Re-claim focus on the center cell so keyboard users
      // don't land back on <body>.
      focusCenterCell(ctx.app);
    }
    if (ctx.announcer !== null && ctx.previousState !== state) {
      ctx.announcer.announce(ctx.previousState, state);
    }
    ctx.previousState = state;
    if (
      state.result.status === 'in_progress' &&
      state.mode === 'solo' &&
      state.turn === 'O' &&
      !ctx.aiDisabled
    ) {
      queueMicrotask(() => maybeRunAi(ctx.store, ctx.aiDisabled));
    }
  };

const mount = (): void => {
  const app = document.querySelector<HTMLElement>('#app');
  const announceEl = document.querySelector<HTMLElement>('#announce');
  if (app === null) {
    console.error('bootstrap: #app not found');
    return;
  }

  if (!hasModernFeatures()) {
    renderAncientFallback(app, announceEl);
    return;
  }

  const store = createStore(initialState());
  const aiDisabled = isAiDisabled();
  const announcer: AnnounceAdapter | null =
    announceEl !== null ? createAnnouncer(announceEl) : null;

  // Expose the store for e2e tests. No sensitive data; pure client UI state.
  (window as unknown as { __store: Store }).__store = store;

  const ctx: RuntimeContext = {
    app,
    store,
    announcer,
    aiDisabled,
    previousState: store.getState(),
  };

  const renderApp = createRenderApp(ctx);
  store.subscribe(renderApp);

  attachPointer(app, (action) => dispatchWithAnnounce(store, announcer, action));
  attachKeyboard(app, (action) => dispatchWithAnnounce(store, announcer, action));
  wirePlayAgainClick(app, store);

  renderApp();
  focusInitialCell(app);
};

mount();
