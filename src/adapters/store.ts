/**
 * Reducer-backed observable store.
 *
 * Holds a GameState in closure, advances it via gameReducer on each dispatch,
 * and notifies subscribers. No DOM, no IO — unit-testable in the Node env.
 * Lives under adapters/ because mutable state + observer notification are
 * infrastructure concerns, not domain.
 */
import { gameReducer, type Action, type GameState } from '../core/game';

export interface Store {
  getState(): GameState;
  dispatch(action: Action): void;
  subscribe(listener: () => void): () => void;
}

export const createStore = (initial: GameState): Store => {
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
