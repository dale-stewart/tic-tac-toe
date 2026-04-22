/**
 * Property: every difficulty answers the same question in the same shape.
 *
 * For any legal in-progress board with ≥ 1 empty cell, each of easy / medium /
 * perfect returns a coordinate that points at an empty cell.
 */
import { describe, it } from 'vitest';
import fc from 'fast-check';
import { strategies, type Difficulty } from '../../src/core/ai';
import { emptyBoard, placeMark, type BoardState, type Mark } from '../../src/core/board';
import { detectResult } from '../../src/core/win-detector';

// Generator: a legal in-progress board reached by applying 0..8 alternating
// PLACE_MARK moves to an empty board. Shrinks naturally on move count.
const legalBoardAndMark = (): fc.Arbitrary<{ board: BoardState; toPlay: Mark }> =>
  fc
    .array(fc.tuple(fc.integer({ min: 0, max: 2 }), fc.integer({ min: 0, max: 2 })), {
      minLength: 0,
      maxLength: 8,
    })
    .map((moves) => {
      let board: BoardState = emptyBoard();
      let turn: Mark = 'X';
      for (const [row, col] of moves) {
        if (detectResult(board).status !== 'in_progress') break;
        const placed = placeMark(board, row, col, turn);
        if (!placed.ok) continue; // skip rejected duplicate moves
        board = placed.value;
        turn = turn === 'X' ? 'O' : 'X';
      }
      return { board, toPlay: turn };
    })
    .filter(({ board }) => detectResult(board).status === 'in_progress');

const difficulties: readonly Difficulty[] = ['easy', 'medium', 'perfect'];

describe('AI shared-signature property', () => {
  it('[property] every strategy returns a coordinate of an empty cell on any legal in-progress board', () => {
    fc.assert(
      fc.property(legalBoardAndMark(), ({ board, toPlay }) => {
        for (const difficulty of difficulties) {
          const [row, col] = strategies[difficulty](board, toPlay);
          if (row < 0 || row > 2 || col < 0 || col > 2) return false;
          if (board[row]![col] !== null) return false;
        }
        return true;
      }),
      { numRuns: 200 },
    );
  });
});
