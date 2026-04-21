# ADR-0001: Functional paradigm for the game core

## Status

Accepted — 2026-04-21

## Context

The tic-tac-toe SPA has a small, rule-driven domain: an immutable 3×3 grid, a well-defined set of legal transitions, three AI strategies sharing a uniform signature `(state, mark) => [row, col]`, and a single-source-of-truth `boardState` requirement (flagged non-negotiable in DISCUSS peer review).

Quality attributes that matter most here: testability (property-based tests of "perfect AI never loses"), determinism (given a state and a seed, the system is reproducible), single-source-of-truth enforcement, and low cognitive load for a solo practitioner building this as a methodology exercise.

## Decision

Implement the game core using the **functional programming paradigm**:

- All core modules are plain functions over plain data. No classes, no `this`, no mutation.
- `BoardState` and `GameState` are immutable records (TypeScript `readonly` throughout).
- State transitions are expressed as `reduce(state, action) ⇒ state'` — a pure function.
- The three AIs are pure functions matching the shared signature.
- Effects (RNG for easy AI, DOM writes, time) are confined to adapters; the core takes them as parameters when needed (e.g., seeded RNG), or simply doesn't touch them.

CLAUDE.md records this choice so downstream crafter invocations route to `@nw-functional-software-crafter`.

## Consequences

**Positive**
- Property-based testing is natural: pure functions + immutable data = ideal fast-check targets.
- "Single source of truth" is enforced by construction — the reducer is the only producer of new `GameState`.
- Uniform AI signature is trivial: three functions, same shape.
- Core has zero dependency on browser APIs, trivially unit-testable in Node/Vitest.
- Refactoring is safer — no hidden mutable state aliased across call sites.

**Negative**
- TypeScript's support for sum types and pattern matching is less ergonomic than ML-family languages; discriminated unions + `switch` are the workaround.
- Persistent data structures are done by hand (spread operators) rather than via a library; acceptable at 3×3 scale, would want Immer or an equivalent at larger scale.

## Alternatives considered

**OOP with strategy pattern** — `Board` class with `placeMark(move)` mutation, `Game` aggregate owning a `Board`, `AiStrategy` interface with `Easy`/`Medium`/`Perfect` subclasses.
- *Rejected because:* (a) encourages mutation of `Board` which undermines the DISCUSS-flagged single-source-of-truth constraint; (b) the strategy pattern is a well-known OOP attempt to simulate what FP gives you for free (swappable functions with a common signature); (c) property testing pure functions is easier than property testing objects with hidden state; (d) the problem is small and rule-dense — exactly where FP shines and where OOP adds ceremony with no payoff.

**Hybrid: FP core + OOP bootstrap** — pure-FP domain, class-based adapter layer.
- *Rejected because:* the adapter layer is ~30 lines of wiring plus four small modules. Introducing classes for that would be ceremony at cost of uniformity. Plain module-scoped functions are sufficient and consistent with the core.
