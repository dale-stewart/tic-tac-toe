/**
 * Shared GameState fixtures for vitest specs. `fresh()` is a thin alias for
 * `initialState()` that reads naturally at the call site ("start from a fresh
 * game, then ...") without hiding intent.
 */
import { initialState, type GameState } from '../../src/core/game';

export const fresh = (): GameState => initialState();
