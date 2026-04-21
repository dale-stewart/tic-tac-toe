# Opportunity Solution Tree — tic-tac-toe

**Phase:** 2 of 4 (Opportunity Mapping)
**Status:** Conditional pass (practice exercise, Tier C)
**Date:** 2026-04-21

---

## Practice Exercise Disclaimer

> `[ILLUSTRATIVE — practice exercise; real DISCOVER would populate scores from N>=10 cumulative interviews using the Opportunity Algorithm (Importance + Max(0, Importance - Satisfaction))]`

Scores below are reasoned estimates, not customer-sourced means. Every score block is labeled.

---

## 1. Desired Outcome

> `[ILLUSTRATIVE — derived from Phase 1 primary JTBD]`

**"As a casual web user, I can complete a single satisfying game of tic-tac-toe in under 90 seconds with zero setup, zero signup, and zero interruption."**

Measurable proxy: time-from-URL-to-first-move < 5 seconds; session completion rate > 70%; zero account friction; zero modal interrupts.

---

## 2. Opportunity Solution Tree

```
Desired Outcome: Complete a satisfying TTT game in <90s, zero friction
|
+-- O1: Reduce time-from-intent-to-first-move  [score 14]
|     +-- S1a: Single-page app, auto-start new game on load
|     +-- S1b: No signup, no cookie wall, no "choose mode" modal
|     +-- S1c: Smart default opponent (easy AI) selected automatically
|
+-- O2: Make solo play actually fun despite solved-game problem  [score 13]
|     +-- S2a: Multi-difficulty AI (easy / medium / perfect)
|     +-- S2b: Streaks, daily puzzles, or "beat the AI in N moves" challenges
|     +-- S2c: Variant toggle (Ultimate TTT, 4x4, misere) for repeat users
|
+-- O3: Enable frictionless two-human play  [score 11]
|     +-- S3a: Hot-seat (same device) mode, one-tap toggle
|     +-- S3b: Shareable URL for async remote play (like chess-by-URL)
|     +-- S3c: Real-time rooms with short codes (higher complexity)
|
+-- O4: Make it trustworthy (no ads, no tracking, no dark patterns)  [score 12]
|     +-- S4a: No ads, ever; monetization via donate / "buy me a coffee" only
|     +-- S4b: No account required; no analytics beyond aggregate counters
|     +-- S4c: Open source so claims are verifiable
|
+-- O5: Support the "teach a child" JTBD  [score 9]
|     +-- S5a: Large-touch-target UI, high-contrast palette
|     +-- S5b: Gentle "easy" AI that sometimes loses on purpose
|     +-- S5c: Visual win-line animation that celebrates without overstimulating
|
+-- O6: Meet accessibility expectations as baseline  [score 8]
|     +-- S6a: Full keyboard nav, visible focus, ARIA live regions
|     +-- S6b: Screen-reader announcement of board state and moves
|     +-- S6c: Color-blind-safe X/O palette, not color-dependent for win detection
|
+-- O7: Serve the hobbyist who wants a *deeper* game  [score 6]
      +-- S7a: Ultimate TTT as first-class mode
      +-- S7b: NxN boards, configurable win-length
      +-- S7c: Move history and analysis overlay
```

---

## 3. Opportunity Scoring

> `[ILLUSTRATIVE — scored by Scout using the Opportunity Algorithm with reasoned priors, not customer means. Real scoring would pool Importance and Satisfaction ratings from >=5 interviews.]`

Formula: **Score = Importance + Max(0, Importance - Satisfaction)**. Max 20. Pursue if > 8.

| # | Opportunity | Importance (1-10) | Satisfaction with alternatives (1-10) | Score | Action |
|---|-------------|-------------------|---------------------------------------|-------|--------|
| O1 | Reduce time-to-first-move | 9 | 4 | 14 | Pursue |
| O2 | Solo play fun despite solved-game | 8 | 3 | 13 | Pursue |
| O3 | Frictionless two-human play | 7 | 3 | 11 | Pursue (secondary) |
| O4 | Trustworthy (no ads, no dark patterns) | 8 | 4 | 12 | Pursue |
| O5 | Support "teach a child" JTBD | 6 | 3 | 9 | Evaluate |
| O6 | Accessibility baseline | 6 | 4 | 8 | Evaluate (non-negotiable for WCAG compliance regardless of score) |
| O7 | Hobbyist deeper-game | 5 | 4 | 6 | Deprioritize for v1 |

### Rationale on satisfaction priors

- **O1 sat=4:** Google's inline TTT is near-perfect on time-to-first-move; most other web TTT options are worse (modal spam, loaders, signups).
- **O2 sat=3:** Most free web TTT has a single AI level or a trivially beatable/unbeatable one. Engagement drops fast.
- **O3 sat=3:** Async URL-based multiplayer is rare outside chess/checkers apps; real-time requires an account on most platforms.
- **O4 sat=4:** Google and a handful of indie sites nail this. App-store apps broadly fail it.

---

## 4. Top 3 Opportunities Selected for Solution Testing

1. **O1 — Reduce time-to-first-move** (score 14)
2. **O2 — Make solo play fun despite the solved-game problem** (score 13)
3. **O4 — Be trustworthy (no ads, no dark patterns)** (score 12)

O3 (two-human play) is a strong secondary but depends heavily on the solo-vs-multiplayer scope fork. See `wave-decisions.md` decision D1.

O6 (accessibility) is not top-3 by score but is treated as a **non-negotiable baseline** because WCAG 2.2 AA is a floor, not a feature.

---

## 5. Job Step Coverage Check

> `[ILLUSTRATIVE]`

Mapping opportunities to the universal job-map steps for the "play a quick TTT game" job:

| Job step | Covered by | Status |
|----------|-----------|--------|
| Define (decide to play) | O1 | Covered |
| Locate (find a place to play) | O1, O4 | Covered |
| Prepare (set up the game) | O1 | Covered |
| Confirm (ready to play) | O1 | Covered |
| Execute (play the moves) | O2, O3, O6 | Covered |
| Monitor (track turn/state) | O6 | Covered |
| Modify (undo, reset) | — | **Gap** — not explicitly covered; flagged as potential O8 |
| Conclude (end, play again) | O2, O5 | Covered |

**Job step coverage: 7 of 8 = 87.5%** — meets 80% target.

Potential **O8: Graceful undo/reset flow** (score estimate 7) deferred to backlog.

---

## 6. G2 Gate Evaluation

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Opportunities identified | 5+ | 7 | Pass |
| Top scores > 8 | 2-3 opportunities | 4 opportunities > 8 | Pass |
| Job step coverage | >=80% | 87.5% | Pass |
| Team alignment | Stakeholder confirmed | N/A (solo practice) | Conditional |
| Interview-sourced scores | >=5 interviews | 0 | **Fail (waived under practice-exercise exemption)** |

**Gate decision: CONDITIONAL PASS.** The structural work (tree, coverage, scoring mechanics) is sound; only the evidence underlying the scores is illustrative.
