/**
 * Slice 05 unit tests — hot-seat pure helpers + SET_MODE reducer branch.
 *
 * Covers:
 *   - gameReducer SET_MODE action: accepted at fresh/terminal, rejected mid-game,
 *     accepted switches reset the board and preserve difficulty.
 *   - render-strings mode-aware turn/banner/label helpers.
 *   - announce-strings modeChangeText.
 *   - keyboard-pure keyToMode.
 *
 * Property tests verify mode-invariant rules (the win detector vocabulary is
 * shared with solo mode; SET_MODE always resets the board).
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { gameReducer } from '../../src/core/game';
import { fresh } from '../support/game';
import type { GameResult, WinLine } from '../../src/core/win-detector';
import {
  bannerTextFor,
  MODE_OPTIONS,
  modeGroupAriaLabel,
  modeLabelText,
  modeRadioAriaLabel,
  turnIndicatorText,
} from '../../src/adapters/render-strings';
import { modeChangeText, diffToMessage } from '../../src/adapters/announce-strings';
import { keyToMode } from '../../src/adapters/input/keyboard-pure';

describe('gameReducer SET_MODE', () => {
  it('SET_MODE on a fresh board switches mode and resets (no-op on board) preserving difficulty', () => {
    const s0 = fresh();
    const s1 = gameReducer(s0, { type: 'SET_MODE', mode: 'hot-seat' });
    expect(s1.mode).toBe('hot-seat');
    expect(s1.turn).toBe('X');
    expect(s1.result.status).toBe('in_progress');
    expect(s1.difficulty).toBe(s0.difficulty);
    for (const row of s1.board) for (const cell of row) expect(cell).toBeNull();
  });

  it('SET_MODE to the current mode is a reference-preserving no-op', () => {
    const s0 = fresh();
    const s1 = gameReducer(s0, { type: 'SET_MODE', mode: 'solo' });
    expect(s1).toBe(s0);
  });

  it('SET_MODE is rejected mid-game (at least one mark placed, in progress)', () => {
    let state = fresh();
    state = gameReducer(state, { type: 'PLACE_MARK', row: 1, col: 1 });
    const attempted = gameReducer(state, { type: 'SET_MODE', mode: 'hot-seat' });
    expect(attempted).toBe(state);
    expect(attempted.mode).toBe('solo');
  });

  it('SET_MODE accepted at terminal state resets board and flips mode', () => {
    // Drive to X win on top row.
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
    expect(state.result.status).toBe('won');
    const updated = gameReducer(state, { type: 'SET_MODE', mode: 'hot-seat' });
    expect(updated.mode).toBe('hot-seat');
    expect(updated.result.status).toBe('in_progress');
    for (const row of updated.board) for (const cell of row) expect(cell).toBeNull();
  });

  it('SET_MODE switching hot-seat -> solo also resets', () => {
    let state = fresh();
    state = gameReducer(state, { type: 'SET_MODE', mode: 'hot-seat' });
    expect(state.mode).toBe('hot-seat');
    const back = gameReducer(state, { type: 'SET_MODE', mode: 'solo' });
    expect(back.mode).toBe('solo');
    expect(back.result.status).toBe('in_progress');
  });

  it('RESET preserves mode (hot-seat survives rematch)', () => {
    let state = fresh();
    state = gameReducer(state, { type: 'SET_MODE', mode: 'hot-seat' });
    state = gameReducer(state, { type: 'PLACE_MARK', row: 0, col: 0 });
    const reset = gameReducer(state, { type: 'RESET' });
    expect(reset.mode).toBe('hot-seat');
  });

  it('[property] accepted SET_MODE always yields an empty board in progress', () => {
    fc.assert(
      fc.property(fc.constantFrom<'solo' | 'hot-seat'>('solo', 'hot-seat'), (targetMode) => {
        const s0 = fresh();
        const s1 = gameReducer(s0, { type: 'SET_MODE', mode: targetMode });
        if (s1 === s0) return true; // same-mode no-op
        // Accepted switch: board must be empty and in_progress.
        for (const row of s1.board) for (const cell of row) if (cell !== null) return false;
        return s1.result.status === 'in_progress' && s1.turn === 'X';
      }),
    );
  });
});

describe('render-strings mode-aware helpers', () => {
  it('turnIndicatorText in solo uses "Your turn"', () => {
    expect(turnIndicatorText('X', 'solo')).toBe('Your turn (X).');
    expect(turnIndicatorText('O', 'solo')).toBe('Your turn (O).');
  });

  it('turnIndicatorText in hot-seat uses P1/P2 vocabulary', () => {
    expect(turnIndicatorText('X', 'hot-seat')).toBe("P1's turn (X).");
    expect(turnIndicatorText('O', 'hot-seat')).toBe("P2's turn (O).");
  });

  const topRowLine: WinLine = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
  ];
  const xWins: GameResult = { status: 'won', winner: 'X', line: topRowLine };
  const oWins: GameResult = { status: 'won', winner: 'O', line: topRowLine };

  it('bannerTextFor hot-seat uses P1/P2 on win, Draw. on draw', () => {
    expect(bannerTextFor(xWins, 'X', 'hot-seat')).toBe('P1 wins!');
    expect(bannerTextFor(oWins, 'X', 'hot-seat')).toBe('P2 wins!');
    expect(bannerTextFor({ status: 'draw' }, 'X', 'hot-seat')).toBe('Draw.');
    expect(bannerTextFor({ status: 'in_progress' }, 'X', 'hot-seat')).toBeNull();
  });

  it('bannerTextFor solo keeps "You win!" / "AI wins." (backwards compat)', () => {
    expect(bannerTextFor(xWins, 'X', 'solo')).toBe('You win!');
    expect(bannerTextFor(oWins, 'X', 'solo')).toBe('AI wins.');
  });

  it('MODE_OPTIONS lists solo and hot-seat in display order', () => {
    expect(MODE_OPTIONS).toEqual(['solo', 'hot-seat']);
  });

  it('modeLabelText returns the mode literal for display', () => {
    expect(modeLabelText('solo')).toBe('Solo');
    expect(modeLabelText('hot-seat')).toBe('Hot-seat');
  });

  it('modeRadioAriaLabel prefixes "Mode:"', () => {
    expect(modeRadioAriaLabel('solo')).toBe('Mode: solo');
    expect(modeRadioAriaLabel('hot-seat')).toBe('Mode: hot-seat');
  });

  it('modeGroupAriaLabel returns "Mode"', () => {
    expect(modeGroupAriaLabel()).toBe('Mode');
  });
});

describe('announce-strings modeChangeText', () => {
  it('returns null when mode is unchanged', () => {
    const s = fresh();
    expect(modeChangeText(s, s)).toBeNull();
  });

  it('returns "Mode: hot-seat" when switching to hot-seat', () => {
    const before = fresh();
    const after = gameReducer(before, { type: 'SET_MODE', mode: 'hot-seat' });
    expect(modeChangeText(before, after)).toBe('Mode: hot-seat');
  });

  it('returns "Mode: solo" when switching back to solo', () => {
    const hot = gameReducer(fresh(), { type: 'SET_MODE', mode: 'hot-seat' });
    const back = gameReducer(hot, { type: 'SET_MODE', mode: 'solo' });
    expect(modeChangeText(hot, back)).toBe('Mode: solo');
  });

  it('diffToMessage announces mode change end-to-end', () => {
    const before = fresh();
    const after = gameReducer(before, { type: 'SET_MODE', mode: 'hot-seat' });
    expect(diffToMessage(before, after)).toBe('Mode: hot-seat');
  });
});

describe('keyboard-pure keyToMode', () => {
  it('maps "h" and "H" to the toggle signal', () => {
    expect(keyToMode('h')).toBe('toggle');
    expect(keyToMode('H')).toBe('toggle');
  });

  it('returns null for any other key', () => {
    for (const key of ['a', '1', 'Enter', 'Space', 'ArrowLeft', 'M']) {
      expect(keyToMode(key)).toBeNull();
    }
  });
});
