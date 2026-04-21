# Solution Testing — tic-tac-toe

**Phase:** 3 of 4 (Solution Testing)
**Status:** Conditional pass (practice exercise, Tier C)
**Date:** 2026-04-21

---

## Practice Exercise Disclaimer

> `[ILLUSTRATIVE — practice exercise; real DISCOVER would run >=5 prototype tests per iteration with task-completion timing, think-aloud protocol, and post-test SUS/SEQ scoring]`

No prototypes were built. No users were tested. Hypotheses are drafted in the standard format; success/failure criteria are declared honestly so a future real test could execute against them.

---

## 1. Solution Concept (v1 scope)

> `[ILLUSTRATIVE — scoped from top-3 opportunities in opportunity-tree.md]`

A single-page web app at a single URL. On load:

- **Board is rendered immediately** (no modal, no signup, no cookie banner beyond what law requires).
- **Default mode: solo vs AI at "medium" difficulty.** Game starts with the human as X, AI plays O.
- **Mode switch is one click:** a compact control at the top lets the user toggle between `Solo (easy / medium / perfect)` and `Hot-seat` (two humans on same device).
- **Win / draw detection** animates the winning line, shows a "Play again" button, and auto-focuses it.
- **No ads. No account. No tracking beyond aggregate counters.**
- **Accessibility:** keyboard nav (arrow keys + space/enter), ARIA live region announces turn and result, color-blind-safe palette, visible focus ring.
- **Out of scope for v1:** networked multiplayer, Ultimate TTT, NxN, accounts, leaderboards, social sharing beyond copy-link.

---

## 2. Hypotheses

Each hypothesis uses the standard template:

> **We believe [doing X] for [user type] will achieve [outcome]. We will know this is TRUE when we see [signal]. We will know this is FALSE when we see [counter-signal].**

### H1 — Value: time-to-first-move wins loyalty

We believe **rendering the board and enabling the first click within 500ms of URL load** for **casual web users** will achieve **>=70% game-completion rate in first session**.

- TRUE when: >= 70% of first-time visitors make >= 5 moves in the first session; median time-to-first-move < 1s.
- FALSE when: first-move rate < 40%, OR median time-to-first-move > 3s.

### H2 — Value: multi-difficulty AI drives replay

We believe **offering three AI levels (easy / medium / perfect)** for **solo players** will achieve **>=30% day-1 return rate for users who tried "medium"**.

- TRUE when: >= 30% of medium-AI players return within 24h; >= 20% try the "perfect" tier after beating medium.
- FALSE when: day-1 return < 10%, OR >= 80% of users stay on "easy" forever (suggests difficulty curve isn't meaningful).

### H3 — Usability: no-instructions UI is comprehensible in < 10s

We believe **a pre-rendered 3x3 grid with turn indicator and no onboarding text** for **any user** will achieve **<10s to first correct move** in unmoderated testing.

- TRUE when: >=80% of test participants make a valid move within 10s without asking "what do I do?"
- FALSE when: <60% succeed, OR >20% express confusion about whose turn it is.

### H4 — Usability: hot-seat mode is discoverable

We believe **a single labeled toggle at the top of the board** for **two-player users** will achieve **>=80% success** in finding and enabling hot-seat mode when asked "play a game with a friend next to you."

- TRUE when: >=80% find the toggle within 30s.
- FALSE when: <50% succeed, OR participants open the browser tab twice to "share."

### H5 — Usability: accessibility baseline holds

We believe **keyboard-only navigation and screen-reader announcements** for **assistive-tech users** will achieve **task completion parity (>=80%) with mouse users**.

- TRUE when: keyboard-only and screen-reader participants complete a full game at >=80% rate; announcement latency < 1s.
- FALSE when: any critical flow (make a move, reset, switch mode) is unreachable without a mouse.

### H6 — Value: no-ads stance is noticed and valued

We believe **an explicit "no ads, no tracking, no signup" tagline** for **users who arrive from ad-heavy alternatives** will achieve **>=40% bookmark or return rate** vs baseline.

- TRUE when: users who see the tagline return at >=40%; qualitative comments mention the absence of ads as positive.
- FALSE when: return rate is flat vs a non-tagline control (suggests users don't notice or don't care).

### H7 — Feasibility: classic 3x3 is a weekend build

We believe **implementing 3x3 TTT with a minimax AI and keyboard-accessible UI** for **the dev team** will achieve **a working v1 in <= 16 hours of engineering time**.

- TRUE when: functional deployable build completed within 16h including tests and a11y pass.
- FALSE when: any component (minimax, a11y, deployment) blows past its budget by >2x.

---

## 3. Assumption-to-Hypothesis Map

| Assumption (from Phase 1) | Test Hypothesis | Method | Category |
|----------------------------|-----------------|--------|----------|
| A1 No-signup want | H1, H6 | Fake-door + analytics | Value |
| A2 "Kill 60s" JTBD | H1 | Session-length telemetry | Value |
| A3 Classic 3x3 preferred | — (assumed for v1) | Variant A/B in v2 | Value |
| A4 AI is table stakes | H2 | Prototype w/ AI levels | Value |
| A5 Hot-seat covers two-human | H4 | Prototype test | Value |
| A6 Networked MP is nice-to-have | — (deferred) | Fake-door "play with friend" | Value |
| A7 No ads tolerance | H6 | Messaging test | Viability |
| A9 a11y expected baseline | H5 | Assistive-tech user test | Usability |
| A10 Solved-game frustration | H2 | Retention cohort | Value |

---

## 4. Test Plan (what a real Phase 3 would do)

> `[ILLUSTRATIVE]`

| Test | Method | N | Duration | Cost |
|------|--------|---|----------|------|
| H1 | Deployed prototype + analytics | 100+ real users | 1 week | Low |
| H2 | Cohort analytics on difficulty selection | 100+ | 1 week | Low |
| H3 | Unmoderated usertesting.com session | 5 | 1 day | Moderate |
| H4 | Unmoderated usertesting.com session | 5 | 1 day | Moderate |
| H5 | Moderated a11y session (keyboard + NVDA + VoiceOver) | 3 | 1 day | Moderate |
| H6 | A/B messaging test | 100+ | 1 week | Low |
| H7 | Engineering spike | 1 dev | 2 days | Low |

Total: ~2 weeks, ~$1500 if outsourcing user tests.

---

## 5. Predicted Results (not actual — illustrative)

> `[ILLUSTRATIVE — Scout's best-guess priors, not data]`

| Hypothesis | Predicted outcome | Confidence |
|-----------|-------------------|------------|
| H1 | Pass — TTT is trivially comprehensible, time-to-first-move should be near-instant | High |
| H2 | Partial pass — day-1 retention for a solved game is hard regardless | Medium |
| H3 | Pass — grid + X/O is culturally universal | High |
| H4 | Likely pass if toggle is a clear segmented control | Medium-high |
| H5 | Pass if built with a11y from start, fail if retrofitted | Medium |
| H6 | Inconclusive — the tagline may be noticed but not a deciding factor | Low |
| H7 | Pass — this is genuinely a small build | High |

---

## 6. G3 Gate Evaluation

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Prototype tested with users | >=5 per iteration | 0 | **Fail (waived under practice exemption)** |
| Task completion | >=80% | N/A | Conditional |
| Value perception | >=70% "would use" | N/A | Conditional |
| Comprehension | <10s | Predicted pass | Conditional |
| Key assumptions validated | >=80% proven | 0/10 validated | **Fail (waived)** |

**Gate decision: CONDITIONAL PASS under practice-exercise exemption.** Hypotheses are well-formed and would be testable in ~2 weeks; only the execution is skipped.
