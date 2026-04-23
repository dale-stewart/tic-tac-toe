/**
 * Unit tests for the medium AI (one-ply: win > block > random).
 */
import { describe, it, expect } from 'vitest';
import { emptyBoard } from '../../src/core/board';
import { chooseMediumMove, findWinningMove } from '../../src/core/ai/medium';
import { buildBoard } from '../support/board-builders';
import { fixedRng } from '../support/rng';

describe('chooseMediumMove', () => {
  it('takes the immediate win when available', () => {
    // O has [0,0] and [0,1]; [0,2] wins.
    const board = buildBoard([
      [0, 0, 'O'],
      [1, 0, 'X'],
      [0, 1, 'O'],
      [2, 2, 'X'],
    ]);
    expect(chooseMediumMove(board, 'O')).toEqual([0, 2]);
  });

  it('blocks the opponent three-in-a-row when no win is available', () => {
    // X threatens top row; O must block at [0,2].
    const board = buildBoard([
      [0, 0, 'X'],
      [1, 0, 'O'],
      [0, 1, 'X'],
    ]);
    expect(chooseMediumMove(board, 'O')).toEqual([0, 2]);
  });

  it('prefers win over block when both are available (win > block)', () => {
    // O can win at [0,2]; X would win at [2,2]. Medium must take the win.
    const board = buildBoard([
      [0, 0, 'O'],
      [2, 0, 'X'],
      [0, 1, 'O'],
      [2, 1, 'X'],
    ]);
    expect(chooseMediumMove(board, 'O')).toEqual([0, 2]);
  });

  it('falls back to the random branch when no win and no block', () => {
    // Empty board — no threats; rng selects index 0 => [0,0].
    expect(chooseMediumMove(emptyBoard(), 'O', fixedRng(0))).toEqual([0, 0]);
  });

  it('random fallback is deterministic under a seeded rng', () => {
    const rng1 = fixedRng(0.5);
    const rng2 = fixedRng(0.5);
    expect(chooseMediumMove(emptyBoard(), 'O', rng1)).toEqual(
      chooseMediumMove(emptyBoard(), 'O', rng2),
    );
  });
});

describe('findWinningMove', () => {
  it('returns null when no winning move exists', () => {
    expect(findWinningMove(emptyBoard(), 'X')).toBeNull();
  });

  it('finds the diagonal winning move for X', () => {
    const board = buildBoard([
      [0, 0, 'X'],
      [0, 1, 'O'],
      [1, 1, 'X'],
      [0, 2, 'O'],
    ]);
    expect(findWinningMove(board, 'X')).toEqual([2, 2]);
  });

  it('finds the column winning move for O', () => {
    const board = buildBoard([
      [0, 0, 'X'],
      [0, 2, 'O'],
      [1, 1, 'X'],
      [1, 2, 'O'],
    ]);
    expect(findWinningMove(board, 'O')).toEqual([2, 2]);
  });
});
