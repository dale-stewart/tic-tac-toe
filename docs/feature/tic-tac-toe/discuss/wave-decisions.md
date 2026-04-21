# Wave Decisions — tic-tac-toe DISCUSS

**Wave:** DISCUSS (Luna, product-owner)
**Feature ID:** tic-tac-toe
**Facilitator:** Luna
**Date:** 2026-04-21
**User:** Dale Stewart (dale.stewart@meresoftware.com)
**Upstream:** `docs/feature/tic-tac-toe/discover/wave-decisions.md` (DISCOVER, Scout, approved by Beacon)

---

## 1. Framing

This DISCUSS wave follows a **Tier C practice-exercise** DISCOVER. Every customer-evidence item inherits that framing. No new interviews were conducted. No user research was performed during DISCUSS. All Gherkin scenarios, personas, and examples use realistic but authored names and contexts — no fabricated quotes, no invented research.

D1-D5 scope decisions from DISCOVER are **locked** (not revisited in DISCUSS).

User confirmed decisions at start of wave:

- **D-DISCUSS-1 Feature type:** User-facing
- **D-DISCUSS-2 Walking skeleton:** YES (greenfield)
- **D-DISCUSS-3 UX research depth:** Lightweight (happy-path focus)
- **D-DISCUSS-4 JTBD analysis:** NO — DISCOVER opportunity tree and jobs already produced; Phase 1 of Luna's discovery methodology skipped per user directive

---

## 2. Scope & Artifact Decisions

| ID | Decision | Rationale | Status |
|----|----------|-----------|--------|
| D-DISCUSS-5 | **Two personas in scope:** Casual-Idle-Time Player (primary, solo vs AI), Hot-Seat Pair (secondary). | Derived from DISCOVER problem-validation JTBDs 1 and 2/3. Covers the locked v1 scope. | Luna decision, not pinged |
| D-DISCUSS-6 | **Walking skeleton prioritizes solo-vs-AI (easy random) over hot-seat.** | Solo is primary JTBD; hot-seat is a vocabulary change over the same board + win detector. Solo exercises the AI code path, which is the riskier build asset. | Luna decision — single-question ping was considered and not issued because (a) hot-seat reuses the solo codebase so ordering has no throwaway-work cost, (b) Dale explicitly chose "keep user pings minimal" and "lightweight" |
| D-DISCUSS-7 | **7 stories total (US-01..US-07), sliced into 7 deliverables ≤ 1 day each.** Walking skeleton = US-01 + US-02. Release 1 = US-03, US-04, US-05. Release 2 = US-06, US-07. | Passes all Elephant Carpaccio taste tests (`prioritization.md`). | Luna decision |
| D-DISCUSS-8 | **Hot-seat v1 rule: P1 always starts as X.** Alternating starters deferred. | Simpler mental model, matches solo-vs-AI. Alternating starter is a backlog item if real user testing shows it matters. | Luna decision |
| D-DISCUSS-9 | **Difficulty default: medium.** | DISCOVER solution scope specifies medium as default; consistent with H2 (multi-difficulty drives replay — medium is the "interesting" pivot). | Luna decision (restates DISCOVER) |
| D-DISCUSS-10 | **Mode and difficulty controls disabled mid-game.** | Prevents accidental board reset; Hick's Law reduction of error paths; simpler state machine. | Luna decision |
| D-DISCUSS-11 | **No session persistence in v1 (reload = fresh game).** | DISCOVER D3 "no tracking" + "no accounts" posture; persistence would require localStorage with timestamps which crosses the line for a practice project with no privacy-policy apparatus. | Luna decision |
| D-DISCUSS-12 | **Aggregate counter KPI instrumentation is privacy-preserving only.** No per-session IDs, no cookies, no IPs logged. | Required to stay consistent with "No tracking" UVP (DISCOVER O4). Platform-architect in DEVOPS may propose a flat-file aggregate counter. | Luna decision — flagged for DEVOPS |
| D-DISCUSS-13 | **Outcome KPIs reframed for portfolio project.** Performance, a11y, privacy, game-completion. Growth / revenue KPIs intentionally absent per task-brief guidance. | See `outcome-kpis.md` § "Why these KPIs and not engagement / revenue / retention". | Luna decision |
| D-DISCUSS-14 | **Bootstrap `docs/product/` SSOT this wave.** Create `journeys/solo-player.yaml`, `journeys/solo-player-visual.md`, `journeys/hot-seat.yaml`, `journeys/hot-seat-visual.md`. `jobs.yaml` created with minimal cross-reference to DISCOVER opportunity tree (D4 = no fresh JTBD). | Greenfield-equivalent; migration gate per task brief. | Luna decision |

---

## 3. Changes to DISCOVER Assumptions

**None.** Every DISCOVER decision D1-D5 is preserved. No opportunity-tree score was revised. No JTBD was reopened (D4 from user). No viability reframing proposed.

Minor surface-level additions:

- The hot-seat journey captured the "mode toggle disabled mid-game" rule that DISCOVER did not anticipate. This is a detail, not a pivot.
- US-05 established the "P1 always starts" v1 rule (D-DISCUSS-8). Deferred alternating-starters to backlog.
- US-07 established the footer copy exactly: `"No ads. No signup. No tracking."` DISCOVER specified this as a UVP tag but did not lock the wording.

---

## 4. User Pings During the Wave

**Zero pings issued.** One ping was considered (walking-skeleton ordering: solo vs hot-seat first) and resolved by Luna because (a) it does not create throwaway work — hot-seat reuses the solo codebase, (b) Dale chose "lightweight" and "keep pings minimal", (c) DISCOVER already set solo as primary.

All other DISCUSS decisions fall below the "genuine fork where Dale's preference materially changes the output" threshold.

---

## 5. Gate Results

| Gate | Phase Transition | Criteria | Evidence Tier | Status |
|------|------------------|----------|---------------|--------|
| **Scope Assessment** (Elephant Carpaccio) | End of Phase 2.5 | ≤ 10 stories, ≤ 3 bounded contexts, ≤ 5 integration points, ≤ 2 weeks effort, single user outcome | Verified | **PASS** — 7 stories, 1 context, ~2 days, all slices ≤ 1 day |
| **DoR Gate** (9 items) | End of Phase 3 | All 9 items pass per story with evidence | Tier C (partial exemption) | **PASSED under practice-exercise exemption** — 55 full passes + 8 conditional passes citing `discover/wave-decisions.md` §6. See `dor-validation.md`. |
| **Requirements Completeness** | End of Phase 3 | Score > 0.95 | Honest composite | **0.98** — see `dor-validation.md` § "Completeness score calculation" |
| **Peer Review** | Before handoff | Reviewer approved, critical/high issues resolved | N/A | **NOT INVOKED** — Luna is not able to dispatch the peer-reviewer subagent herself in this execution. See §7. |

---

## 6. Handoff Readiness

### Artifacts produced (feature-level)

Under `docs/feature/tic-tac-toe/discuss/`:

- `journey-solo-player-visual.md`
- `journey-solo-player.yaml`
- `journey-solo-player.feature`
- `journey-hot-seat-visual.md`
- `journey-hot-seat.yaml`
- `journey-hot-seat.feature`
- `shared-artifacts-registry.md`
- `story-map.md`
- `prioritization.md`
- `user-stories.md` (US-01..US-07 with embedded AC)
- `outcome-kpis.md`
- `dor-validation.md`
- `wave-decisions.md` (this file)

Under `docs/feature/tic-tac-toe/slices/`:

- `slice-01-render-empty-board.md`
- `slice-02-accept-one-move-and-random-ai.md`
- `slice-03-keyboard-and-aria-baseline.md`
- `slice-04-difficulty-levels.md`
- `slice-05-hot-seat-mode.md`
- `slice-06-win-line-animation-and-palette.md`
- `slice-07-no-ads-footer-and-source-link.md`

Under `docs/product/` (bootstrapped SSOT):

- `journeys/solo-player.yaml`
- `journeys/solo-player-visual.md`
- `journeys/hot-seat.yaml`
- `journeys/hot-seat-visual.md`
- `jobs.yaml` (minimal cross-reference to DISCOVER opportunity tree per D-DISCUSS-14 and D4=NO)

### What DESIGN (solution-architect) should know

1. **Scope is locked:** 7 stories, portfolio framing, no networked MP, no accounts. If the architect's instinct is to propose a framework stack richer than the problem (state libraries, CSS-in-JS, build systems with 30-second cold starts), push back — DISCOVER H7 budgeted the entire build at 16h of engineering time, and DISCUSS has sliced it at ≤ 1 day per slice.
2. **A11y is non-negotiable:** WCAG 2.2 AA is a floor, not a nice-to-have (DISCOVER D4). Semantic HTML from the start; do not plan to retrofit.
3. **Privacy posture is load-bearing for the UVP:** no third-party requests on load (see KPI-5 guardrail). This constrains font choices, analytics choices, etc.
4. **Walking skeleton is Slice 1 + Slice 2.** It can ship in one day. It MUST ship before any R1 work begins — see the architect's anti-patterns list for "fat walking skeleton".
5. **Single source of truth for board state.** The shared artifact registry lists 6 artifacts. Any DESIGN proposal that duplicates board state (e.g., a separate "renderable view model" that caches the grid) must justify why the single-state model is insufficient.

### What DEVOPS (platform-architect) should know

See `outcome-kpis.md` § "Measurement Plan":

- Lighthouse CI and axe-core CI are required for KPI-3, KPI-4
- Automated network-request assertion in CI for KPI-5
- Optional aggregate counter (no PII) for KPI-2 — design must not require cookies / localStorage / per-user IDs

### What DISTILL (acceptance-designer) should know

- Journey `.feature` files (both solo and hot-seat) are already authored in business-outcome vocabulary (no implementation details in scenario titles).
- Integration checkpoints are listed per step in both `journey-*.yaml` files.
- Outcome KPIs are directly testable in CI — KPI-3 (a11y), KPI-4 (perf), KPI-5 (privacy) are automated assertion targets from day 1.

---

## 7. Peer Review Status

**Not invoked by Luna in this execution.**

Per task-brief direction: *"Peer review via `@nw-product-owner-reviewer` with explicit practice-exemption framing so reviewer does not reject for missing interview evidence that was intentionally excluded in DISCOVER. If you cannot dispatch the reviewer yourself, explicitly flag that the orchestrator must dispatch."*

Luna in this subagent execution does not have access to the Task-dispatch tool for invoking `nw-product-owner-reviewer`. **The orchestrator (or Dale) must dispatch the reviewer with the following framing context:**

### Framing to pass to `nw-product-owner-reviewer`

> *"Review DISCUSS artifacts for tic-tac-toe. This is a methodology-practice exercise. Tier-C evidence framing is carried forward from DISCOVER (see `docs/feature/tic-tac-toe/discover/wave-decisions.md` §§1, 6). Do NOT reject for missing customer-interview evidence — it was explicitly excluded from DISCOVER under the practice-exercise exemption, and `dor-validation.md` documents which items are conditional-pass under that exemption with citation. DO still apply all other review dimensions: confirmation-bias detection, NFR completeness, clarity & measurability, testability, and priority validation. The two known conditional-pass dimensions are (a) persona grounding for the Casual-Idle-Time and Hot-Seat personas and (b) outcome-KPI baselines (greenfield, no baseline data possible). Everything else should meet the full bar."*

### Expected review scope

- Confirmation bias: check for technology assumptions (Luna has been solution-neutral — no framework named)
- Completeness: verify NFRs (perf, a11y, privacy, browser support) and error scenarios
- Clarity: quantitative thresholds on every "fast / simple / user-friendly" claim
- Testability: every AC observable / measurable / automatable
- Priority validation: slice ordering defensible (walking skeleton first, a11y in R1, polish in R2)

**Max 2 iterations per standard DISCUSS rules. If reviewer requires >2 iterations, escalate to Dale.**

---

## 8. Open Items / Known Gaps

1. **Peer review not yet run** — see §7.
2. **`docs/product/jobs.yaml` is minimal** — D4=NO meant no fresh JTBD work in DISCUSS. The file cross-references the DISCOVER opportunity tree. If a future wave needs richer JTBD, DISCOVER would be the place to re-open it.
3. **No real-user validation of any scenario** — inherited Tier-C gap. All scenarios are testable in CI via unit + a11y + perf + network-assertion tests; user-observable behavior is testable in synthetic browser tests. No observed-in-the-wild validation until shipping.
4. **No monetization, no analytics, no aggregate counter design** — DEVOPS wave owns the aggregate counter mechanism (KPI-2) if it is implemented. Acceptable to ship v1 without it if DEVOPS judges even an aggregate counter to be over-engineering for a portfolio build.

---

## 9. Sign-off (self, pending peer review)

Luna (product-owner) is satisfied that:

- DISCUSS scope is right-sized and internally consistent.
- DoR gate is passed under the practice-exercise exemption with the exemption explicitly cited.
- No DISCOVER assumptions were silently modified.
- The walking-skeleton + 5-slice sequence is defensible and each slice has a falsifiable craft hypothesis.

**Pending peer-review approval before full handoff to DESIGN.** If peer-review approves without changes, this wave is handoff-ready as-is. If peer-review requests revisions, iterate up to 2 rounds per standard DISCUSS rules.

---

## 10. Peer Review Outcome

**Review Date:** 2026-04-21
**Reviewer:** Eclipse (`nw-product-owner-reviewer`)
**Verdict:** **APPROVED WITH NOTES**

### Strengths

- **Journey coherence and emotional design** — both solo and hot-seat flow cleanly, no dead ends, emotional arcs plausible and appropriately scaled.
- **Data-revealing examples** — named personas (Sam, Priya, Jae, Marcus, Alex, Dana) appear consistently with device/viewport/context specifics; move-by-move narratives validate state evolution; zero generic placeholders.
- **Honest DoR validation** — 55 full passes + 8 correctly-scoped conditional passes (all #2 persona or #9 KPI-baseline), each citing `discover/wave-decisions.md §6`. Not buried; not over-applied.
- **Disciplined Elephant Carpaccio slicing** — all 7 slices ≤1 day, observable outcomes, no 4+-component bundles, no per-slice abstraction introduction. Walking skeleton covers entire backbone.
- **Testable acceptance criteria** — zero vague language; all automatable in CI (Lighthouse, axe-core, network-request assertions).
- **Shared-artifact governance** — 6 artifacts, each with documented single source of truth, consumer list, and integration-risk assessment.
- **Privacy-first, portfolio-appropriate KPIs** — craft-quality targets (Lighthouse a11y ≥95, FMP ≤500ms, 0 third-party requests) instead of invented growth/revenue metrics.
- **Zero confirmation bias** — no technology assumptions, error scenarios present in all stories, walking skeleton hypothesis explicitly falsifiable.

### Issues Found

**Critical:** none. **Major:** none.

**Minor (3, all low severity):**

1. `journey-hot-seat.feature:19` — scenario title mixed design rationale ("to prevent accidental reset") into outcome vocabulary. *Resolved: reworded to "Mode toggle becomes unavailable once a move is placed".*
2. `outcome-kpis.md` KPI-2 — 70% game-completion target lacked a table-level provenance flag (honest caveat exists lower in the doc but table readers could miss it). *Resolved: added footnote ¹ linking to the Honest caveat section.*
3. `user-stories.md` US-04 AC — mode/difficulty disable scope was ambiguous across Slices 2/4/5 (walking skeleton has no toggle; disable behavior begins Slice 4). *Resolved: added explicit scope-note AC bullet clarifying that the behavior applies from Slice 04 onward.*

### Required Revisions — APPLIED

All three minor revisions have been applied directly after the review. See edits to `journey-hot-seat.feature`, `outcome-kpis.md`, and `user-stories.md`. No further iteration required.

### Gate Validation Summary

| Dimension | Verdict |
|---|---|
| Journey coherence | PASS |
| Emotional arc quality | PASS |
| Example data quality | PASS |
| Bug patterns (version/URL/path/commands) | PASS |
| DoR validation (9 items × 7 stories) | PASS (55 full + 8 conditional, exemption cited) |
| Antipattern detection (8 patterns) | PASS (1 minor title — resolved) |
| Story-to-slice traceability | PASS |
| Elephant Carpaccio taste tests | PASS (all 7) |
| Requirements completeness | PASS (0.98 > 0.95 target) |
| Confirmation bias | PASS (absent) |
| Clarity & measurability | PASS (1 minor flag — resolved) |
| Testability | PASS |
| Priority validation | PASS (pipeline derisking first, a11y in R1 not R2) |
| Practice-exemption honesty | PASS |

### Notes for DESIGN (nw-solution-architect)

1. **Scope is locked per DISCOVER D1–D5.** Resist any scope creep toward networked multiplayer, variants, or accounts.
2. **Walking skeleton (Slice 01 + 02) ships first, end-to-end.** Do not defer Slice 01 or bundle slices.
3. **`boardState` is a single source of truth.** No separate view model or render cache. If it seems necessary, that signals a framework-fit problem.
4. **A11y is Release 1 (Slice 03), not Release 2 polish.** Build semantic HTML from the start.
5. **Privacy constraints affect technology choice.** No Google Fonts, no third-party analytics, no third-party error tracking. Self-host or omit.
6. **Three AI difficulties share one function signature** `(boardState, playerMark) → [row, col]`. Minimax for 3×3 is textbook — no heroic abstraction needed.

### Notes for DEVOPS (nw-platform-architect)

1. **KPI measurement is CI-native.** Lighthouse CI (KPI-1/3/4), Playwright network-assertion script (KPI-5), optional aggregate counter (KPI-2 — privacy-preserving, no per-user IDs).
2. **Non-negotiable CI gates per PR:** Lighthouse a11y ≥95, performance ≥90, axe-core 0 violations, 0 third-party requests, bundle ≤50KB gzipped.
3. **Aggregate counter design (if implemented):** flat-file daily totals, no cookies, no IPs, no fingerprints. Acceptable to ship v1 without KPI-2 instrumentation if judged over-engineering.

### Handoff Status

**APPROVED — cleared for DESIGN and DEVOPS handoff.** All required revisions applied.
