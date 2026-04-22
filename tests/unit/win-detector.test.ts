/**
 * Unit tests for win-detector.
 * Pure functions: (BoardState) -> WinLine | null | boolean | GameResult.
 */
import { describe, it, expect } from 'vitest';
import { emptyBoard, placeMark, type BoardState, type Mark } from '../../src/core/board';
import {
  detectWin,
  detectDraw,
  detectResult,
} from '../../src/core/win-detector';

const build = (cells: ReadonlyArray<readonly [number, number, Mark]>): BoardState => {
  let board = emptyBoard();
  for (const [row, col, mark] of cells) {
    const result = placeMark(board, row, col, mark);
    if (!result.ok) throw new Error(`failed to place: ${result.error}`);
    board = result.value;
  }
  return board;
};

describe('detectWin', () => {
  it('returns null for empty board', () => {
    expect(detectWin(emptyBoard())).toBeNull();
  });

  it('detects a top-row win for X', () => {
    const board = build([
      [0, 0, 'X'],
      [0, 1, 'X'],
      [0, 2, 'X'],
    ]);
    const line = detectWin(board);
    expect(line).not.toBeNull();
    expect(line).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ]);
  });

  it('detects a left-column win for O', () => {
    const board = build([
      [0, 0, 'O'],
      [1, 0, 'O'],
      [2, 0, 'O'],
    ]);
    const line = detectWin(board);
    expect(line).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
    ]);
  });

  it('detects a main-diagonal win', () => {
    const board = build([
      [0, 0, 'X'],
      [1, 1, 'X'],
      [2, 2, 'X'],
    ]);
    expect(detectWin(board)).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 2 },
    ]);
  });

  it('detects an anti-diagonal win', () => {
    const board = build([
      [0, 2, 'X'],
      [1, 1, 'X'],
      [2, 0, 'X'],
    ]);
    expect(detectWin(board)).toEqual([
      { row: 0, col: 2 },
      { row: 1, col: 1 },
      { row: 2, col: 0 },
    ]);
  });

  it('returns null on mixed (non-winning) rows', () => {
    const board = build([
      [0, 0, 'X'],
      [0, 1, 'O'],
      [0, 2, 'X'],
    ]);
    expect(detectWin(board)).toBeNull();
  });
});

describe('detectDraw', () => {
  it('returns false for empty board', () => {
    expect(detectDraw(emptyBoard())).toBe(false);
  });

  it('returns true for a filled board with no winner', () => {
    // X O X
    // X X O
    // O X O
    const board = build([
      [0, 0, 'X'],
      [0, 1, 'O'],
      [0, 2, 'X'],
      [1, 0, 'X'],
      [1, 1, 'X'],
      [1, 2, 'O'],
      [2, 0, 'O'],
      [2, 1, 'X'],
      [2, 2, 'O'],
    ]);
    expect(detectDraw(board)).toBe(true);
    expect(detectWin(board)).toBeNull();
  });

  it('returns false for a full board that has a winner', () => {
    // Full but X wins top row.
    const board = build([
      [0, 0, 'X'],
      [1, 0, 'O'],
      [0, 1, 'X'],
      [1, 1, 'O'],
      [0, 2, 'X'],
      [1, 2, 'O'],
      [2, 0, 'X'],
      [2, 1, 'O'],
      [2, 2, 'X'],
    ]);
    expect(detectDraw(board)).toBe(false);
  });
});

describe('detectResult', () => {
  it('returns in_progress for empty board', () => {
    expect(detectResult(emptyBoard())).toEqual({ status: 'in_progress' });
  });

  it('returns won with the winning line and mark', () => {
    const board = build([
      [0, 0, 'X'],
      [0, 1, 'X'],
      [0, 2, 'X'],
    ]);
    const result = detectResult(board);
    expect(result.status).toBe('won');
    if (result.status === 'won') {
      expect(result.winner).toBe('X');
      expect(result.line).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ]);
    }
  });

  it('returns draw for a full board with no winner', () => {
    const board = build([
      [0, 0, 'X'],
      [0, 1, 'O'],
      [0, 2, 'X'],
      [1, 0, 'X'],
      [1, 1, 'X'],
      [1, 2, 'O'],
      [2, 0, 'O'],
      [2, 1, 'X'],
      [2, 2, 'O'],
    ]);
    expect(detectResult(board)).toEqual({ status: 'draw' });
  });
});
