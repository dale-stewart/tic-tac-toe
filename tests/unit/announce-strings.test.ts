/**
 * Unit tests for the pure announce-strings module.
 * The DOM-entangled announce adapter (live-region writes, debounce) is covered
 * by Playwright in tests/e2e/keyboard-aria.spec.ts.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  combine,
  diffToMessage,
  difficultyChangeText,
  findPlacement,
  isResetToEmpty,
} from '../../src/adapters/announce-strings';
import { emptyBoard } from '../../src/core/board';
import { gameReducer, initialState, type GameState } from '../../src/core/game';

const fresh = (): GameState => initialState();

describe('diffToMessage', () => {
  it('announces a placed mark by row and column (1-indexed)', () => {
    const before = fresh();
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 1, col: 1 });
    const message = diffToMessage(before, after);
    expect(message).not.toBeNull();
    expect(message!).toMatch(/row 2/i);
    expect(message!).toMatch(/column 2/i);
  });

  // Each placement must report its own coords — not always [0,0] nor always [1,1].
  // Kills mutants that short-circuit findPlacement to return the first iteration.
  it.each([
    [0, 1, 'row 1', 'column 2'],
    [0, 2, 'row 1', 'column 3'],
    [1, 0, 'row 2', 'column 1'],
    [1, 2, 'row 2', 'column 3'],
    [2, 0, 'row 3', 'column 1'],
    [2, 1, 'row 3', 'column 2'],
    [2, 2, 'row 3', 'column 3'],
  ] as const)('placement at [%i,%i] mentions %s and %s', (row, col, expectedRow, expectedCol) => {
    const before = fresh();
    const after = gameReducer(before, { type: 'PLACE_MARK', row, col });
    const message = diffToMessage(before, after);
    expect(message).toContain(expectedRow);
    expect(message).toContain(expectedCol);
  });

  it('announces the mark character (X for the first placement on a fresh board)', () => {
    const before = fresh();
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 2, col: 2 });
    expect(diffToMessage(before, after)).toMatch(/^X at row 3, column 3/);
  });

  it('announces "Cell already taken" when PLACE_MARK targets a filled cell (no state change, same reference)', () => {
    const before = fresh();
    const afterFirst = gameReducer(before, { type: 'PLACE_MARK', row: 0, col: 0 });
    // Second attempt at the same cell returns the same reference — the rejection diff.
    const afterSecond = gameReducer(afterFirst, { type: 'PLACE_MARK', row: 0, col: 0 });
    expect(afterSecond).toBe(afterFirst);
    expect(diffToMessage(afterFirst, afterSecond, { rejected: true })).toBe('Cell already taken');
  });

  it('announces "You win." when transitioning to a win by the human mark (X)', () => {
    // Build a state one move away from X winning the top row.
    let state = fresh();
    for (const [row, col] of [
      [0, 0], // X
      [2, 0], // O
      [0, 1], // X
      [2, 1], // O
    ] as const) {
      state = gameReducer(state, { type: 'PLACE_MARK', row, col });
    }
    const before = state;
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 0, col: 2 });
    expect(after.result.status).toBe('won');
    expect(diffToMessage(before, after)).toMatch(/You win\.?/i);
  });

  it('announces "AI wins." when transitioning to a win by the opponent mark (O)', () => {
    // Build state where O wins.
    let state = fresh();
    for (const [row, col] of [
      [1, 1], // X
      [0, 0], // O
      [2, 2], // X
      [0, 1], // O
      [2, 0], // X
    ] as const) {
      state = gameReducer(state, { type: 'PLACE_MARK', row, col });
    }
    const before = state;
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 0, col: 2 });
    expect(after.result.status).toBe('won');
    expect(diffToMessage(before, after)).toMatch(/AI wins\.?/i);
  });

  it('announces "Draw." when transitioning to a draw', () => {
    let state = fresh();
    for (const [row, col] of [
      [0, 0], // X
      [0, 1], // O
      [0, 2], // X
      [1, 2], // O
      [1, 0], // X
      [2, 0], // O
      [1, 1], // X
      [2, 2], // O
    ] as const) {
      state = gameReducer(state, { type: 'PLACE_MARK', row, col });
    }
    const before = state;
    const after = gameReducer(before, { type: 'PLACE_MARK', row: 2, col: 1 });
    expect(after.result.status).toBe('draw');
    expect(diffToMessage(before, after)).toMatch(/Draw\.?/i);
  });

  it('returns null when prev === next and no rejection flag', () => {
    const state = fresh();
    expect(diffToMessage(state, state)).toBeNull();
  });

  it('returns null when RESET clears the board (no announcement for restart)', () => {
    let state = fresh();
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 0 });
    const afterReset = gameReducer(state, { type: 'RESET' });
    expect(diffToMessage(state, afterReset)).toBeNull();
  });

  it('announces the terminal message when both before and after are terminal (edge case)', () => {
    // If both states are terminal and distinct, the diff still announces the
    // terminal outcome. Drive before->won, then construct after as a different
    // won state by placing a mark on a different board but with same shape.
    let won: GameState = fresh();
    for (const [row, col] of [
      [0, 0],
      [2, 0],
      [0, 1],
      [2, 1],
      [0, 2],
    ] as const) {
      won = gameReducer(won, { type: 'PLACE_MARK', row, col });
    }
    expect(won.result.status).toBe('won');
    // Craft a second terminal state structurally — not reachable via reducer
    // from this point (post-terminal PLACE_MARK is a no-op) — but diffToMessage
    // must still handle the input without throwing.
    const alsoTerminal: GameState = { ...won, turn: 'O' };
    const message = diffToMessage(won, alsoTerminal);
    // No placement diff (same board); no reset-to-empty; no simple null return.
    // This exercises the isResetToEmpty false-on-after branch.
    expect(message).toMatch(/You win\.?/i);
  });

  it('announces "Difficulty: perfect" when SET_DIFFICULTY flips difficulty', () => {
    const before = fresh();
    const after = gameReducer(before, { type: 'SET_DIFFICULTY', difficulty: 'perfect' });
    expect(diffToMessage(before, after)).toBe('Difficulty: perfect');
  });

  it('announces "Difficulty: easy" when SET_DIFFICULTY switches to easy', () => {
    const before = fresh();
    const after = gameReducer(before, { type: 'SET_DIFFICULTY', difficulty: 'easy' });
    expect(diffToMessage(before, after)).toBe('Difficulty: easy');
  });

  it('property: every accepted PLACE_MARK transition produces a non-empty message', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), fc.integer({ min: 0, max: 2 }), (row, col) => {
        const before = fresh();
        const after = gameReducer(before, { type: 'PLACE_MARK', row, col });
        // Only consider the accepted transitions (empty board -> all placements accepted).
        if (after === before) return true;
        const message = diffToMessage(before, after);
        return typeof message === 'string' && message.length > 0;
      }),
    );
  });
});

// Structurally craft terminal states so isResetToEmpty branches can be tested
// independently of reducer reachability.
const wonByX = (): GameState => {
  let state = fresh();
  for (const [row, col] of [
    [0, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
  ] as const) {
    state = gameReducer(state, { type: 'PLACE_MARK', row, col });
  }
  return state;
};

const drawState = (): GameState => {
  let state = fresh();
  for (const [row, col] of [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 2],
    [2, 1],
  ] as const) {
    state = gameReducer(state, { type: 'PLACE_MARK', row, col });
  }
  return state;
};

const emptyBoardState = (): GameState['board'] => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

// Sparse non-empty board: at least one cell filled, but every row has ≥ 1 null.
// Purpose: distinguishes row.every(every-null) from row.every(some-null).
const sparseNonEmptyBoard = (): GameState['board'] => [
  [null, 'X', null],
  [null, null, null],
  [null, null, null],
];

describe('isResetToEmpty', () => {
  it('returns false when before is in_progress (not a post-terminal reset)', () => {
    const before = fresh();
    const after = gameReducer(fresh(), { type: 'RESET' });
    expect(isResetToEmpty(before, after)).toBe(false);
  });

  it('returns false when after is still terminal (no reset happened)', () => {
    const before = wonByX();
    const after = wonByX();
    expect(isResetToEmpty(before, after)).toBe(false);
  });

  // Kills ConditionalExpression mutant on the `after !== in_progress` guard:
  // without that guard, a structurally-invalid "terminal with empty board"
  // would pass the final board-check and return true.
  it('returns false when after is terminal even with an empty board (after-check is load-bearing)', () => {
    const before = wonByX();
    const after: GameState = { ...before, board: emptyBoardState() };
    expect(after.result.status).not.toBe('in_progress');
    expect(isResetToEmpty(before, after)).toBe(false);
  });

  // Kills MethodExpression mutant on `row.every(cell === null)` → `row.some(cell === null)`:
  // every row has ≥ 1 null, but not every cell is null.
  it('returns false when after has a sparsely-populated board (every-vs-some distinction)', () => {
    const before = wonByX();
    const after: GameState = {
      ...before,
      board: sparseNonEmptyBoard(),
      result: { status: 'in_progress' },
    };
    expect(isResetToEmpty(before, after)).toBe(false);
  });

  it('returns false when after is non-empty even if transitioning from terminal', () => {
    const before = wonByX();
    // Craft a hypothetical: post-terminal in_progress but board still has marks.
    const after: GameState = { ...before, result: { status: 'in_progress' } };
    expect(isResetToEmpty(before, after)).toBe(false);
  });

  it('returns true when transitioning from a won terminal to an empty in_progress board', () => {
    const before = wonByX();
    const after = gameReducer(before, { type: 'RESET' });
    expect(isResetToEmpty(before, after)).toBe(true);
  });

  it('returns true when transitioning from a draw terminal to an empty in_progress board', () => {
    const before = drawState();
    const after = gameReducer(before, { type: 'RESET' });
    expect(isResetToEmpty(before, after)).toBe(true);
  });
});

describe('findPlacement', () => {
  it('returns null when before and after are identical', () => {
    const b = emptyBoard();
    expect(findPlacement(b, b)).toBeNull();
  });

  it('locates the diffed coord when one cell changes', () => {
    const before = emptyBoard();
    const afterState = gameReducer(fresh(), { type: 'PLACE_MARK', row: 2, col: 2 });
    const result = findPlacement(before, afterState.board);
    expect(result).toEqual({ row: 2, col: 2, mark: 'X' });
  });

  it.each([
    [0, 1, 'X'],
    [0, 2, 'X'],
    [1, 0, 'X'],
    [1, 2, 'X'],
    [2, 0, 'X'],
    [2, 1, 'X'],
  ] as const)(
    'returns exact coord %i,%i (kills first-iteration short-circuit mutants)',
    (row, col, mark) => {
      const before = emptyBoard();
      const after = gameReducer(fresh(), { type: 'PLACE_MARK', row, col });
      expect(findPlacement(before, after.board)).toEqual({ row, col, mark });
    },
  );

  it('returns null when no empty-to-filled transition exists (same board)', () => {
    const b = gameReducer(fresh(), { type: 'PLACE_MARK', row: 0, col: 0 }).board;
    expect(findPlacement(b, b)).toBeNull();
  });
});

describe('difficultyChangeText', () => {
  it('returns null when difficulty is unchanged', () => {
    const s = fresh();
    expect(difficultyChangeText(s, s)).toBeNull();
  });

  it.each(['easy', 'medium', 'perfect'] as const)(
    'returns "Difficulty: %s" when difficulty changes to that level',
    (difficulty) => {
      const before: GameState = { ...fresh(), difficulty: 'easy' };
      const after: GameState = { ...before, difficulty };
      const expected = before.difficulty === difficulty ? null : `Difficulty: ${difficulty}`;
      expect(difficultyChangeText(before, after)).toBe(expected);
    },
  );
});

describe('combine', () => {
  it('returns null when both prefix and suffix are null', () => {
    expect(combine(null, null)).toBeNull();
  });

  it('returns the prefix alone when suffix is null', () => {
    expect(combine('X at row 1, column 1.', null)).toBe('X at row 1, column 1.');
  });

  it('returns the suffix alone when prefix is null', () => {
    expect(combine(null, 'You win.')).toBe('You win.');
  });

  it('joins both with a single space when both are present', () => {
    expect(combine('X at row 1, column 1.', 'You win.')).toBe('X at row 1, column 1. You win.');
  });

  it('never emits the literal string "null" for one-sided inputs', () => {
    expect(combine(null, 'Draw.')).not.toMatch(/null/);
    expect(combine('X at row 3, column 3.', null)).not.toMatch(/null/);
  });
});
