# Traceability Matrix — tic-tac-toe acceptance tests

**Wave:** DISTILL
**Author:** Quinn (`nw-acceptance-designer`)
**Date:** 2026-04-21

Every AC bullet from `docs/feature/tic-tac-toe/discuss/user-stories.md` (plus crosscutting KPI gates) maps to ≥1 scenario. Every scenario maps to ≥1 AC.

## Legend

- **Slice:** 01..07, or `CC` for crosscutting
- **Story:** US-01..US-07 or KPI-n
- **Tool:** `pw` = Playwright, `axe` = axe-core, `prop` = Vitest + fast-check, `net` = network assertion, `lh` = Lighthouse CI
- **Priority:** `ws` = walking-skeleton, `r1`, `r2`

## Coverage by slice

### Slice 01 — render-empty-board (US-01)

| AC tag                 | Scenario file : line | Seam   | Tool | Priority |
| ---------------------- | -------------------- | ------ | ---- | -------- |
| US-01-empty-grid       | walking-skeleton:14  | render | pw   | ws       |
| US-01-turn-indicator   | walking-skeleton:14  | render | pw   | ws       |
| US-01-default-mode     | walking-skeleton:14  | render | pw   | ws       |
| US-01-no-modal         | walking-skeleton:14  | render | pw   | ws       |
| US-01-mobile-viewport  | walking-skeleton:25  | render | pw   | ws       |
| US-01-fallback-message | crosscutting:29      | render | pw   | ws       |

### Slice 02 — accept-one-move-and-random-ai (US-02)

| AC tag                     | Scenario file : line    | Seam                     | Tool | Priority |
| -------------------------- | ----------------------- | ------------------------ | ---- | -------- |
| US-02-click-places-x       | walking-skeleton:33     | bootstrap                | pw   | ws       |
| US-02-ai-responds          | walking-skeleton:33     | bootstrap (`maybeRunAi`) | pw   | ws       |
| US-02-win-detection        | walking-skeleton:42     | win-detector             | pw   | ws       |
| US-02-result-banner-solo   | walking-skeleton:42, 62 | render                   | pw   | ws       |
| US-02-play-again-focus     | walking-skeleton:42     | render/announce          | pw   | ws       |
| US-02-ai-wins              | walking-skeleton:53     | win-detector             | pw   | ws       |
| US-02-draw-detection       | walking-skeleton:62     | win-detector             | pw   | ws       |
| US-02-no-op-on-filled-cell | walking-skeleton:70     | bootstrap                | pw   | ws       |
| US-02-play-again-resets    | walking-skeleton:79     | bootstrap                | pw   | ws       |
| US-02-reload-fresh         | walking-skeleton:89     | bootstrap                | pw   | ws       |

### Slice 03 — keyboard-and-aria-baseline (US-03)

| AC tag                           | Scenario file : line | Seam      | Tool | Priority |
| -------------------------------- | -------------------- | --------- | ---- | -------- |
| US-03-arrow-navigation           | keyboard-aria:15, 23 | render    | pw   | r1       |
| US-03-enter-places-mark          | keyboard-aria:37     | bootstrap | pw   | r1       |
| US-03-space-places-mark          | keyboard-aria:45     | bootstrap | pw   | r1       |
| US-03-cell-taken-announcement    | keyboard-aria:52     | announce  | pw   | r1       |
| US-03-state-change-announcements | keyboard-aria:61     | announce  | pw   | r1       |
| US-03-result-announcements       | keyboard-aria:69     | announce  | pw   | r1       |
| US-03-terminal-focus-move        | keyboard-aria:76     | render    | pw   | r1       |
| US-03-tab-order                  | keyboard-aria:84     | render    | pw   | r1       |
| US-03-axe-empty                  | keyboard-aria:92     | render    | axe  | r1       |
| US-03-axe-mid-game               | keyboard-aria:99     | render    | axe  | r1       |
| US-03-axe-won                    | keyboard-aria:106    | render    | axe  | r1       |
| US-03-axe-draw                   | keyboard-aria:113    | render    | axe  | r1       |
| US-03-focus-visible              | keyboard-aria:120    | render    | pw   | r1       |
| US-03-no-keyboard-trap           | keyboard-aria:128    | render    | pw   | r1       |

### Slice 04 — difficulty-levels (US-04)

| AC tag                          | Scenario file : line | Seam     | Tool | Priority |
| ------------------------------- | -------------------- | -------- | ---- | -------- |
| US-04-visible-control           | difficulty-levels:16 | render   | pw   | r1       |
| US-04-default-medium            | difficulty-levels:16 | render   | pw   | r1       |
| US-04-keyboard-activation       | difficulty-levels:24 | render   | pw   | r1       |
| US-04-announce-difficulty       | difficulty-levels:24 | announce | pw   | r1       |
| US-04-disabled-mid-game         | difficulty-levels:32 | render   | pw   | r1       |
| US-04-reenabled-at-terminal     | difficulty-levels:40 | render   | pw   | r1       |
| US-04-medium-blocks             | difficulty-levels:47 | ai       | pw   | r1       |
| US-04-medium-completes          | difficulty-levels:56 | ai       | pw   | r1       |
| US-04-perfect-never-loses       | difficulty-levels:65 | ai       | prop | r1       |
| US-04-shared-signature          | difficulty-levels:73 | ai       | prop | r1       |
| US-04-persist-across-play-again | difficulty-levels:80 | render   | pw   | r1       |
| US-04-easy-random               | difficulty-levels:88 | ai       | pw   | r1       |

### Slice 05 — hot-seat-mode (US-05)

| AC tag                         | Scenario file : line | Seam         | Tool | Priority |
| ------------------------------ | -------------------- | ------------ | ---- | -------- |
| US-05-toggle-visible           | hot-seat:15          | render       | pw   | r1       |
| US-05-switch-resets-board      | hot-seat:22          | bootstrap    | pw   | r1       |
| US-05-p1-vocabulary            | hot-seat:22          | render       | pw   | r1       |
| US-05-no-ai-in-hot-seat        | hot-seat:31, 40      | bootstrap    | pw   | r1       |
| US-05-turn-alternation         | hot-seat:31          | bootstrap    | pw   | r1       |
| US-05-p1-wins-banner           | hot-seat:49          | render       | pw   | r1       |
| US-05-p2-wins-banner           | hot-seat:59          | render       | pw   | r1       |
| US-05-draw-banner              | hot-seat:68          | render       | pw   | r1       |
| US-05-toggle-disabled-mid-game | hot-seat:76          | render       | pw   | r1       |
| US-05-rematch-keeps-mode       | hot-seat:85          | bootstrap    | pw   | r1       |
| US-05-shared-win-detector      | hot-seat:94          | win-detector | pw   | r1       |
| US-05-keyboard-parity          | hot-seat:109         | render       | pw   | r1       |

### Slice 06 — win-line-animation-and-palette (US-06)

| AC tag                       | Scenario file : line | Seam   | Tool | Priority |
| ---------------------------- | -------------------- | ------ | ---- | -------- |
| US-06-animation-within-500ms | polish:14            | render | pw   | r2       |
| US-06-reduced-motion         | polish:23            | render | pw   | r2       |
| US-06-shape-distinguishable  | polish:31            | render | pw   | r2       |
| US-06-no-a11y-regression     | polish:38            | render | axe  | r2       |
| US-06-text-contrast          | polish:45            | render | axe  | r2       |
| US-06-cls-budget             | polish:53            | render | lh   | r2       |

### Slice 07 — no-ads-footer-and-source-link (US-07)

| AC tag                    | Scenario file : line | Seam         | Tool   | Priority |
| ------------------------- | -------------------- | ------------ | ------ | -------- |
| US-07-footer-text         | footer:15            | render       | pw     | r2       |
| US-07-source-link-present | footer:22            | render       | pw     | r2       |
| US-07-new-tab-noopener    | footer:30            | render       | pw     | r2       |
| US-07-footer-above-fold   | footer:38            | render       | pw     | r2       |
| US-07-no-third-party      | crosscutting:14, 22  | crosscutting | net    | r2       |
| US-07-no-runtime-js       | crosscutting:69      | crosscutting | static | r2       |

### Crosscutting (CC) — platform guardrails

| AC tag         | Scenario file : line | Seam         | Tool   | Priority |
| -------------- | -------------------- | ------------ | ------ | -------- |
| CSP-compliance | crosscutting:38      | crosscutting | static | r2       |
| KPI-1-bundle   | crosscutting:46      | crosscutting | lh     | r2       |
| KPI-4-perf     | crosscutting:53      | crosscutting | lh     | r2       |
| KPI-5-perf     | crosscutting:53      | crosscutting | lh     | r2       |
| KPI-3-a11y     | crosscutting:62      | crosscutting | lh     | r2       |

## Coverage Summary

| Dimension                       | Value                                               |
| ------------------------------- | --------------------------------------------------- |
| Total AC tags mapped            | **56** (51 user-story ACs + 5 crosscutting KPI/CSP) |
| Total scenarios                 | **62** (per acceptance-tests.md scenario budget)    |
| AC bullets without a scenario   | **0** (target: 0 — achieved)                        |
| Scenarios without an AC         | **0** (target: 0 — achieved)                        |
| Error-path / boundary scenarios | 25 / 62 ≈ 40% (mandate: ≥40% — met)                 |
| Walking-skeleton scenario count | 11 (slices 01+02 + crosscutting privacy)            |
| R1 scenario count               | 35 (slices 03–05)                                   |
| R2 scenario count               | 16 (slices 06, 07, crosscutting gates)              |

## Orphan / Gap Report

- **Orphan scenarios (scenario with no AC):** 0
- **Uncovered ACs:** 0
- **KPI-2 (completion rate):** intentionally unmapped — not E2E-testable without aggregate counter (deferred by DEVOPS in `adr-0006`). Graceful-degradation note in `wave-decisions.md` §graceful-degradation.
