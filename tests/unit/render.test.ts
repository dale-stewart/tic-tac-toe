/**
 * Unit tests for the pure string helpers used by the render adapter.
 * TemplateResult builders (renderBoard / renderBanner / renderCell) are
 * covered by Playwright; they live in render.ts.
 */
import { describe, it, expect } from 'vitest';
import {
  ANCIENT_BROWSER_MESSAGE,
  ariaLabelForCell,
  bannerTextFor,
  cellText,
  difficultyGroupAriaLabel,
  difficultyLabelText,
  difficultyRadioAriaLabel,
  DIFFICULTY_OPTIONS,
  turnIndicatorText,
} from '../../src/adapters/render-strings';
import type { GameResult } from '../../src/core/win-detector';

describe('ANCIENT_BROWSER_MESSAGE', () => {
  it('names concrete modern browsers so users know what to install', () => {
    expect(ANCIENT_BROWSER_MESSAGE).toMatch(/modern browser/i);
    expect(ANCIENT_BROWSER_MESSAGE).toMatch(/Firefox/);
    expect(ANCIENT_BROWSER_MESSAGE).toMatch(/Chrome/);
  });
});

describe('turnIndicatorText', () => {
  it('formats X turn', () => {
    expect(turnIndicatorText('X')).toBe('Your turn (X).');
  });

  it('formats O turn', () => {
    expect(turnIndicatorText('O')).toBe('Your turn (O).');
  });
});

describe('ariaLabelForCell', () => {
  it('labels an empty cell with 1-indexed row/col', () => {
    expect(ariaLabelForCell(0, 0, null)).toBe('Row 1 column 1, empty');
  });

  it('labels a filled cell with the mark', () => {
    expect(ariaLabelForCell(1, 2, 'X')).toBe('Row 2 column 3, X');
  });

  it('handles O in the bottom-right corner', () => {
    expect(ariaLabelForCell(2, 2, 'O')).toBe('Row 3 column 3, O');
  });
});

describe('cellText', () => {
  it('renders an empty cell as the empty string', () => {
    expect(cellText(null)).toBe('');
  });

  it('renders a marked cell as its mark', () => {
    expect(cellText('X')).toBe('X');
    expect(cellText('O')).toBe('O');
  });
});

describe('bannerTextFor', () => {
  const inProgress: GameResult = { status: 'in_progress' };
  const draw: GameResult = { status: 'draw' };
  const xWins: GameResult = {
    status: 'won',
    winner: 'X',
    line: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ],
  };
  const oWins: GameResult = {
    status: 'won',
    winner: 'O',
    line: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ],
  };

  it('returns null while the game is in progress', () => {
    expect(bannerTextFor(inProgress, 'X')).toBeNull();
  });

  it('returns "Draw." on a draw', () => {
    expect(bannerTextFor(draw, 'X')).toBe('Draw.');
  });

  it('returns "You win!" when the human mark wins', () => {
    expect(bannerTextFor(xWins, 'X')).toBe('You win!');
  });

  it('returns "AI wins." when the human mark loses', () => {
    expect(bannerTextFor(oWins, 'X')).toBe('AI wins.');
  });
});

describe('difficulty string helpers', () => {
  it('DIFFICULTY_OPTIONS lists easy, medium, perfect in order', () => {
    expect(DIFFICULTY_OPTIONS).toEqual(['easy', 'medium', 'perfect']);
  });

  it('difficultyLabelText returns the level name verbatim', () => {
    expect(difficultyLabelText('easy')).toBe('easy');
    expect(difficultyLabelText('medium')).toBe('medium');
    expect(difficultyLabelText('perfect')).toBe('perfect');
  });

  it('difficultyRadioAriaLabel prefixes "Difficulty:"', () => {
    expect(difficultyRadioAriaLabel('easy')).toBe('Difficulty: easy');
    expect(difficultyRadioAriaLabel('medium')).toBe('Difficulty: medium');
    expect(difficultyRadioAriaLabel('perfect')).toBe('Difficulty: perfect');
  });

  it('difficultyGroupAriaLabel returns the group-level label', () => {
    expect(difficultyGroupAriaLabel()).toBe('Difficulty');
  });
});
