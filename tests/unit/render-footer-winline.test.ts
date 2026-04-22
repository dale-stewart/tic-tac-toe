/**
 * Unit tests for the pure helpers added in slice 06 + 07:
 *   - footerCopy()        — copy for the no-ads trust footer
 *   - sourceLinkLabel()   — label text for the [source] link
 *   - SOURCE_REPO_URL     — canonical repo URL
 *   - winLineEndpoints()  — SVG endpoint coordinates from a WinLine
 *
 * Property-based tests cover invariants for winLineEndpoints — for any valid
 * WinLine the endpoints are finite, within the unit grid, and ordered from
 * the first cell to the last cell of the line.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  footerCopy,
  sourceLinkLabel,
  SOURCE_REPO_URL,
  winLineEndpoints,
} from '../../src/adapters/render-strings';
import { LINES, type WinLine } from '../../src/core/win-detector';

describe('footerCopy', () => {
  it('returns the no-ads, no-signup, no-tracking trust copy verbatim', () => {
    expect(footerCopy()).toBe('No ads. No signup. No tracking.');
  });
});

describe('sourceLinkLabel', () => {
  it('returns the bracketed [source] label', () => {
    expect(sourceLinkLabel()).toBe('[source]');
  });
});

describe('SOURCE_REPO_URL', () => {
  it('points at the canonical public repository URL', () => {
    expect(SOURCE_REPO_URL).toBe('https://github.com/dale-stewart/tic-tac-toe');
  });
});

describe('winLineEndpoints', () => {
  it('maps the top row to a horizontal segment at y=0.5', () => {
    const line: WinLine = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ];
    expect(winLineEndpoints(line)).toEqual({ x1: 0.5, y1: 0.5, x2: 2.5, y2: 0.5 });
  });

  it('maps the middle column to a vertical segment at x=1.5', () => {
    const line: WinLine = [
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
    ];
    expect(winLineEndpoints(line)).toEqual({ x1: 1.5, y1: 0.5, x2: 1.5, y2: 2.5 });
  });

  it('maps the main diagonal from top-left-center to bottom-right-center', () => {
    const line: WinLine = [
      { row: 0, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 2 },
    ];
    expect(winLineEndpoints(line)).toEqual({ x1: 0.5, y1: 0.5, x2: 2.5, y2: 2.5 });
  });

  it('maps the anti-diagonal from top-right to bottom-left', () => {
    const line: WinLine = [
      { row: 0, col: 2 },
      { row: 1, col: 1 },
      { row: 2, col: 0 },
    ];
    expect(winLineEndpoints(line)).toEqual({ x1: 2.5, y1: 0.5, x2: 0.5, y2: 2.5 });
  });

  it('property: every endpoint coordinate is within the 3x3 unit grid [0.5, 2.5]', () => {
    fc.assert(
      fc.property(fc.constantFrom(...LINES), (line) => {
        const { x1, y1, x2, y2 } = winLineEndpoints(line);
        for (const value of [x1, y1, x2, y2]) {
          expect(value).toBeGreaterThanOrEqual(0.5);
          expect(value).toBeLessThanOrEqual(2.5);
        }
      }),
    );
  });

  it('property: endpoints match the first and last cell centers of the line', () => {
    fc.assert(
      fc.property(fc.constantFrom(...LINES), (line) => {
        const { x1, y1, x2, y2 } = winLineEndpoints(line);
        const [first, , third] = line;
        expect(x1).toBe(first.col + 0.5);
        expect(y1).toBe(first.row + 0.5);
        expect(x2).toBe(third.col + 0.5);
        expect(y2).toBe(third.row + 0.5);
      }),
    );
  });
});
