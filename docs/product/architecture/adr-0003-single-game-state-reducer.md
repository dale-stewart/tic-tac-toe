# ADR-0003: Single game-state reducer with typed actions

## Status

Accepted — 2026-04-21

## Context

DISCUSS peer review flagged as **non-negotiable**: `boardState` must be a single source of truth. The application has multiple inputs (pointer clicks, keyboard events, AI turns, mode/difficulty toggles) that all need to mutate game state consistently, without race conditions or partial updates. Result display, announcer output, and render pipeline all read from the same state.

Additionally, the FP paradigm choice (ADR-0001) prefers pure transitions over in-place mutation.

## Decision

All state transitions flow through a **single pure reducer** `reduce(gameState, action) ⇒ gameState'`, with a **discriminated-union `Action` type** enumerating every legal transition:

```
type Action =
  | { type: 'PLACE_MARK'; coord: [row, col] }
  | { type: 'RESET' }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty };
```

The reducer is the **only** code path that produces a new `GameState`. All adapters (keyboard, pointer, AI) emit `Action` values; the bootstrap dispatches them through the reducer. No adapter mutates state directly. No state exists outside `GameState` (no module-local variables holding game data).

## Consequences

**Positive**
- Single source of truth is enforced by construction.
- Every transition is a named, typed action — trivially testable and greppable ("where can `turn` change? only in the reducer's `PLACE_MARK` branch").
- Time-travel / undo (not required but easy) is a matter of storing a state history.
- Debugging collapses to "log the action stream" — the state at any point is fully determined by initial state + action sequence.
- AI invocation can be modelled cleanly: the reducer advances state after a human move; the bootstrap notices `turn` changed to the AI mark in solo mode and dispatches a follow-up `PLACE_MARK`. The reducer never runs non-determinism inline.

**Negative**
- Adding a new kind of transition means (a) adding an `Action` variant, (b) adding a reducer branch, (c) potentially an adapter change. This is a feature, not a bug — it makes new state pathways explicit.
- Slightly more ceremony than "just call `game.placeMark(r,c)`" would be. Acceptable cost for the guarantee.

## Alternatives considered

**Scattered reactive primitives** (e.g., per-value `$state` signals — Svelte, SolidJS, or hand-rolled observables).
- *Rejected because:* DISCUSS peer review explicitly called this out — multiple independent signals re-create the problem the single-source-of-truth rule was written to prevent. If `boardState` lives in one signal and `turn` in another, an update-ordering bug can leave them inconsistent.

**External store library** (Zustand, Redux Toolkit, XState).
- *Rejected because:* (a) adds bundle cost (~1-3KB) for zero incremental value — our reducer is one function, stores provide subscribe/middleware/devtools machinery we don't need; (b) our AI turn scheduling is cleaner as a bootstrap concern than as middleware; (c) every state update is already a pure function — we're not missing any abstraction.

**Class-based `Game` object with mutating methods** (`game.placeMark(r, c)`, `game.reset()`).
- *Rejected because:* (a) directly violates ADR-0001 (FP paradigm); (b) introduces shared mutable state — the exact thing the single-source-of-truth constraint exists to prevent aliasing problems with; (c) makes property testing harder (need to reset / clone between trials).
