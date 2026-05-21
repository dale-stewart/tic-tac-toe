# Acceptance Test Suite — tic-tac-toe

**Wave:** DISTILL
**Feature:** tic-tac-toe
**Author:** Quinn (`nw-acceptance-designer`)
**Date:** 2026-04-21
**Evidence tier:** C (illustrative practice exercise)

This is the master index for the acceptance test suite. Seven feature files under
this directory contain 62 scenarios (including scenario-outline rows) across seven
feature files. Every scenario maps to ≥1 AC bullet from
`docs/feature/tic-tac-toe/discuss/user-stories.md` (see `traceability-matrix.md`).

## Test boundary — what this suite owns

The driving port is **the browser page at the canonical URL**. Every scenario
enters through observable user-facing behavior: rendered DOM (via Playwright),
keyboard events, pointer events, ARIA live-region content, HTTP requests on the
wire, and CI-generated artifacts (Lighthouse, axe-core, bundle-size report).

**Internal components exercised indirectly only.** No scenario imports or invokes
`board`, `win-detector`, `ai/*`, `game` (reducer), `render`, `input/keyboard`,
`input/pointer`, `announce`, or `bootstrap` directly. Those are the crafter
wave's property-test + unit-test surface.

## Scenario budget

| Priority         | Count  | Rationale                                                                                                                                                      |
| ---------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| walking-skeleton | 11     | Slices 01+02 — the thinnest end-to-end user journey, plus the cross-cutting privacy guardrail (zero third-party requests) that must hold from the first deploy |
| r1               | 35     | Core v1 — a11y baseline, difficulty levels, hot-seat mode                                                                                                      |
| r2               | 16     | Craft polish — animation, palette, footer, perf/bundle CI gates                                                                                                |
| **Total**        | **62** |                                                                                                                                                                |

Error-path and boundary scenarios: 25 / 62 ≈ 40% (meets mandate).

## Tool breakdown

| Tool                                         | Count | Where                                             |
| -------------------------------------------- | ----- | ------------------------------------------------- |
| Playwright (DOM interaction)                 | 47    | Bulk of scenarios                                 |
| axe-core (a11y audit against rendered state) | 5     | 4 canonical states + no-regression                |
| Vitest + fast-check (property test)          | 2     | Perfect-AI-never-loses; shared-signature legality |
| Network assertion (request interception)     | 2     | Third-party requests + cookies/beacons            |
| Lighthouse CI                                | 4     | Bundle, perf, a11y score, crosscutting            |
| Static / bundle delta                        | 2     | No-runtime-JS-added in footer, CSP compliance     |

Total exceeds 62 because some scenarios use multiple tools (e.g., Playwright
navigation + network interception together). Cell marked by the _primary_ tool
in the traceability matrix.

## Seams exercised

| Seam                                 | Why it matters                                                      | Scenarios |
| ------------------------------------ | ------------------------------------------------------------------- | --------- |
| render (lit-html port)               | Every state→DOM transition is deterministic — visible to the user   | 27        |
| bootstrap (maybeRunAi orchestration) | Mode-dependent control flow — solo schedules AI, hot-seat never     | 11        |
| announce (ARIA live region)          | 1s debounce, every state change, WCAG 2.2 AA                        | 5         |
| AI interface (uniform signature)     | Three interchangeable pure functions; perfect-never-loses invariant | 6         |
| win-detector (shared module)         | Same detector across solo and hot-seat; must not diverge            | 8         |
| cross-cutting (CSP, network, bundle) | Guardrails that never degrade                                       | 5         |

## Walking skeleton strategy

Two walking-skeleton _journeys_ (solo + hot-seat) collapse into the thinnest
end-to-end solo flow shipped by slices 01+02 — nine scenarios exercising the
full driving-port surface.

- **Why solo-first?** Hot-seat (slice 05) reuses the same board, win detector,
  and render path. If solo works end-to-end, hot-seat is a vocabulary and
  gating change, not a new walking skeleton.
- **Observable stakeholder value?** A first-time visitor places a mark, sees the
  AI respond, reaches a terminal state, sees a banner, and restarts — demonstrable
  to anyone.
- **Real adapter boundaries crossed?** All of them:
  - Real browser DOM (Playwright, not a test double)
  - Real pointer events
  - Real ARIA live region updated by the announce adapter
  - Real bootstrap orchestration (solo branch of `maybeRunAi`)
  - Real lit-html render path

No `@in-memory` fixtures exist for the walking skeleton. A deleted real adapter
would make every walking-skeleton scenario fail — the litmus test passes.

### Walking Skeleton Boundary Strategy declaration (Dim 9a)

**Strategy C** — all walking-skeleton scenarios run against the real adapters
(real browser, real lit-html render, real ARIA live region, real input adapters)
through Playwright. No `@in-memory` marker appears on any walking-skeleton
scenario. No costly external dependencies are introduced; no `@requires_external`
marker is needed.

## File layout

```
docs/feature/tic-tac-toe/distill/
├── acceptance-tests.md              ← you are here
├── traceability-matrix.md
├── wave-decisions.md
├── feature-walking-skeleton.feature ← 9 scenarios, slices 01+02
├── feature-keyboard-aria.feature    ← 15 scenarios (outline counted as 1+4 rows), slice 03
├── feature-difficulty-levels.feature ← 10 scenarios, slice 04
├── feature-hot-seat.feature          ← 11 scenarios (outline counted as 1+4 rows), slice 05
├── feature-polish.feature            ← 6 scenarios, slice 06
├── feature-footer.feature            ← 4 scenarios, slice 07
└── feature-crosscutting.feature      ← 8 scenarios, crosscutting
```

## Executable-tests path (crafter wave will create)

Per architecture §Testing strategy:

```
tests/
├── e2e/                              ← Playwright
│   ├── walking-skeleton.spec.ts
│   ├── keyboard-aria.spec.ts
│   ├── difficulty.spec.ts
│   ├── hot-seat.spec.ts
│   ├── polish.spec.ts
│   ├── footer.spec.ts
│   └── crosscutting.spec.ts
├── a11y/                             ← axe-core scenarios run via Playwright
│   └── four-canonical-states.spec.ts
└── property/                         ← Vitest + fast-check
    ├── perfect-ai-never-loses.spec.ts
    └── ai-shared-signature.spec.ts
```

Crafter wave owns the `tests/unit/**` layer (board, win-detector, reducer,
each AI module). That is the inner TDD loop — not DISTILL's scope.

## Tag reference

| Tag category | Tags                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Priority     | `@priority:walking-skeleton`, `@priority:r1`, `@priority:r2`                                               |
| Slice        | `@slice:01`..`@slice:07`, `@slice:crosscutting`                                                            |
| Seam         | `@seam:render`, `@seam:ai`, `@seam:announce`, `@seam:bootstrap`, `@seam:win-detector`                      |
| Tool         | `@tool:playwright`, `@tool:axe`, `@tool:vitest-property`, `@tool:network`, `@tool:lighthouse`              |
| AC trace     | `@ac:US-0N-keyword` or `@ac:KPI-N-keyword`                                                                 |
| Other        | `@a11y` (existing tag on keyboard scenarios), `@property` (universal-invariant scenarios for crafter wave) |

## KPI coverage summary

| KPI                                                  | Where asserted                                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| KPI-1 (TTFM ≤ 3s; bundle ≤ 50KB)                     | `feature-crosscutting.feature` via Lighthouse CI + bundle-size gate                                      |
| KPI-2 (game-completion rate ≥ 70%)                   | **Not E2E-asserted.** Requires aggregate counter → DEVOPS wave. See wave-decisions §graceful-degradation |
| KPI-3 (Lighthouse a11y ≥ 95; axe-core 0)             | `feature-keyboard-aria.feature` 4 canonical states + `feature-crosscutting.feature` Lighthouse           |
| KPI-4 (Lighthouse perf ≥ 90; CLS ≤ 0.1; FMP ≤ 500ms) | `feature-crosscutting.feature`                                                                           |
| KPI-5 (0 third-party requests; 0 PII)                | `feature-crosscutting.feature` network assertion                                                         |

## Handoff criteria to DELIVER

- [x] 62 scenarios covering all 56 AC bullets across 7 slices + 7 stories
- [x] Error-path coverage ≥ 40% (25/62 = 40.3%)
- [x] All scenarios in business language — no technical term leaks (grep evidence
      in `wave-decisions.md` §mandate-compliance)
- [x] All walking-skeleton scenarios exercise real adapters (Strategy C declared)
- [x] Every driving port has at least one scenario entering through it
- [ ] Peer review by `nw-acceptance-designer-reviewer` — pending orchestrator dispatch

Once peer review approves, the crafter wave picks up this file set plus
`traceability-matrix.md` to sequence scenario implementation one at a time
(outside-in TDD: enable one scenario → inner TDD loop to green → commit → next).
