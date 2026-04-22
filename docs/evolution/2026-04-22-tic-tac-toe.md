# Evolution: tic-tac-toe (v1.0.0)

**Feature ID:** tic-tac-toe
**Finalized:** 2026-04-22
**Release tag:** `v1.0.0` (commit `4aa91f7`)
**Framing:** Methodology-practice exercise, Tier C evidence throughout. Not a validated product — a toy feature used to exercise the full nWave flow end-to-end.

---

## 1. Feature summary

Accessible, zero-backend, zero-tracking tic-tac-toe SPA shipped as static assets on GitHub Pages at `/tic-tac-toe/`. Solo-vs-AI (easy / medium / perfect) and hot-seat (P1 vs P2) modes. WCAG 2.2 AA baseline. No ads, no signup, no cookies, no third-party network requests at runtime. Final bundle: 7.84 KB brotli (vs 50 KB gzipped budget).

---

## 2. Business context

Greenfield toy project with a deliberately locked practice-exercise framing from DISCOVER onward: every gate is labeled Tier C, no interviews conducted, no viability claim made as a business. DISCOVER sections explicitly record that under standard methodology all four evidence gates would fail — they pass here only under the practice-exercise exemption. This framing was carried forward honestly through every wave and never silently upgraded. If a real product were being built the discovery evidence would be a kill signal, not a go signal, and that is documented in `docs/feature/tic-tac-toe/discover/`.

Scope decisions locked at DISCOVER (D1–D5) and never revisited:

- Solo-vs-AI + hot-seat, no networked multiplayer.
- Classic 3×3 only, no Ultimate TTT / NxN / misère.
- No monetization, donation-only if anything.
- WCAG 2.2 AA as hard floor.
- Open-source posture so "no tracking" is verifiable.

---

## 3. Key decisions (synthesized from wave-decisions files)

### DISCOVER (Scout)

- Tier C framing made explicit in §1 of `discover/wave-decisions.md`, with the honest consequence that G1–G4 only pass under the practice exemption.
- v1 scope locked to solo-vs-AI + hot-seat (D1). Monetization = none / donation only (D3). A11y = WCAG 2.2 AA hard baseline (D4). Open-source posture (D5).
- One ping was considered (solo-vs-networked-MP scope fork) and resolved by the facilitator in favor of the lower-complexity MVP; never issued to user per the minimalist framing.

### DISCUSS (Luna, product-owner)

- **D-DISCUSS-5/6/7:** two personas (Casual-Idle-Time Player, Hot-Seat Pair), walking skeleton = Slice 01 + Slice 02 prioritizing solo-vs-AI (riskier build asset), 7 stories US-01..US-07 sliced into 7 deliverables ≤1 day each.
- **D-DISCUSS-8:** hot-seat v1 rule "P1 always starts as X"; alternating starters deferred.
- **D-DISCUSS-10/11:** mode/difficulty disabled mid-game; no session persistence (reload = fresh game).
- **D-DISCUSS-12:** KPI-2 aggregate counter must be privacy-preserving (no per-session IDs, cookies, IPs). Later deferred entirely by DEVOPS.
- **D-DISCUSS-13:** outcome KPIs reframed for portfolio project (perf, a11y, privacy, game-completion) — no growth/revenue/retention metrics invented.
- **D-DISCUSS-14:** SSOT journeys bootstrapped to `docs/product/journeys/` during this wave (the authoritative location; the `discuss/journey-*` files are feature-workspace copies that diverged during review and are the history, not the SSOT).
- Peer review (Eclipse) APPROVED with 3 minor fixes applied in-wave (hot-seat scenario-title rationale leak, KPI-2 footnote, US-04 scope-note).

### DESIGN (Morgan, solution-architect)

- **D1–D3:** functional paradigm, vanilla TypeScript + lit-html, single game-state reducer as the only producer of new state (SSOT by construction).
- **D4–D5:** static hosting + zero runtime backend; ports-and-adapters-shaped pure FP core + thin adapters (render / input / announce / bootstrap); `src/core/**` forbidden from importing `src/adapters/**`, enforced by dependency-cruiser in CI.
- **D6:** uniform AI signature `(BoardState, Mark) => [row, col]` behind a typed `strategies: Record<Difficulty, AiFn>` registry — adding a fourth difficulty is a one-line registry edit.
- **D7:** dedicated `announce` adapter with ARIA live region + 1 s debounce; `role="grid"` + `role="gridcell"` semantic grid; first-class a11y not afterthought.
- **D8:** toolchain = Vite + Vitest + fast-check + Playwright + axe-core + Lighthouse CI + dependency-cruiser. Chosen for KPI coverage, smallest reasonable footprint, no overlap.
- Four ADRs authored at **`docs/product/architecture/adr-0001..0004.md`** — see §8 "Deviation from skill destination map" below for why ADRs stayed under `docs/product/architecture/` rather than moving to `docs/adrs/`.
- Peer review (Atlas) APPROVED. One medium observation (bootstrap `#app` / `#announce` non-null assertions) carried forward to crafter wave.

### DISTILL (Quinn, acceptance-designer)

- **D1–D3:** driving port = the browser page at the canonical URL. Every scenario enters via user-observable behavior (DOM, ARIA, network, perf budgets). Walking-skeleton Strategy C: all real adapters, no in-memory substitute — the "delete the adapter and watch every scenario fail" litmus test passes.
- **D4:** AI-seam property tests as Vitest + fast-check (`@tool:vitest-property`) rather than Playwright, because running 100–1000 games through the UI would be prohibitively slow.
- **D5:** KPI-2 (completion rate) NOT E2E-asserted because DEVOPS deferred the counter. Documented as graceful degradation, not silent omission.
- **D8:** result-banner wording asserted EXACTLY. Solo `"You win!"`, `"AI wins."`, `"Draw."`. Hot-seat `"P1 wins!"`, `"P2 wins!"`, `"Draw."`.
- **D10:** tag taxonomy (priority / slice / seam / tool / AC-trace) applied uniformly.
- 62 scenarios across 7 feature files, 56/56 AC tags mapped in traceability matrix, 40.3% error-path coverage.
- Peer review APPROVED — no required revisions.

### DEVOPS (Apex, platform-architect)

- **D1:** static host = GitHub Pages (`adr-0005`). Cloudflare Pages / Netlify documented as ~10-minute drop-in replacements.
- **D2:** KPI-2 aggregate counter DEFERRED to v2 (`adr-0006`) — portfolio traffic <100 visitors makes completion-rate statistically useless; resurrection trigger is >500 sessions/month for 2 consecutive months.
- **D3:** CI pipeline = 8 blocking quality gates + 1 deploy job (`adr-0007`). Gates: lint/type-check, unit+property, dependency-cruiser (core↮adapters + no-orphans + no-circular), build, bundle-size ≤50 KB gzipped, Lighthouse (perf ≥90, a11y ≥95), axe-core zero-violation on 4 canonical states, network-assertion zero third-party requests.
- **D4:** GitHub Flow + squash-merge only; branch protection requires PR + all 8 gates + linear history + no force pushes.
- **D5–D7:** no PR previews / no staging / no runtime alerting — honest scoping for a free-tier static SPA with near-zero traffic and a single author. CI red-X + committer email IS the alerting channel.
- **D8:** CSP = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` via `<meta http-equiv>` (GitHub Pages cannot set response headers). `frame-ancestors 'none'` + `form-action 'none'` removed from the original mandate because browsers ignore them in meta form (per CSP spec) and they emitted a console warning every page load.
- **D9:** pre-commit + pre-push local gates (lefthook), <30s and <5min respectively; heavyweight gates stay CI-only.
- **D10:** mutation testing recorded as OPEN. Later ADOPTED mid-DELIVER (see §5 below); 100% score on the core scope at v1.
- Peer review APPROVED WITH NOTES: 1 critical (dep-cruiser orphan/circular rules), 1 high (explicit CSP meta-tag mandate), 1 major (smoke-failure escalation table) — all three applied in-wave.

### DELIVER (crafter wave)

- 8 steps across 3 phases, all executed with the full TDD loop (PREPARE → RED_ACCEPTANCE → RED_UNIT → GREEN → COMMIT) and all PASS at commit. Two RED_UNIT phases correctly skipped as NOT_APPLICABLE (01-01 scaffolding, 03-02 guardrail-verification — acceptance tests cover the full surface).
- Release tag `v1.0.0` cut at `4aa91f7` after `03-02` green.

---

## 4. Steps completed (from execution-log.json)

All 8 steps COMMIT / PASS. 7 DISCUSS slices collapsed into 8 delivery steps because Slice 01 was unbundled into a separate CI-scaffolding step (01-01) before the user-facing empty-board paint (01-02) — a deliberate walking-skeleton separation so the `.github/workflows/ci.yml` pipeline could be proven green against an empty page before any product code landed.

| Step  | Phase       | Name                                                  | Slice(s)       | Committed         | Notes                                                                                                                                                                             |
| ----- | ----------- | ----------------------------------------------------- | -------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01-01 | Scaffolding | Project scaffolding + CI gates                        | (pre-slice)    | 2026-04-21 21:45Z | All 8 CI gates green against empty-page skeleton. RED_UNIT skipped (no logic yet).                                                                                                |
| 01-02 | Scaffolding | Render empty board                                    | Slice 01       | 2026-04-21 23:22Z | axe-core zero violations on empty board; 44×44 min cell size; ancient-browser fallback.                                                                                           |
| 01-03 | Scaffolding | Accept moves + random AI + win detection + play again | Slice 02       | 2026-04-22 00:26Z | Walking skeleton complete end-to-end. Property tests for reducer invariants and placeMark idempotence on rejection landed here.                                                   |
| 02-01 | Release 1   | Keyboard navigation + ARIA live region                | Slice 03       | 2026-04-22 13:40Z | 14 scenarios including 4-row arrow-navigation outline and 4 axe-core canonical-state scenarios. Mutation coverage later tightened 89% → 100% on slice-03 helpers (`ab2036f`).     |
| 02-02 | Release 1   | Difficulty levels                                     | Slice 04       | 2026-04-22 15:26Z | Perfect-AI-never-loses property test (100 independently seeded games). Mutation coverage tightened 98% → 100% (`4b85a0e`).                                                        |
| 02-03 | Release 1   | Hot-seat mode                                         | Slice 05       | 2026-04-22 18:08Z | 13 scenarios. Global keyboard-shortcut binding bug fixed mid-step (`4966de2` — bind H / 1 / 2 / 3 to document, not `#app`).                                                       |
| 03-01 | Release 2   | Win-line animation + palette + footer                 | Slices 06 + 07 | 2026-04-22 19:02Z | CLS ≤0.1 over animation window; `prefers-reduced-motion` static-overlay branch; shape-not-color-only for color-blind users; footer zero new JS (bundle delta = 0).                |
| 03-02 | Release 2   | Cross-cutting guardrails + release finalization       | Crosscutting   | 2026-04-22 19:23Z | 8 crosscutting scenarios (network, CSP, bundle, Lighthouse perf/a11y, no-runtime-js-added). RED_UNIT skipped (guardrail verification only). Release `v1.0.0` tagged at `4aa91f7`. |

Final state on `main`: 192 unit / property tests, 80 Playwright scenarios, mutation score 100% on core scope, bundle 7.84 KB brotli.

---

## 5. Lessons learned

1. **CSS-missing bug caught only by manual visual verification (step 02-02).** The difficulty radio-group passed all automated gates — axe-core zero violations, scenarios green, keyboard activation correct — but the control rendered with no CSS styling and was visually broken. Fixed in `8f2e30b` ("add missing CSS for difficulty radio-group"). **Takeaway:** accessibility-tree and DOM-shape assertions do not catch visual regressions. A visual-regression gate (e.g., Playwright screenshots or Chromatic-style snapshot diffs) would close this gap. Not added in v1 because cost/benefit is poor at this scope, but noted for any future rendering-heavy feature.

2. **Global-shortcut binding bug (step 02-03).** The keyboard adapter initially bound H (mode toggle) and 1 / 2 / 3 (difficulty shortcuts) to `#app`, which meant they only fired when focus was inside the grid. User-observable bug: pressing H from the turn-indicator text did nothing. Fixed in `4966de2` by binding to `document`. **Takeaway:** keyboard shortcuts that are documented as global have to bind globally; scoping them to the render root is a plausible-looking mistake that passed tests because tests happened to focus inside the grid first.

3. **Mutation tightening discipline works — but requires equivalent-mutant judgement.** Two explicit mutation-tightening passes (slice-03 `ab2036f`: 89% → 100%; slice-04 `4b85a0e`: 98% → 100%) each took <30 minutes once the surviving mutants were enumerated. The loop is: run Stryker → inspect survivors → either kill with a targeted property/unit test OR flag as equivalent with a written justification. **Takeaway:** "100% mutation" is only meaningful with an equivalent-mutant policy. At this scope, equivalent mutants were rare enough to kill rather than annotate; at larger scale the ratio flips and a Stryker `excludedMutations` / `ignore` policy becomes necessary.

4. **Walking-skeleton unbundling (01-01 separate from 01-02) paid off.** Proving the CI pipeline green against an empty page gave a high-confidence safety net before any product code landed. Every subsequent step's RED_ACCEPTANCE phase was a real user-observable-behavior red, not a "pipeline doesn't work" red. Estimated cost: one extra commit. Benefit: zero pipeline-wobble debugging during product TDD.

5. **Deferring KPI-2 was the right call.** The aggregate-counter endpoint would have added CSP surface, a runtime dependency (a worker or function), and a statistical measurement that's meaningless at <100 visitors/month. Deferring it with a concrete resurrection trigger (>500 sessions/month for 2 consecutive months) is more honest than building instrumentation that can't answer any real question.

6. **Conditional-pass honesty in DoR did not degrade the downstream work.** 8 of the 63 DoR items were conditional-pass under the Tier-C practice exemption (all persona grounding or KPI baseline). Downstream waves (DESIGN / DISTILL / DELIVER) were able to proceed without stumbling on missing evidence because the exemption was labeled, not buried. Standard DoR would have blocked G1 on day one.

7. **Two RED_UNIT skips are appropriate — but only with documented rationale.** Steps 01-01 (scaffolding, no production logic yet) and 03-02 (guardrail verification, no new pure logic — acceptance tests cover the full surface) correctly skipped RED_UNIT. Both skips include a structured `NOT_APPLICABLE: <reason>` marker in the execution log. **Takeaway:** a skip without rationale is a bug; a skip with rationale is signal.

8. **lefthook pre-commit + pre-push tier split worked as designed.** Pre-commit <30 s kept the inner loop fast. Pre-push <5 min caught core↮adapters violations locally before they burned CI minutes. Heavyweight gates (Lighthouse, axe, network-assertion, bundle-size) stayed CI-only and the split held — no push-blocked-by-Lighthouse frustration occurred.

---

## 6. Issues encountered

| When               | Issue                                                                                                              | Severity           | Resolution                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 02-02              | Difficulty radio-group rendered with no CSS; automated gates all green but visually broken.                        | Medium             | `8f2e30b` — added missing CSS. Logged as lesson #1 above.                                                                           |
| 02-01              | Keyboard-entry discoverability weaker than intended.                                                               | Low                | `662d9c5` — strengthened keyboard-entry discoverability for slice-03.                                                               |
| 02-01              | Center cell did not re-focus after Play again.                                                                     | Low                | `890e03a` — re-focus center cell after Play again.                                                                                  |
| 02-03              | Global keyboard shortcuts (H / 1 / 2 / 3) bound to `#app`, not `document`.                                         | Medium             | `4966de2` — bind to document. Logged as lesson #2 above.                                                                            |
| 01-02              | Two post-deploy gaps found after initial slice-01 ship (GitHub Pages base-path + preview web-server health check). | Medium             | `a163f15` + `1274391` — use `/tic-tac-toe/` base, target that path in health check.                                                 |
| 01-02              | Preview-webServer design was split; simpler to consolidate.                                                        | Low                | `3658631` — consolidate to one preview webServer on `/tic-tac-toe/`.                                                                |
| DESIGN peer review | Bootstrap `#app` / `#announce` non-null assertions could crash silently if elements missing from HTML shell.       | Medium (deferred)  | Carried forward from DESIGN wave; addressed implicitly by the acceptance gate requiring the HTML shell to contain the mount points. |
| DEVOPS peer review | Dep-cruiser config lacked orphan + circular rules.                                                                 | Critical (in-wave) | Resolved in-wave — Job 4 now specifies all three rule families.                                                                     |
| DEVOPS peer review | CSP meta-tag requirement was implicit.                                                                             | High (in-wave)     | Resolved in-wave — explicit mandatory HTML-shell requirement written into `devops/wave-decisions.md §7`.                            |

No incidents post-tag.

---

## 7. Links to permanent artifacts

### Architecture & ADRs (existing repo convention, not migrated)

- `docs/product/architecture/brief.md` — architecture brief (C4 L1/L2/L3 sketch, component decomposition, testing strategy, KPI → architecture mapping).
- `docs/product/architecture/adr-0001-functional-paradigm.md` — functional paradigm decision.
- `docs/product/architecture/adr-0002-vanilla-ts-lit-html.md` — rendering stack.
- `docs/product/architecture/adr-0003-single-game-state-reducer.md` — reducer as SSOT.
- `docs/product/architecture/adr-0004-static-hosting-zero-backend.md` — deployment posture.
- `docs/product/architecture/adr-0005-static-host-selection.md` — GitHub Pages selection.
- `docs/product/architecture/adr-0006-kpi-2-aggregate-counter-disposition.md` — KPI-2 deferred to v2.
- `docs/product/architecture/adr-0007-ci-gates.md` — 8 CI gate design.

### Scenarios (migrated to permanent home)

- `docs/scenarios/tic-tac-toe/acceptance-tests.md` — master index.
- `docs/scenarios/tic-tac-toe/traceability-matrix.md` — 56/56 AC tags mapped.
- `docs/scenarios/tic-tac-toe/feature-walking-skeleton.feature` — slices 01 + 02.
- `docs/scenarios/tic-tac-toe/feature-keyboard-aria.feature` — slice 03.
- `docs/scenarios/tic-tac-toe/feature-difficulty-levels.feature` — slice 04.
- `docs/scenarios/tic-tac-toe/feature-hot-seat.feature` — slice 05.
- `docs/scenarios/tic-tac-toe/feature-polish.feature` — slice 06.
- `docs/scenarios/tic-tac-toe/feature-footer.feature` — slice 07.
- `docs/scenarios/tic-tac-toe/feature-crosscutting.feature` — crosscutting guardrails.

### UX journeys (existing SSOT, not migrated)

- `docs/product/journeys/solo-player.yaml` and `solo-player-visual.md`.
- `docs/product/journeys/hot-seat.yaml` and `hot-seat-visual.md`.

### Jobs-to-be-done

- `docs/product/jobs.yaml` (minimal, cross-references DISCOVER opportunity tree per DISCUSS D4=NO).

### Platform

- `docs/product/platform/ci-pipeline.md` — 8 gate pipeline spec.
- `docs/product/platform/brief.md` — platform design brief.
- `.github/workflows/ci.yml` — executable workflow authored from the pipeline spec.

### Feature workspace (preserved, not deleted)

Per the skill's explicit guidance, `docs/feature/tic-tac-toe/` is NOT deleted — the wave matrix derives status from this directory. The evolution doc is the summary; the feature directory is the history.

### Release

- Tag `v1.0.0` at commit `4aa91f7` on `main`.

---

## 8. Deviation from skill destination map

Two deliberate deviations from the `nw-finalize` default destination map, both to preserve continuity with pre-existing repo conventions rather than introduce parallel structures:

1. **ADRs kept at `docs/product/architecture/adr-000*.md`, not migrated to `docs/adrs/`.** The skill specifies a flat cross-feature namespace at `docs/adrs/`. This repo predates that convention with ADRs under `docs/product/architecture/` alongside the architecture brief — a structure established before DESIGN wave started. The ADR numbering (0001..0007) is a single contiguous sequence that would be disrupted by a split, and `brief.md` already cross-references the ADRs by their current path. Moving them would break links without adding clarity. **Future features added to this repo should follow the existing `docs/product/architecture/adr-NNNN-*.md` convention until a deliberate migration to `docs/adrs/` is done across all ADRs at once.**

2. **UX journeys kept at `docs/product/journeys/`, not migrated to `docs/ux/tic-tac-toe/`.** DISCUSS wave D-DISCUSS-14 explicitly bootstrapped `docs/product/journeys/` as the SSOT during this wave. The `discuss/journey-*.yaml` and `discuss/journey-*-visual.md` files are feature-workspace copies that diverged from the SSOT during DISCUSS peer review (verified — they differ). The SSOT versions are already at a permanent location. Creating `docs/ux/tic-tac-toe/` with either copy would introduce a third location and an ambiguous canonical answer.

3. **Architecture design docs** (`design/architecture-design.md`, `component-boundaries.md`, `technology-stack.md`, `data-models.md`): none of these were authored as separate files in DESIGN. The architecture brief at `docs/product/architecture/brief.md` subsumes all four concerns (C4 diagrams, component boundaries, technology stack table, and implicit data model via the typed `Action` / `BoardState` / `GameState` triple). No migration needed — the brief is already permanent.

---

## 9. Sign-off

- All 8 delivery steps COMMIT / PASS (`docs/feature/tic-tac-toe/deliver/execution-log.json`).
- Release `v1.0.0` cut at `4aa91f7`.
- All wave peer reviews approved (Beacon / Eclipse / Atlas / Quinn-reviewer / Apex-reviewer).
- No open action items carried forward.

Feature archived 2026-04-22.
