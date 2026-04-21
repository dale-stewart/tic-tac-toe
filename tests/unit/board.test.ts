/**
 * Unit tests for the pure `board` module.
 * Port-to-port at domain scope: the function signature IS the driving port.
 *
 * Slice 01 scope: empty-board construction and shape invariants only.
 * `placeMark`, `cellsRemaining`, `toReadableString` land in later slices.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { emptyBoard, type BoardState, type Cell } from '../../src/core/board';

describe('board.emptyBoard', () => {
  it('returns a 3x3 grid', () => {
    const board = emptyBoard();
    expect(board).toHaveLength(3);
    for (const row of board) {
      expect(row).toHaveLength(3);
    }
  });

  it('every cell is null on an empty board', () => {
    const board = emptyBoard();
    for (const row of board) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });

  it('is structurally equal to a fresh instance (referential purity)', () => {
    expect(emptyBoard()).toEqual(emptyBoard());
  });

  it('[property] every invocation produces exactly 9 null cells', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 25 }), (invocationCount) => {
        for (let i = 0; i < invocationCount; i += 1) {
          const board: BoardState = emptyBoard();
          const flat: readonly Cell[] = board.flat();
          expect(flat).toHaveLength(9);
          expect(flat.every((cell) => cell === null)).toBe(true);
        }
      }),
      { numRuns: 50 },
    );
  });
});
