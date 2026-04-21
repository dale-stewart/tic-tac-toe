# DISTILL Decisions — tic-tac-toe

**Wave:** DISTILL
**Author:** Quinn (`nw-acceptance-designer`)
**Date:** 2026-04-21
**Evidence tier:** C (practice exercise)

## 1. Key Decisions

- **[D1] Driving port = the browser page at the canonical URL.** Every acceptance scenario enters through user-observable behavior: DOM via Playwright, keyboard/pointer events, ARIA live-region content, HTTP wire requests, CI artifacts (Lighthouse, axe-core, bundle-size). No scenario imports or invokes `board`, `win-detector`, `ai/*`, `game`, `render`, `input/*`, `announce`, or `bootstrap` directly — those are the crafter wave's property-test/unit-test surface.
- **[D2] Port-to-port principle enforced.** Every scenario references only user-observable behavior (DOM shape, ARIA, network, perf budgets). No scenario references implementation internals (lit-html template function names, private methods, class names outside the public DOM contract). Scenarios survive adapter re-implementation without editing.
- **[D3] Walking Skeleton boundary = Strategy C (all real adapters, no in-memory substitute).** Slices 01+02 walking-skeleton scenarios run against real browser + real lit-html render + real ARIA live region + real input adapters via Playwright. No `@in-memory` marker anywhere in the walking-skeleton feature file. The "delete the adapter and watch every scenario fail" litmus test passes.
- **[D4] Property tests at the AI seam.** `US-04-perfect-never-loses` and `US-04-shared-signature` run as Vitest + fast-check property tests rather than Playwright E2E. Rationale: running 100–1000 games via the real UI would be prohibitively slow; the AI interface is pure and testable at the seam without the render port. These scenarios tagged `@tool:vitest-property`.
- **[D5] KPI-2 (completion rate) is NOT E2E-asserted.** DEVOPS deferred the aggregate counter to v2 (`adr-0006`); without the counter there is nothing to assert. Scenario NOT written. Graceful degradation noted in §4.
- **[D6] KPI-3/4/5 asserted via CI tools + one E2E scenario each.** Lighthouse CI output is treated as the source of truth for perf/a11y/bundle scores; one scenario per KPI verifies the CI artifact is produced with passing numbers. The same KPIs are additionally asserted at the platform gate level — belt and braces.
- **[D7] Personas from DISCUSS used throughout.** Sam, Priya, Jae, Marcus, Alex, Dana appear in scenarios with the same device/viewport context as the originating user stories. No generic `user123`, `test@test.com`, or anonymous "the user" phrasing.
- **[D8] Result-banner wording asserted EXACTLY.** Solo: `"You win!"` / `"AI wins."` / `"Draw."`. Hot-seat: `"P1 wins!"` / `"P2 wins!"` / `"Draw."`. Any text deviation fails the scenario.
- **[D9] Mode/difficulty disable scope starts Slice 04.** Walking skeleton (Slices 01+02) has no toggle — no scenario in `feature-walking-skeleton.feature` asserts toggle behavior. First disable scenario appears in `feature-difficulty-levels.feature` per the DISCUSS peer-review scope note (US-04 AC clarification).
- **[D10] Tag taxonomy** (see acceptance-tests.md §Tag reference): priority (`ws`/`r1`/`r2`), slice (`@slice:01`..`07` + `crosscutting`), seam (`render`/`ai`/`announce`/`bootstrap`/`win-detector`/`crosscutting`), tool (`playwright`/`axe`/`vitest-property`/`network`/`lighthouse`/`static`), AC-trace (`@ac:US-0N-keyword` or `@ac:KPI-N-keyword`). Crafter wave filters by tag to sequence implementation.

## 2. Reconciliation with DESIGN reviewer's DISTILL notes

| DESIGN note | Honored? | Evidence |
|---|---|---|
| Core-adapter ports as test boundaries | ✓ | D1, D2 — scenarios enter at driving port; inner test surface is crafter's |
| AI interface seam property tests | ✓ | D4 — `feature-difficulty-levels.feature:65, 73` tagged `@tool:vitest-property` |
| Bootstrap `maybeRunAi` branching coverage | ✓ | Walking-skeleton scenarios + hot-seat "no AI fires" scenarios both exercise the branch explicitly |
| Recommended CI gate sequence | ✓ (for reference) | CI gate execution is DEVOPS's concern; DISTILL aligns scenario tools with their tooling slots |
| ACs already observable-behavior phrased | ✓ | 0 AC required rewording; direct 1:1 translation to Given-When-Then |

## 3. Reuse Analysis

| Existing artifact | File | Overlap | Decision | Justification |
|---|---|---|---|---|
| Journey-level Gherkin | `discuss/journey-solo-player.feature`, `discuss/journey-hot-seat.feature` | Same domain, same user-observable behaviors | EXTEND & FORMALIZE | Journey files were narrative Gherkin exploring the happy-path + errors; this wave formalizes into executable, tagged, traceable acceptance-test suite. Journey files preserved as-is (DISCUSS artifact). |
| Slice briefs | `feature/tic-tac-toe/slices/slice-NN-*.md` | AC listed per slice | USE AS SOURCE | Each scenario traces back to a slice + AC bullet via `@slice:` and `@ac:` tags. |

## 4. Graceful Degradation

### KPI-2 (game-completion rate) — NO E2E SCENARIO

**Root cause:** DEVOPS deferred the aggregate-counter endpoint to v2 (`docs/product/architecture/adr-0006-kpi-2-aggregate-counter-disposition.md`). Without an endpoint emitting the `games-started` and `games-completed` counts, there is nothing to assert in an E2E scenario.

**Impact:** KPI-2 cannot be verified by the automated test suite in v1. The other four KPIs (KPI-1/3/4/5) have full E2E + CI coverage.

**Mitigation:** the DEVOPS ADR documents a resurrection trigger (sustained >500 sessions/month for 2 consecutive months). If adopted in v2, this DISTILL wave grows one scenario in `feature-crosscutting.feature`: *"the aggregate counter increments by exactly 1 per started game and again by 1 per terminal state"*.

**Transparency:** noted explicitly in `acceptance-tests.md` §KPI coverage summary and in the traceability matrix's orphan/gap report. Not silently omitted.

## 5. Upstream Changes

**None.** 0 ambiguous ACs encountered during scenario authoring. Every AC in `discuss/user-stories.md` translated 1:1 into ≥1 scenario without requiring DISCUSS to clarify. No back-propagation to DISCUSS required.

Cross-checked against:
- `docs/feature/tic-tac-toe/discuss/user-stories.md` — 51 AC bullets, 100% mapped
- `docs/feature/tic-tac-toe/discuss/shared-artifacts-registry.md` — 6 shared variables (gameMode, boardState, turnIndicator, gameResult, winningLine, initialFocusCell) all asserted at least once in scenarios
- `docs/feature/tic-tac-toe/design/wave-decisions.md` §10 peer-review DISTILL notes — 3/3 items honoured (§2 table above)
- `docs/feature/tic-tac-toe/discuss/outcome-kpis.md` — 4/5 KPIs asserted; KPI-2 gracefully degraded (§4)

## 6. Mandate Compliance

| Requirement | Status |
|---|---|
| 100% AC coverage | ✓ 56/56 AC tags mapped in `traceability-matrix.md` |
| Error-path coverage ≥40% | ✓ 25/62 = 40.3% |
| Business-language only (no technical term leaks) | ✓ `grep -E "lit-html|private|Function\.prototype|\$\$|impl"` on feature files returns zero hits |
| Walking-skeleton scenarios use real adapters | ✓ Strategy C declared (D3) |
| Every driving port has ≥1 scenario | ✓ browser URL port fully covered |
| Personas from DISCUSS used throughout | ✓ Sam/Priya/Jae/Marcus/Alex/Dana appear per story |

## 7. Peer Review Status

**Pending orchestrator dispatch of `@nw-acceptance-designer-reviewer`.** Artifacts on disk:

- `acceptance-tests.md` (master index)
- `feature-walking-skeleton.feature` (9 scenarios, slices 01+02)
- `feature-keyboard-aria.feature` (15 scenarios, slice 03)
- `feature-difficulty-levels.feature` (10 scenarios, slice 04)
- `feature-hot-seat.feature` (11 scenarios, slice 05)
- `feature-polish.feature` (6 scenarios, slice 06)
- `feature-footer.feature` (4 scenarios, slice 07)
- `feature-crosscutting.feature` (8 scenarios, platform guardrails)
- `traceability-matrix.md`
- `wave-decisions.md` (this file)

Expected review dimensions: port-to-port discipline, business-language enforcement, AC coverage completeness, walking-skeleton boundary strategy correctness, test pyramid shape (property + E2E + a11y + network + CI-gate), graceful-degradation honesty (KPI-2).

## 8. Handoff to DELIVER

**Cleared for DELIVER wave handoff** pending peer-review approval. Crafter wave (outside-in TDD) will:

1. Enable one scenario at a time, starting with `feature-walking-skeleton.feature:14` (`US-01-empty-grid`).
2. For each scenario: drive the inner TDD loop in `tests/unit/**` and `tests/property/**` until the scenario is green.
3. Commit per scenario (or small groups when trivially small).
4. Move to the next scenario by priority order: walking-skeleton → r1 → r2.
5. When all scenarios within a slice are green, tag the commit with the slice completion.
6. When all scenarios are green, run mutation testing (if D10 from DEVOPS is adopted).
7. Execute finalize sub-wave: archive completed feature, update SSOT, clean up feature workspace.

---

## 9. Peer Review Outcome

**Review Date:** 2026-04-21
**Reviewer:** `nw-acceptance-designer-reviewer`
**Verdict:** **APPROVED** — no required revisions.

### Strengths

- **Port-to-port principle enforced.** Every scenario enters through the browser page (driving port); no scenario imports or invokes internal components (board, win-detector, ai/*, game reducer, render, input/*, announce, bootstrap). All assertions target user-observable behaviour.
- **Business-language purity.** Grep across all 7 feature files returned zero technical term leaks (no framework names, no `function`/`class`/`private`/`impl` in step text). Persona names (Sam, Priya, Jae, Marcus, Alex, Dana) applied consistently with device/viewport context from DISCUSS.
- **AC coverage completeness.** Traceability matrix maps 56/56 AC tags (51 user-story + 5 crosscutting) across 62 scenarios. Zero orphan scenarios, zero uncovered ACs.
- **Walking-skeleton boundary strategy solid.** Strategy C (all real adapters, no in-memory substitutes) declared and observed — no `@in-memory` marker on any walking-skeleton scenario; real browser + real lit-html render + real ARIA + real bootstrap.
- **Gherkin quality high.** Given-When-Then structure correct. Background used appropriately for shared preconditions. Scenario Outline used correctly for boundary tests (arrow-key navigation grid, hot-seat win-line variants).
- **Tag taxonomy consistent.** Priority / slice / seam / tool / AC-trace tags applied uniformly. No malformed tags detected.
- **Error-path coverage ≥40% mandate met.** 25/62 = 40.3%. Sampled scenarios confirm genuine error paths (filled-cell no-op, difficulty-disabled mid-game, mode-toggle disabled mid-game, old-browser fallback, CSP/network guards).
- **Test pyramid shape appropriate.** 47 Playwright + 5 axe + 2 property + 2 network + 4 Lighthouse + 2 static reflects risk; not over-pushed to slow E2E.
- **Seam coverage complete.** All 6 architectural seams (render, bootstrap, announce, ai, win-detector, crosscutting) exercised; `maybeRunAi` solo-vs-hot-seat branching explicitly tested both ways.
- **Exact-banner wording asserted.** Solo `"You win!"` / `"AI wins."` / `"Draw."`; hot-seat `"P1 wins!"` / `"P2 wins!"` / `"Draw."`. Verified at specific file:line locations.
- **Graceful degradation transparent.** KPI-2 (game-completion rate) has no E2E scenario because DEVOPS deferred the counter. Root cause + impact + mitigation + transparency note all documented in §4. Not buried.
- **DESIGN peer-review notes honoured.** All 3 items from DESIGN §10 DISTILL reconciliation table met.
- **Observable-behaviour strictness.** Zero assertions on mock calls, private fields, internal state, or implementation-coupled selectors.

### Mandate Compliance

| Mandate | Status |
|---|---|
| CM-A — Hexagonal Boundary | PASS |
| CM-B — Business Language | PASS |
| CM-C — User Journey Completeness | PASS |

### Issues Found

None rising to blocker / mandate-failure threshold.

**Minor (non-blocking):**
- Scenario count reported as 62 in `acceptance-tests.md`; outline-row expansion yields ~67 logical Playwright test cases. Documentation clarity issue (outline-counting convention), not a design issue. The crafter will naturally expand outline rows 1:1 into `.spec.ts` cases.
- Property-test scenarios (`US-04-perfect-never-loses`, `US-04-shared-signature`) are expressed in Gherkin for specification continuity but run as Vitest + fast-check, not Playwright. Tagged `@tool:vitest-property` — the crafter implements accordingly.

### Required Revisions

**None.** Suite is submission-ready.

### Notes for DELIVER (crafter wave)

1. **Sequence:** start with `feature-walking-skeleton.feature:14` (`US-01-empty-grid`); drive slices 01+02 fully green before touching slice 03.
2. **Tool install order:** Vite + TypeScript → Vitest + fast-check (for property + unit) → Playwright + axe-core (for E2E + a11y) → Lighthouse CI (last — bundle must exist).
3. **Tagging gotchas:** `@tool:vitest-property` scenarios run in Vitest, not Playwright. `@tool:axe` scenarios run via Playwright + `@axe-core/playwright`. Don't try to implement property scenarios in `.spec.ts` under `tests/e2e/`.
4. **Outline expansion:** scenario outlines → one test case per row. The 4-row arrow-navigation outline becomes 4 separate Playwright tests.
5. **If DEVOPS revives the KPI-2 counter mid-DELIVER**, add one crosscutting scenario per `wave-decisions.md §4` mitigation note.

### Approval Status

**APPROVED** — cleared for DELIVER wave handoff. No conditions.
