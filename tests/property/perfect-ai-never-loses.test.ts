/**
 * Property: the perfect AI never loses.
 *
 * 100 independently seeded games of perfect vs. random. Every outcome must
 * be either a perfect win or a draw. Perfect plays 'O' second (random opens
 * as 'X'), which is the harder direction: tic-tac-toe is a known draw when
 * both players play optimally, so perfect-second must at minimum draw.
 */
import { describe, it, expect } from 'vitest';
import { emptyBoard, placeMark, type BoardState, type Mark } from '../../src/core/board';
import { detectResult, type GameResult } from '../../src/core/win-detector';
import { chooseRandomMove } from '../../src/core/ai/easy';
import { choosePerfectMove } from '../../src/core/ai/perfect';

const seededRng = (seed: number): (() => number) => {
  // Mulberry32 — tiny deterministic PRNG, same shape as tests/unit/ai-easy.test.ts.
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type Outcome = 'perfect_wins' | 'draw' | 'perfect_loses';

const classifyOutcome = (result: GameResult, perfectMark: Mark): Outcome => {
  if (result.status === 'draw') return 'draw';
  if (result.status === 'won') {
    return result.winner === perfectMark ? 'perfect_wins' : 'perfect_loses';
  }
  // Game unfinished — shouldn't happen in a completed game.
  throw new Error('classifyOutcome called on in-progress game');
};

const playGame = (seed: number): Outcome => {
  const rng = seededRng(seed);
  const perfectMark: Mark = 'O';
  const randomMark: Mark = 'X';
  let board: BoardState = emptyBoard();
  let turn: Mark = randomMark;
  while (detectResult(board).status === 'in_progress') {
    const mover = turn === perfectMark ? choosePerfectMove : chooseRandomMove;
    const [row, col] = mover(board, turn, rng);
    const placed = placeMark(board, row, col, turn);
    if (!placed.ok) throw new Error(`illegal move ${placed.error}`);
    board = placed.value;
    turn = turn === 'X' ? 'O' : 'X';
  }
  return classifyOutcome(detectResult(board), perfectMark);
};

describe('Perfect AI never loses property', () => {
  it('over 100 seeded games of perfect-vs-random, every outcome is perfect_wins or draw', () => {
    const outcomes = new Set<Outcome>();
    for (let seed = 0; seed < 100; seed += 1) {
      const outcome = playGame(seed);
      outcomes.add(outcome);
      expect(outcome).not.toBe('perfect_loses');
    }
    // Sanity: at least one outcome observed.
    expect(outcomes.size).toBeGreaterThan(0);
  });
});
