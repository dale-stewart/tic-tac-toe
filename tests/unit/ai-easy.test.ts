/**
 * Unit tests for the easy (random) AI.
 * Pure function: (BoardState, Mark, rng?) -> [row, col].
 */
import { describe, it, expect } from 'vitest';
import { emptyBoard } from '../../src/core/board';
import { chooseRandomMove } from '../../src/core/ai/easy';
import { buildBoard } from '../support/board-builders';
import { seededRng } from '../support/rng';

describe('chooseRandomMove', () => {
  it('returns a legal move on an empty board', () => {
    const [row, col] = chooseRandomMove(emptyBoard(), 'O');
    expect(row).toBeGreaterThanOrEqual(0);
    expect(row).toBeLessThan(3);
    expect(col).toBeGreaterThanOrEqual(0);
    expect(col).toBeLessThan(3);
  });

  it('never picks a filled cell', () => {
    // Fill 8 cells, leaving (2,2) open.
    const board = buildBoard([
      [0, 0, 'X'],
      [0, 1, 'O'],
      [0, 2, 'X'],
      [1, 0, 'O'],
      [1, 1, 'X'],
      [1, 2, 'O'],
      [2, 0, 'X'],
      [2, 1, 'O'],
    ]);
    const [row, col] = chooseRandomMove(board, 'X');
    expect([row, col]).toEqual([2, 2]);
  });

  it('seeded RNG gives deterministic output', () => {
    const rng1 = seededRng(42);
    const rng2 = seededRng(42);
    const move1 = chooseRandomMove(emptyBoard(), 'O', rng1);
    const move2 = chooseRandomMove(emptyBoard(), 'O', rng2);
    expect(move1).toEqual(move2);
  });

  it('throws when called on a fully-occupied board', () => {
    const board = buildBoard([
      [0, 0, 'X'],
      [0, 1, 'O'],
      [0, 2, 'X'],
      [1, 0, 'O'],
      [1, 1, 'X'],
      [1, 2, 'O'],
      [2, 0, 'O'],
      [2, 1, 'X'],
      [2, 2, 'O'],
    ]);
    expect(() => chooseRandomMove(board, 'X')).toThrow(/no empty cells/);
  });

  it('covers all 9 cells across varied seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed += 1) {
      const [row, col] = chooseRandomMove(emptyBoard(), 'O', seededRng(seed));
      seen.add(`${row},${col}`);
    }
    // High confidence that with 200 seeds all 9 cells are reachable.
    expect(seen.size).toBe(9);
  });
});
