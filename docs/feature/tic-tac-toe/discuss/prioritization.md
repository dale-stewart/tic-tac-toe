# Prioritization: tic-tac-toe

**Feature:** tic-tac-toe
**Wave:** DISCUSS
**Basis:** walking skeleton + Elephant Carpaccio + outcome-linked slicing
**Evidence tier:** C (illustrative, practice exercise)

---

## Framing note on learning hypotheses

On a toy project, "riskiest market assumption" is nearly empty — tic-tac-toe is a solved classic played by billions. Forcing market-learning hypotheses on each slice would be theatre.

Instead, each slice carries a **craft / build hypothesis** — a learnable claim about *how we build*, not *what users want*. These are labeled `[BUILD]` to distinguish them from `[MARKET]` hypotheses that a real product would carry.

Example:
- `[BUILD]` *"We can wire up an ARIA live region correctly on the first try."* — falsifiable by shipping Slice 3 and failing an a11y audit.
- `[MARKET]` *"Players prefer medium-difficulty AI over perfect AI."* — would require real users. Not present here.

---

## Release Priority

| Priority | Release | Target Outcome | KPI link | Rationale |
|----------|---------|---------------|----------|-----------|
| 1 | **Walking Skeleton** (Slice 1+2) | End-to-end deploy works; player can complete one game | KPI-1 (time-to-first-move) | Derisks build pipeline. Everything else is hypothetical until this runs. |
| 2 | **Release 1 — core v1** (Slices 3-5) | Player can choose difficulty or hot-seat; game is a11y-usable | KPI-1, KPI-2 (game completion), KPI-3 (a11y score) | Delivers the v1 scope promise from DISCOVER D1. A11y is non-negotiable (D4). |
| 3 | **Release 2 — craft polish** (Slices 6-7) | Game feels considered; no regression on R1 | KPI-3 (a11y), KPI-4 (Lighthouse perf) | Finishes the portfolio / craft-project framing from DISCOVER viability analysis. |
| Deferred | Backlog | Variants, networked MP, accounts | — | Out of scope per D1, D2. Revisit post-v1 if demand surfaces. |

---

## Slice Breakdown (feeds `slices/slice-NN-name.md`)

### Walking Skeleton

| # | Slice name | Effort | Hypothesis | KPI targeted |
|---|-----------|--------|-----------|--------------|
| 1 | render-empty-board | ≤ 4h | `[BUILD]` *"We can ship a static SPA with a keyboard-focusable 3x3 grid and an ARIA-labeled turn indicator in half a day."* | KPI-1 (time-to-first-move) |
| 2 | accept-one-move-and-random-ai | ≤ 4h | `[BUILD]` *"We can turn the grid into a playable game with a random-move AI, win detection, and a Play-again reset, in half a day."* | KPI-2 (game completion) |

### Release 1 — core v1

| # | Slice name | Effort | Hypothesis | KPI targeted |
|---|-----------|--------|-----------|--------------|
| 3 | keyboard-and-aria-baseline | ≤ 1 day | `[BUILD]` *"WCAG 2.2 AA baseline (keyboard nav, ARIA live, visible focus) passes an automated a11y audit on the first try if built with semantic HTML from the start."* | KPI-3 (Lighthouse a11y ≥ 95) |
| 4 | difficulty-levels | ≤ 1 day | `[BUILD]` *"Easy (random) / medium (one-move-ahead heuristic) / perfect (minimax) can be implemented as three small pure functions sharing a common signature."* | KPI-2 (game completion) |
| 5 | hot-seat-mode | ≤ 0.5 day | `[BUILD]` *"Hot-seat reuses the same board and win-detector as solo — adding hot-seat is a vocabulary-and-gating change, not a new game model."* | KPI-2 (game completion) |

### Release 2 — craft polish

| # | Slice name | Effort | Hypothesis | KPI targeted |
|---|-----------|--------|-----------|--------------|
| 6 | win-line-animation-and-palette | ≤ 0.5 day | `[BUILD]` *"Win-line animation and a color-blind-safe palette can be added without regressing the a11y audit."* | KPI-3 (a11y), KPI-4 (Lighthouse perf ≥ 90) |
| 7 | no-ads-footer-and-source-link | ≤ 0.25 day | `[BUILD]` *"Explicit trust messaging ('no ads, no signup, no tracking') and a source-code link are a one-file change."* | KPI-5 (0 server-persisted PII), indirectly supports DISCOVER O4 trust outcome |

**Total slice count: 7. Each ≤ 1 day. All sliced end-to-end by user-observable behavior (none are pure refactors or layers).**

---

## Elephant Carpaccio Taste Tests

Per the user-story-mapping skill (anti-patterns section) and Conery/Marick's "elephant carpaccio" heuristics:

| Test | Pass? | Evidence |
|------|-------|----------|
| Does every slice deliver a user-observable change? | YES | Slices 1-7 each change what the player sees or hears |
| Can each slice ship in ≤ 1 day? | YES | Effort estimates 0.25-1 day |
| Does any slice ship 4+ UI components at once? | NO | Each slice adds at most one user-visible component (turn indicator / AI / difficulty selector / palette etc.) |
| Is a new abstraction introduced in every slice? | NO | Abstractions: `boardState` + win detector appear in Slice 2 and are reused in 3-7. AI-move abstraction is in Slice 2 (random) and extended (not reintroduced) in Slice 4. |
| Is feature-first slicing avoided? | YES | Slicing is by user-observable outcome, not by layer (no "render layer" slice, no "logic layer" slice) |
| Does every slice have an explicit hypothesis? | YES | See hypothesis column above; all labeled `[BUILD]` per the craft-project framing |
| Does the walking skeleton cover every backbone activity? | YES | Arrive / See / Pick (implicit default) / Take Turns / End / Replay all covered by Slices 1-2 |
| Are any slices orphaned (no outcome KPI link)? | NO | All slices trace to at least one KPI |

**Taste tests: all pass.**

---

## Backlog suggestions (stories map to slices)

| Story ID | Slice | Priority | Outcome link | Dependencies |
|----------|-------|----------|-------------|--------------|
| US-01 Empty board on load | 1 | P1 (walking skeleton) | KPI-1 | None |
| US-02 Complete a first game (random AI) | 2 | P1 (walking skeleton) | KPI-2 | US-01 |
| US-03 Keyboard and screen-reader baseline | 3 | P1 (R1) | KPI-3 | US-02 |
| US-04 Choose AI difficulty | 4 | P2 (R1) | KPI-2 | US-02, US-03 |
| US-05 Hot-seat pair on one device | 5 | P2 (R1) | KPI-2 | US-02 |
| US-06 Game feels polished | 6 | P3 (R2) | KPI-3, KPI-4 | US-03, US-04, US-05 |
| US-07 Trust messaging visible | 7 | P3 (R2) | KPI-5 | US-01 |

> Story IDs assigned in Phase 3 (Requirements) — see `user-stories.md`. Revisit this table if the story set changes.
