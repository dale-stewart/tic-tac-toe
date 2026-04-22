/**
 * Property-based tests for the pure `board` module.
 * Invariants and idempotency for placeMark.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  emptyBoard,
  placeMark,
  type BoardState,
  type Mark,
} from '../../src/core/board';

const markArb = fc.constantFrom<Mark>('X', 'O');
const coordArb = fc.integer({ min: 0, max: 2 });
// Use larger numbers to cover OOB; skip the in-range case to guarantee OOB.
const oobCoordArb = fc.oneof(
  fc.integer({ min: -100, max: -1 }),
  fc.integer({ min: 3, max: 100 }),
);

const markCount = (board: BoardState): number => {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell !== null) count += 1;
    }
  }
  return count;
};

describe('board properties', () => {
  it('[property] placeMark into empty cell increases mark count by exactly 1', () => {
    fc.assert(
      fc.property(coordArb, coordArb, markArb, (row, col, mark) => {
        const result = placeMark(emptyBoard(), row, col, mark);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(markCount(result.value)).toBe(1);
          expect(result.value[row]![col]).toBe(mark);
        }
      }),
    );
  });

  it('[property] placeMark on filled cell returns cell_taken and does not mutate', () => {
    fc.assert(
      fc.property(coordArb, coordArb, markArb, markArb, (row, col, first, second) => {
        const after1 = placeMark(emptyBoard(), row, col, first);
        expect(after1.ok).toBe(true);
        if (!after1.ok) return;
        const before = after1.value;
        const after2 = placeMark(before, row, col, second);
        expect(after2.ok).toBe(false);
        if (!after2.ok) {
          expect(after2.error).toBe('cell_taken');
        }
        // Unchanged — structural equality of the input.
        expect(before[row]![col]).toBe(first);
      }),
    );
  });

  it('[property] placeMark OOB returns out_of_bounds', () => {
    fc.assert(
      fc.property(oobCoordArb, oobCoordArb, markArb, (row, col, mark) => {
        const result = placeMark(emptyBoard(), row, col, mark);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBe('out_of_bounds');
        }
      }),
    );
  });

  it('[property] placeMark OOB on row only returns out_of_bounds', () => {
    fc.assert(
      fc.property(oobCoordArb, coordArb, markArb, (row, col, mark) => {
        const result = placeMark(emptyBoard(), row, col, mark);
        expect(result.ok).toBe(false);
      }),
    );
  });

  it('[property] placeMark never produces >9 marks', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            row: coordArb,
            col: coordArb,
            mark: markArb,
          }),
          { maxLength: 50 },
        ),
        (moves) => {
          let board: BoardState = emptyBoard();
          for (const { row, col, mark } of moves) {
            const result = placeMark(board, row, col, mark);
            if (result.ok) board = result.value;
          }
          expect(markCount(board)).toBeLessThanOrEqual(9);
        },
      ),
    );
  });
});
