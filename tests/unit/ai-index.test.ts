/**
 * Unit tests for the AI port registry.
 */
import { describe, it, expect } from 'vitest';
import { strategies, type Difficulty } from '../../src/core/ai';
import { emptyBoard } from '../../src/core/board';

describe('strategies registry', () => {
  it('exposes exactly easy, medium, and perfect', () => {
    const keys = Object.keys(strategies).sort();
    expect(keys).toEqual(['easy', 'medium', 'perfect']);
  });

  it.each(['easy', 'medium', 'perfect'] as const)(
    'strategies.%s returns an empty-cell coord on an empty board',
    (difficulty: Difficulty) => {
      const [row, col] = strategies[difficulty](emptyBoard(), 'X');
      expect(emptyBoard()[row]![col]).toBeNull();
    },
  );
});
