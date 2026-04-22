/**
 * AI port — the shared-signature registry.
 *
 * Per architecture brief [D6]: every difficulty level is a pure function of
 *   (state, mark, rng?) => [row, col]
 * behind a typed `strategies` record. Adding a fourth difficulty is a 1-line
 * registry change.
 */
import type { BoardState, Mark } from '../board';
import { chooseRandomMove } from './easy';
import { chooseMediumMove } from './medium';
import { choosePerfectMove } from './perfect';

export type Difficulty = 'easy' | 'medium' | 'perfect';

export type Rng = () => number;

export type AiFn = (state: BoardState, mark: Mark, rng?: Rng) => readonly [number, number];

export const strategies: Readonly<Record<Difficulty, AiFn>> = {
  easy: chooseRandomMove,
  medium: chooseMediumMove,
  perfect: choosePerfectMove,
};
