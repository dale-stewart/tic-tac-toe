/**
 * Property-based tests for gameReducer invariants.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { gameReducer, initialState, type GameState } from '../../src/core/game';

const coordArb = fc.integer({ min: -1, max: 3 }); // include OOB
const actionArb = fc.oneof(
  fc.record({
    type: fc.constant<'PLACE_MARK'>('PLACE_MARK'),
    row: coordArb,
    col: coordArb,
  }),
  fc.record({ type: fc.constant<'RESET'>('RESET') }),
);

const markCount = (state: GameState): number => {
  let count = 0;
  for (const row of state.board) {
    for (const cell of row) {
      if (cell !== null) count += 1;
    }
  }
  return count;
};

describe('gameReducer properties', () => {
  it('[property] never produces a board with >9 marks', () => {
    fc.assert(
      fc.property(fc.array(actionArb, { maxLength: 40 }), (actions) => {
        let state = initialState();
        for (const action of actions) {
          state = gameReducer(state, action);
        }
        expect(markCount(state)).toBeLessThanOrEqual(9);
      }),
    );
  });

  it('[property] PLACE_MARK on a filled cell leaves state unchanged', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        (row, col) => {
          const s0 = initialState();
          const s1 = gameReducer(s0, { type: 'PLACE_MARK', row, col });
          const s2 = gameReducer(s1, { type: 'PLACE_MARK', row, col });
          expect(s2).toBe(s1);
        },
      ),
    );
  });

  it('[property] RESET always yields empty board, turn X, result in_progress, preserved mode/difficulty', () => {
    fc.assert(
      fc.property(fc.array(actionArb, { maxLength: 40 }), (actions) => {
        let state = initialState();
        for (const action of actions) {
          state = gameReducer(state, action);
        }
        const reset = gameReducer(state, { type: 'RESET' });
        expect(markCount(reset)).toBe(0);
        expect(reset.turn).toBe('X');
        expect(reset.result.status).toBe('in_progress');
        expect(reset.mode).toBe(state.mode);
        expect(reset.difficulty).toBe(state.difficulty);
      }),
    );
  });

  it('[property] mark count is strictly monotonic (never decreases) across PLACE_MARK', () => {
    fc.assert(
      fc.property(fc.array(actionArb, { maxLength: 40 }), (actions) => {
        let state = initialState();
        let prev = 0;
        for (const action of actions) {
          state = gameReducer(state, action);
          if (action.type === 'PLACE_MARK') {
            const now = markCount(state);
            expect(now).toBeGreaterThanOrEqual(prev);
            prev = now;
          } else {
            // RESET allowed to drop to 0.
            prev = 0;
          }
        }
      }),
    );
  });
});
