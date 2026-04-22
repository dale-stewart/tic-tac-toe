/**
 * Unit tests for the pure keyboard-input helpers.
 *
 * Pattern mirrors tests/unit/pointer (via walking-skeleton) — the handler is
 * a pure function `actionFromKeyEvent(key, focusedCoord)` returning either a
 * PLACE_MARK Action, a FocusMove directive, or null (key not handled).
 * The DOM-attaching wrapper is covered by Playwright in tests/e2e/.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  keyToDifficulty,
  keyToIntent,
  nextFocusFor,
  type KeyIntent,
} from '../../src/adapters/input/keyboard-pure';

const coord = (): fc.Arbitrary<readonly [number, number]> =>
  fc.tuple(fc.integer({ min: 0, max: 2 }), fc.integer({ min: 0, max: 2 }));

describe('keyToIntent', () => {
  it('maps ArrowLeft/Right/Up/Down to directional move intents', () => {
    expect(keyToIntent('ArrowLeft')).toEqual<KeyIntent>({ kind: 'move', direction: 'left' });
    expect(keyToIntent('ArrowRight')).toEqual<KeyIntent>({ kind: 'move', direction: 'right' });
    expect(keyToIntent('ArrowUp')).toEqual<KeyIntent>({ kind: 'move', direction: 'up' });
    expect(keyToIntent('ArrowDown')).toEqual<KeyIntent>({ kind: 'move', direction: 'down' });
  });

  it('maps Enter and Space (both " " and "Space" forms) to the activate intent', () => {
    expect(keyToIntent('Enter')).toEqual<KeyIntent>({ kind: 'activate' });
    expect(keyToIntent(' ')).toEqual<KeyIntent>({ kind: 'activate' });
    expect(keyToIntent('Space')).toEqual<KeyIntent>({ kind: 'activate' });
  });

  it('returns null for any other key', () => {
    for (const key of ['a', 'Escape', 'Tab', 'Shift', 'F5', '1']) {
      expect(keyToIntent(key)).toBeNull();
    }
  });
});

describe('nextFocusFor', () => {
  it('moves right/down increment the in-range axis; left/up decrement it', () => {
    expect(nextFocusFor([0, 0], 'right')).toEqual([0, 1]);
    expect(nextFocusFor([0, 1], 'down')).toEqual([1, 1]);
    expect(nextFocusFor([1, 1], 'left')).toEqual([1, 0]);
    expect(nextFocusFor([2, 2], 'up')).toEqual([1, 2]);
  });

  it('never wraps: edge moves return the same coordinate', () => {
    expect(nextFocusFor([0, 0], 'left')).toEqual([0, 0]);
    expect(nextFocusFor([0, 0], 'up')).toEqual([0, 0]);
    expect(nextFocusFor([2, 2], 'right')).toEqual([2, 2]);
    expect(nextFocusFor([2, 2], 'down')).toEqual([2, 2]);
  });

  it('property: every move stays within [0,2] x [0,2]', () => {
    fc.assert(
      fc.property(
        coord(),
        fc.constantFrom('left', 'right', 'up', 'down') as fc.Arbitrary<
          'left' | 'right' | 'up' | 'down'
        >,
        (from, direction) => {
          const [row, col] = nextFocusFor(from, direction);
          return row >= 0 && row <= 2 && col >= 0 && col <= 2;
        },
      ),
    );
  });

  it('keyToDifficulty maps 1/2/3 to easy/medium/perfect', () => {
    expect(keyToDifficulty('1')).toBe('easy');
    expect(keyToDifficulty('2')).toBe('medium');
    expect(keyToDifficulty('3')).toBe('perfect');
  });

  it('keyToDifficulty returns null for any other key', () => {
    for (const key of ['0', '4', '9', 'a', 'Enter', ' ', 'ArrowUp', 'Tab']) {
      expect(keyToDifficulty(key)).toBeNull();
    }
  });

  it('property: a move changes at most one axis by exactly 1', () => {
    fc.assert(
      fc.property(
        coord(),
        fc.constantFrom('left', 'right', 'up', 'down') as fc.Arbitrary<
          'left' | 'right' | 'up' | 'down'
        >,
        (from, direction) => {
          const [fromRow, fromCol] = from;
          const [toRow, toCol] = nextFocusFor(from, direction);
          const rowDelta = Math.abs(toRow - fromRow);
          const colDelta = Math.abs(toCol - fromCol);
          return rowDelta + colDelta <= 1;
        },
      ),
    );
  });
});
