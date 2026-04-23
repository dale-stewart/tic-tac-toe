/**
 * Unit tests for the perfect AI (minimax with memoization).
 */
import { describe, it, expect } from 'vitest';
import { emptyBoard } from '../../src/core/board';
import { boardKey, choosePerfectMove, opponent, pickBetter } from '../../src/core/ai/perfect';
import { buildBoard } from '../support/board-builders';

describe('choosePerfectMove', () => {
  it('takes the immediate win when available', () => {
    const board = buildBoard([
      [0, 0, 'O'],
      [1, 0, 'X'],
      [0, 1, 'O'],
      [2, 2, 'X'],
    ]);
    expect(choosePerfectMove(board, 'O')).toEqual([0, 2]);
  });

  it('blocks the opponent three-in-a-row', () => {
    const board = buildBoard([
      [0, 0, 'X'],
      [1, 0, 'O'],
      [0, 1, 'X'],
    ]);
    expect(choosePerfectMove(board, 'O')).toEqual([0, 2]);
  });

  it('returns a legal move from an empty board (center or corner)', () => {
    const [row, col] = choosePerfectMove(emptyBoard(), 'X');
    expect(row).toBeGreaterThanOrEqual(0);
    expect(row).toBeLessThan(3);
    expect(col).toBeGreaterThanOrEqual(0);
    expect(col).toBeLessThan(3);
  });

  it('is deterministic across calls on the same board', () => {
    const board = buildBoard([
      [1, 1, 'X'],
      [0, 0, 'O'],
    ]);
    expect(choosePerfectMove(board, 'X')).toEqual(choosePerfectMove(board, 'X'));
  });

  it('avoids a losing move: when X threatens a fork, O plays into it', () => {
    // Classic corner-trap: X at [0,0], O at center, X at [2,2]. O must not play
    // another corner (which would set up a double threat) — perfect plays a
    // side cell. We assert the move is an edge, not a corner.
    const board = buildBoard([
      [0, 0, 'X'],
      [1, 1, 'O'],
      [2, 2, 'X'],
    ]);
    const [row, col] = choosePerfectMove(board, 'O');
    const corners: ReadonlyArray<readonly [number, number]> = [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ];
    const isCorner = corners.some(([r, c]) => r === row && c === col);
    expect(isCorner).toBe(false);
  });

  it('throws when called on a terminal board', () => {
    // Full draw board.
    const board = buildBoard([
      [0, 0, 'X'],
      [0, 1, 'O'],
      [0, 2, 'X'],
      [1, 2, 'O'],
      [1, 0, 'X'],
      [2, 0, 'O'],
      [1, 1, 'X'],
      [2, 2, 'O'],
      [2, 1, 'X'],
    ]);
    expect(() => choosePerfectMove(board, 'O')).toThrow(/no legal move/);
  });
});

describe('boardKey', () => {
  it('encodes the empty board as 9 dashes plus the to-play mark', () => {
    expect(boardKey(emptyBoard(), 'X')).toBe('---------|X');
  });

  it('encodes marks in row-major order', () => {
    const board = buildBoard([
      [0, 0, 'X'],
      [1, 1, 'O'],
      [2, 2, 'X'],
    ]);
    expect(boardKey(board, 'O')).toBe('X---O---X|O');
  });

  it('distinguishes boards by whose turn it is', () => {
    expect(boardKey(emptyBoard(), 'X')).not.toBe(boardKey(emptyBoard(), 'O'));
  });
});

describe('opponent', () => {
  it("maps 'X' to 'O'", () => {
    expect(opponent('X')).toBe('O');
  });

  it("maps 'O' to 'X'", () => {
    expect(opponent('O')).toBe('X');
  });
});

describe('pickBetter', () => {
  const moveA = [0, 0] as const;
  const moveB = [1, 1] as const;

  it('max-turn: strictly better candidate replaces current', () => {
    const current = { score: 0, move: moveA };
    const candidate = { score: 1, move: null };
    expect(pickBetter(current, candidate, moveB, true)).toEqual({ score: 1, move: moveB });
  });

  it('max-turn: equal-score candidate does NOT replace (stable first-found wins)', () => {
    const current = { score: 0, move: moveA };
    const candidate = { score: 0, move: null };
    expect(pickBetter(current, candidate, moveB, true)).toEqual(current);
  });

  it('max-turn: worse candidate keeps current', () => {
    const current = { score: 1, move: moveA };
    const candidate = { score: -1, move: null };
    expect(pickBetter(current, candidate, moveB, true)).toEqual(current);
  });

  it('min-turn: strictly smaller candidate replaces current', () => {
    const current = { score: 0, move: moveA };
    const candidate = { score: -1, move: null };
    expect(pickBetter(current, candidate, moveB, false)).toEqual({ score: -1, move: moveB });
  });

  it('min-turn: equal-score candidate does NOT replace (stable first-found wins)', () => {
    const current = { score: 0, move: moveA };
    const candidate = { score: 0, move: null };
    expect(pickBetter(current, candidate, moveB, false)).toEqual(current);
  });

  it('min-turn: larger candidate keeps current', () => {
    const current = { score: -1, move: moveA };
    const candidate = { score: 1, move: null };
    expect(pickBetter(current, candidate, moveB, false)).toEqual(current);
  });
});
