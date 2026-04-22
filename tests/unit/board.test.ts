/**
 * Unit tests for the pure `board` module.
 * Port-to-port at domain scope: the function signature IS the driving port.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { emptyBoard, placeMark, type BoardState, type Cell } from '../../src/core/board';

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

describe('board.placeMark', () => {
  it('places an X in an empty cell and returns Ok', () => {
    const result = placeMark(emptyBoard(), 1, 1, 'X');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[1][1]).toBe('X');
      // Other cells untouched.
      expect(result.value[0][0]).toBeNull();
      expect(result.value[2][2]).toBeNull();
    }
  });

  it('returns Err cell_taken when placing on a filled cell', () => {
    const first = placeMark(emptyBoard(), 0, 0, 'X');
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = placeMark(first.value, 0, 0, 'O');
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.error).toBe('cell_taken');
    }
  });

  it('returns Err out_of_bounds for negative row', () => {
    const result = placeMark(emptyBoard(), -1, 0, 'X');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('out_of_bounds');
    }
  });

  it('returns Err out_of_bounds for negative col', () => {
    const result = placeMark(emptyBoard(), 0, -1, 'X');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('out_of_bounds');
    }
  });

  it('returns Err out_of_bounds for row>=3', () => {
    const result = placeMark(emptyBoard(), 3, 0, 'X');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('out_of_bounds');
    }
  });

  it('returns Err out_of_bounds for col>=3', () => {
    const result = placeMark(emptyBoard(), 0, 3, 'X');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('out_of_bounds');
    }
  });

  // Guard against float/NaN/Infinity coords — otherwise the comparison-only
  // bounds check would admit e.g. 0.5 as a "valid" in-range row.
  it.each([
    ['row', 0.5, 0],
    ['col', 0, 0.5],
    ['row NaN', Number.NaN, 0],
    ['col NaN', 0, Number.NaN],
    ['row Infinity', Number.POSITIVE_INFINITY, 0],
    ['col -Infinity', 0, Number.NEGATIVE_INFINITY],
  ] as const)('returns Err out_of_bounds for non-integer %s', (_label, row, col) => {
    const result = placeMark(emptyBoard(), row, col, 'X');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('out_of_bounds');
    }
  });

  it('does not mutate the input board', () => {
    const original = emptyBoard();
    const result = placeMark(original, 0, 0, 'X');
    expect(result.ok).toBe(true);
    // Original still empty.
    expect(original[0][0]).toBeNull();
  });
});
