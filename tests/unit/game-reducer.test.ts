/**
 * Unit tests for gameReducer.
 * Pure function: (GameState, Action) -> GameState.
 */
import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../../src/core/game';

describe('gameReducer', () => {
  it('initial state has empty board, X to move, in_progress', () => {
    const state = initialState();
    expect(state.turn).toBe('X');
    expect(state.mode).toBe('solo');
    expect(state.difficulty).toBe('medium');
    expect(state.result.status).toBe('in_progress');
    for (const row of state.board) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });

  it('PLACE_MARK on empty cell places the current turn and alternates turn', () => {
    const s0 = initialState();
    const s1 = gameReducer(s0, { type: 'PLACE_MARK', row: 1, col: 1 });
    expect(s1.board[1][1]).toBe('X');
    expect(s1.turn).toBe('O');
    expect(s1.result.status).toBe('in_progress');

    const s2 = gameReducer(s1, { type: 'PLACE_MARK', row: 0, col: 0 });
    expect(s2.board[0][0]).toBe('O');
    expect(s2.turn).toBe('X');
  });

  it('PLACE_MARK on filled cell returns the same state (idempotent-on-rejection)', () => {
    const s0 = initialState();
    const s1 = gameReducer(s0, { type: 'PLACE_MARK', row: 1, col: 1 });
    const s2 = gameReducer(s1, { type: 'PLACE_MARK', row: 1, col: 1 });
    expect(s2).toBe(s1);
  });

  it('PLACE_MARK that completes a line transitions result to won', () => {
    let state = initialState();
    // X top-left
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 0 });
    // O bottom-left
    state = gameReducer(state, { type: 'PLACE_MARK', row: 2, col: 0 });
    // X top-middle
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 1 });
    // O bottom-middle
    state = gameReducer(state, { type: 'PLACE_MARK', row: 2, col: 1 });
    // X top-right - wins
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 2 });

    expect(state.result.status).toBe('won');
    if (state.result.status === 'won') {
      expect(state.result.winner).toBe('X');
    }
  });

  it('PLACE_MARK is a no-op when game is already won', () => {
    let state = initialState();
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 0 });
    state = gameReducer(state, { type: 'PLACE_MARK', row: 2, col: 0 });
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 1 });
    state = gameReducer(state, { type: 'PLACE_MARK', row: 2, col: 1 });
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 2 });
    // Game is won. Further moves should be no-ops.
    const postWin = gameReducer(state, { type: 'PLACE_MARK', row: 1, col: 1 });
    expect(postWin).toBe(state);
  });

  it('RESET returns an empty board, X to move, preserved mode and difficulty', () => {
    let state = initialState();
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 0 });
    state = gameReducer(state, { type: 'PLACE_MARK', row: 1, col: 1 });
    const reset = gameReducer(state, { type: 'RESET' });
    expect(reset.turn).toBe('X');
    expect(reset.mode).toBe(state.mode);
    expect(reset.difficulty).toBe(state.difficulty);
    expect(reset.result.status).toBe('in_progress');
    for (const row of reset.board) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });

  it('PLACE_MARK completing a draw transitions result to draw', () => {
    let state = initialState();
    // X O X
    // X X O
    // O X O
    const moves: Array<[number, number]> = [
      [0, 0], // X
      [0, 1], // O
      [0, 2], // X
      [1, 2], // O
      [1, 0], // X
      [2, 0], // O
      [1, 1], // X
      [2, 2], // O
      [2, 1], // X
    ];
    for (const [row, col] of moves) {
      state = gameReducer(state, { type: 'PLACE_MARK', row, col });
    }
    expect(state.result.status).toBe('draw');
  });
});
