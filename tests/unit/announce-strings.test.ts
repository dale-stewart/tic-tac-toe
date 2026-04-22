/**
 * Unit tests for the pure announce-strings module.
 * The DOM-entangled announce adapter (live-region writes, debounce) is covered
 * by Playwright in tests/e2e/keyboard-aria.spec.ts.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { diffToMessage } from '../../src/adapters/announce-strings';
import { gameReducer, initialState, type GameState } from '../../src/core/game';

const fresh = (): GameState => initialState();

describe('diffToMessage', () => {
  it('announces a placed mark by row and column (1-indexed)', () => {
    const before = fresh();
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 1, col: 1 });
    const message = diffToMessage(before, after);
    expect(message).not.toBeNull();
    expect(message!).toMatch(/row 2/i);
    expect(message!).toMatch(/column 2/i);
  });

  it('announces "Cell already taken" when PLACE_MARK targets a filled cell (no state change, same reference)', () => {
    const before = fresh();
    const afterFirst = gameReducer(before, { type: 'PLACE_MARK', row: 0, col: 0 });
    // Second attempt at the same cell returns the same reference — the rejection diff.
    const afterSecond = gameReducer(afterFirst, { type: 'PLACE_MARK', row: 0, col: 0 });
    expect(afterSecond).toBe(afterFirst);
    expect(diffToMessage(afterFirst, afterSecond, { rejected: true })).toBe('Cell already taken');
  });

  it('announces "You win." when transitioning to a win by the human mark (X)', () => {
    // Build a state one move away from X winning the top row.
    let state = fresh();
    for (const [row, col] of [
      [0, 0], // X
      [2, 0], // O
      [0, 1], // X
      [2, 1], // O
    ] as const) {
      state = gameReducer(state, { type: 'PLACE_MARK', row, col });
    }
    const before = state;
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 0, col: 2 });
    expect(after.result.status).toBe('won');
    expect(diffToMessage(before, after)).toMatch(/You win\.?/i);
  });

  it('announces "AI wins." when transitioning to a win by the opponent mark (O)', () => {
    // Build state where O wins.
    let state = fresh();
    for (const [row, col] of [
      [1, 1], // X
      [0, 0], // O
      [2, 2], // X
      [0, 1], // O
      [2, 0], // X
    ] as const) {
      state = gameReducer(state, { type: 'PLACE_MARK', row, col });
    }
    const before = state;
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 0, col: 2 });
    expect(after.result.status).toBe('won');
    expect(diffToMessage(before, after)).toMatch(/AI wins\.?/i);
  });

  it('announces "Draw." when transitioning to a draw', () => {
    let state = fresh();
    for (const [row, col] of [
      [0, 0], // X
      [0, 1], // O
      [0, 2], // X
      [1, 2], // O
      [1, 0], // X
      [2, 0], // O
      [1, 1], // X
      [2, 2], // O
    ] as const) {
      state = gameReducer(state, { type: 'PLACE_MARK', row, col });
    }
    const before = state;
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 2, col: 1 });
    expect(after.result.status).toBe('draw');
    expect(diffToMessage(before, after)).toMatch(/Draw\.?/i);
  });

  it('returns null when prev === next and no rejection flag', () => {
    const state = fresh();
    expect(diffToMessage(state, state)).toBeNull();
  });

  it('returns null when RESET clears the board (no announcement for restart)', () => {
    let state = fresh();
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 0 });
    const afterReset = gameReducer(state, { type: 'RESET' });
    expect(diffToMessage(state, afterReset)).toBeNull();
  });

  it('announces the terminal message when both before and after are terminal (edge case)', () => {
    // If both states are terminal and distinct, the diff still announces the
    // terminal outcome. Drive before->won, then construct after as a different
    // won state by placing a mark on a different board but with same shape.
    let won: GameState = fresh();
    for (const [row, col] of [
      [0, 0],
      [2, 0],
      [0, 1],
      [2, 1],
      [0, 2],
    ] as const) {
      won = gameReducer(won, { type: 'PLACE_MARK', row, col });
    }
    expect(won.result.status).toBe('won');
    // Craft a second terminal state structurally — not reachable via reducer
    // from this point (post-terminal PLACE_MARK is a no-op) — but diffToMessage
    // must still handle the input without throwing.
    const alsoTerminal: GameState = { ...won, turn: 'O' };
    const message = diffToMessage(won, alsoTerminal);
    // No placement diff (same board); no reset-to-empty; no simple null return.
    // This exercises the isResetToEmpty false-on-after branch.
    expect(message).toMatch(/You win\.?/i);
  });

  it('property: every accepted PLACE_MARK transition produces a non-empty message', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), fc.integer({ min: 0, max: 2 }), (row, col) => {
        const before = fresh();
        const after = gameReducer(before, { type: 'PLACE_MARK', row, col });
        // Only consider the accepted transitions (empty board -> all placements accepted).
        if (after === before) return true;
        const message = diffToMessage(before, after);
        return typeof message === 'string' && message.length > 0;
      }),
    );
  });
});
