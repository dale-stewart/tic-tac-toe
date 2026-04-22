/**
 * Unit tests for the reducer-backed observable store.
 * Pure under vitest (env:node) — no DOM involved.
 */
import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../../src/adapters/store';
import { initialState, type GameState } from '../../src/core/game';

describe('createStore', () => {
  it('returns the initial state until dispatched', () => {
    const store = createStore(initialState());
    expect(store.getState()).toEqual(initialState());
  });

  it('dispatch advances state via the reducer', () => {
    const store = createStore(initialState());
    store.dispatch({ type: 'PLACE_MARK', row: 0, col: 0 });
    const after = store.getState();
    expect(after.board[0][0]).toBe('X');
    expect(after.turn).toBe('O');
  });

  it('notifies subscribers on each accepted dispatch', () => {
    const store = createStore(initialState());
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'PLACE_MARK', row: 0, col: 0 });
    store.dispatch({ type: 'PLACE_MARK', row: 1, col: 1 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('notifies multiple subscribers independently', () => {
    const store = createStore(initialState());
    const a = vi.fn();
    const b = vi.fn();
    store.subscribe(a);
    store.subscribe(b);
    store.dispatch({ type: 'PLACE_MARK', row: 2, col: 2 });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe stops further notifications for that listener only', () => {
    const store = createStore(initialState());
    const kept = vi.fn();
    const dropped = vi.fn();
    store.subscribe(kept);
    const unsub = store.subscribe(dropped);
    unsub();
    store.dispatch({ type: 'PLACE_MARK', row: 0, col: 0 });
    expect(kept).toHaveBeenCalledTimes(1);
    expect(dropped).not.toHaveBeenCalled();
  });

  it('RESET returns to initial mode/difficulty with an empty board', () => {
    const store = createStore(initialState());
    store.dispatch({ type: 'PLACE_MARK', row: 0, col: 0 });
    store.dispatch({ type: 'PLACE_MARK', row: 1, col: 1 });
    store.dispatch({ type: 'RESET' });
    const after: GameState = store.getState();
    expect(after.board.flat().every((cell) => cell === null)).toBe(true);
    expect(after.turn).toBe('X');
  });
});
