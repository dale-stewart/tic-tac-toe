# DESIGN Decisions — tic-tac-toe

*Wave: DESIGN. Architect: Morgan (solution-architect). Date: 2026-04-21.*
*Interaction mode: Propose (confirmed by Dale on three forks A/B/C).*

## Key Decisions

- **[D1] Paradigm: Functional Programming.** Pure core of immutable types + pure functions, effects isolated to adapters. Source: ADR-0001 (`docs/product/architecture/adr-0001-functional-paradigm.md`); DISCUSS peer-review note on single-source-of-truth (`docs/feature/tic-tac-toe/discuss/wave-decisions.md`). Rationale: property-based testing fit, enforces SSOT by construction, minimal ceremony for rule-dense domain.

- **[D2] Rendering: Vanilla TypeScript + lit-html.** No component framework; lit-html (~4KB gzipped) applied as the pure `state → TemplateResult` adapter. Source: ADR-0002 (`docs/product/architecture/adr-0002-vanilla-ts-lit-html.md`); DISCUSS bundle ceiling KPI (`docs/feature/tic-tac-toe/discuss/outcome-kpis.md`). Rationale: 50KB budget headroom, zero runtime, no framework lock-in, clean pairing with FP core.

- **[D3] State management: Single game-state reducer with typed `Action` union.** `reduce(gameState, action) ⇒ gameState'` is the only producer of new state. Source: ADR-0003 (`docs/product/architecture/adr-0003-single-game-state-reducer.md`); DISCUSS peer-review note flagging SSOT as non-negotiable. Rationale: construction-time enforcement of single source of truth, greppable transitions, trivial to test.

- **[D4] Deployment: Static hosting, zero runtime backend.** MVP ships as pure static assets; final host selected in DEVOPS wave (GitHub Pages / Cloudflare Pages / Netlify). Optional KPI-2 aggregate-counter endpoint is specified by shape, vendor-agnostic. Source: ADR-0004 (`docs/product/architecture/adr-0004-static-hosting-zero-backend.md`); DISCOVER "no ads / no tracking" constraint. Rationale: zero ops burden, privacy posture by construction.

- **[D5] Internal structure: Ports-and-adapters-shaped pure FP core + thin adapters.** Dependencies point inward; core imports nothing adapter-related, no browser APIs. Adapters: `render`, `input/keyboard`, `input/pointer`, `announce`, `bootstrap`. Source: Architecture brief §Component decomposition (`docs/product/architecture/brief.md`). Rationale: adapter swappability (e.g., server-side renderer for future preview image), test isolation, enforceable direction via `dependency-cruiser`.

- **[D6] AI module signature: shared `(state: BoardState, mark: Mark) => [row, col]`, three interchangeable strategies behind a typed `strategies: Record<Difficulty, AiFn>` lookup.** `ai/easy.ts`, `ai/medium.ts`, `ai/perfect.ts`. Source: DISCUSS outcome KPIs (`docs/feature/tic-tac-toe/discuss/outcome-kpis.md`), architecture brief §Component decomposition. Rationale: adding a fourth difficulty is a 1-line registry change; perfect-AI property test (never loses) attaches to the uniform signature.

- **[D7] Accessibility adapter strategy: Dedicated `announce` module with ARIA live region and 1s debounce.** Pure `announce(state, liveRegion)` called from bootstrap after every reduce; state-diff-derived strings; `role="status" aria-live="polite"` element in the DOM shell. Semantic grid in `render` (`role="grid"`, cells `role="gridcell"` with `aria-label`), full arrow-key navigation in `input/keyboard`. Source: Slice-03 (`docs/feature/tic-tac-toe/slices/slice-03-keyboard-and-aria-baseline.md`), architecture brief §Testing strategy (axe-core gating). Rationale: WCAG 2.2 AA is a KPI; first-class accessibility adapter not an afterthought.

- **[D8] Build toolchain: Vite + Vitest + Playwright + axe-core + Lighthouse CI.** Vite for dev server and production build with bundle analyzer; Vitest for core unit + property tests; Playwright for narrow DOM integration; axe-core and Lighthouse CI as gates. Source: Architecture brief §Testing strategy. Rationale: smallest reasonable toolchain that covers every KPI-linked gate without overlap.

## Architecture Summary

- **Pattern:** Ports-and-adapters with a pure functional core. Dependencies flow adapters → core; core has no outbound adapter imports.
- **Paradigm:** Functional programming (immutable data, pure functions, effects at the edge).
- **Framework/rendering:** Vanilla TypeScript + lit-html (no component framework).
- **Key components:**
  - Pure core: `board`, `win-detector`, `ai/easy`, `ai/medium`, `ai/perfect`, `ai/index` (strategies lookup), `game` (reducer).
  - Adapters: `render` (lit-html), `input/keyboard`, `input/pointer`, `announce` (ARIA live), `bootstrap` (≤30 LOC wiring).
- **Deployment:** Static bundle on a CDN-backed static host; target selected in DEVOPS wave.

## Reuse Analysis

| Existing component | Location | Intended reuse | Extension required | Notes |
| --- | --- | --- | --- | --- |
| N/A — greenfield | — | — | N/A | No prior codebase in this repository; all modules are new. Verified by directory inspection at DESIGN start. |

## Technology Stack

| Technology | License | Rationale |
| --- | --- | --- |
| TypeScript (≥5.4) | Apache-2.0 | Strong types for discriminated-union `Action`, compile-time enforcement of reducer exhaustiveness, zero runtime cost. |
| lit-html (≥3.x) | BSD-3-Clause | ~4KB gzipped templating library; pairs cleanly with pure `state → template` render function. |
| Vite (≥5) | MIT | Fast dev loop, esbuild+rollup production bundle, built-in bundle analysis. Zero config for this scope. |
| Vitest (≥1) | MIT | Vite-native unit test runner; fast watch mode; jest-compatible API. |
| fast-check (≥3) | MIT | Property-based testing for core invariants (reducer never overfills board, perfect AI never loses). |
| Playwright (≥1.40) | Apache-2.0 | DOM-level integration tests for accepted-move / win-banner / announce flows. Not used for unit coverage — narrow by design. |
| axe-core (≥4) | MPL-2.0 | Accessibility gate in CI against rendered snapshots (empty, mid-game, won, draw). |
| Lighthouse CI (≥0.13) | Apache-2.0 | Perf budget enforcement: Lighthouse perf ≥90, CLS ≤0.1, bundle ≤50KB, FMP ≤500ms. |
| dependency-cruiser (≥16) | MIT | Enforces `core/**` cannot import `adapters/**` — the architectural invariant from D5. |

No proprietary dependencies. All licenses are permissive (MIT / Apache-2.0 / BSD-3-Clause / MPL-2.0). No AGPL/GPL touching the shipped bundle.

## Constraints Established

Downstream waves (acceptance-designer, software-crafter, platform-architect) MUST honour:

1. **Bundle ceiling: 50KB gzipped total**, measured on the production build. Any dependency addition above 1KB requires ADR superseding ADR-0002.
2. **Core-adapter dependency direction is inward only.** `src/core/**` MUST NOT import from `src/adapters/**`. Enforced by `dependency-cruiser` rule in CI.
3. **All `GameState` transitions go through the reducer.** No module-local mutable state holding game data. No mutation of `BoardState` instances. Enforced by code review; `readonly` types help at compile time.
4. **AI functions share the exact signature `(state: BoardState, mark: Mark) => [row, col]`** and are registered in `ai/index.ts` as `strategies: Record<Difficulty, AiFn>`. Adding a difficulty means adding a registry entry, not changing the dispatch site.
5. **No runtime third-party network requests.** No fetching fonts, analytics, telemetry, or remote libraries at runtime. Enforced via CSP header and Lighthouse network assertion (DEVOPS to configure).
6. **ARIA live region debounce = 1s.** Rapid successive announcements (e.g., hot-seat alternating clicks) collapse to the latest meaningful state change.
7. **Typed failures, not thrown exceptions, across core boundaries.** Core functions that can fail return `Result<T, E>`; adapters see no exceptions originating in core.
8. **Property-test obligations for the crafter:** (a) reducer never produces a board with >9 marks; (b) `placeMark` idempotent on rejection; (c) `ai/perfect` outcome set is `{perfect_wins, draw}` only, never `perfect_loses`, over at least 100 games against each other AI and itself.
9. **Accessibility gates in CI: axe-core zero-violations on 4 canonical states** (empty, mid-game, won, draw) and full keyboard coverage validated by Playwright.
10. **OSS-only dependencies; source-link footer** rendered by `render` adapter (from slice-07).

## Upstream Changes

No contradictions with DISCUSS artifacts detected. Specifically cross-checked against:

- `docs/feature/tic-tac-toe/discuss/outcome-kpis.md` — all six KPIs mapped to architectural drivers in brief.md §KPI mapping.
- `docs/feature/tic-tac-toe/discuss/wave-decisions.md` — SSOT-for-boardState, uniform AI signature, OSS posture, no-tracking posture all preserved and strengthened.
- `docs/feature/tic-tac-toe/discuss/story-map.md` and all seven slice specs — every slice has a clear landing in the proposed module structure; no slice requires a component the architecture doesn't provide.
- `docs/feature/tic-tac-toe/discuss/prioritization.md` — slice order (01 → 07) is compatible with incremental wiring (bootstrap + render + board first, AI modules bolted on in slices 02/04, ARIA in slice 03, hot-seat in slice 05, polish in slice 06/07).

No upstream revision requested.

---

## Peer Review Outcome

**Review Date:** 2026-04-21
**Reviewer:** Atlas (`nw-solution-architect-reviewer`)
**Verdict:** **APPROVED**

### Strengths

- **Rigorous ADR methodology.** All four ADRs include context, decision rationale, ≥2 alternatives with honest (non-straw-man) rejection reasoning, and consequence analysis. No hand-waving.
- **Pattern fit is justified, not shopping.** Ports-and-adapters + pure FP core is driven by three concrete drivers: property-based testing fit, SSOT by construction, adapter swappability. Sized to scope — 7 core + 5 adapters, no over-engineering.
- **Bundle estimate is realistic.** 12KB gzipped total (lit-html ~4KB, core ~3–5KB, adapters ~2–3KB, CSS ~1.5KB, HTML ~0.5KB) leaves 76% headroom in the 50KB budget. Math verified.
- **KPI-to-architecture mapping is concrete, not aspirational.** Every KPI-1..5 traces to specific components and CI gates.
- **A11y is first-class.** Dedicated `announce` adapter with 1s debounce; semantic grid scoped to slice-03; axe-core gates 4 canonical states.
- **Technology choices are constraint-justified.** lit-html chosen for bundle ceiling; TypeScript chosen for discriminated-union exhaustiveness; Vite for zero-config. Each traces to DISCUSS constraints.
- **Component decomposition is tight.** No overlap, no god objects, no circular dependencies. 7 core modules have distinct responsibilities; 5 adapters each have single responsibility.
- **Dependency direction enforced.** `dependency-cruiser` rule in CI guards `core/** ↮ adapters/**`.
- **Slice alignment is excellent.** All 7 DISCUSS slices (01–07) have clear landings in the architecture; no rework, no architectural surprises.
- **AI interface is extensible by design.** Uniform `(BoardState, Mark) → [row, col]` signature + typed registry means adding a fourth difficulty is a one-line change.

### Issues Found

**Critical:** none. **High:** none.

**Medium (1):**
- **Bootstrap DOM-element resolution lacks error handling.** `document.querySelector('#app')!` and `#announce` use non-null assertions. If either is missing from the HTML shell, the app crashes silently. Deferred to crafter wave — recommendation: either defensive checks with a user-facing error or an acceptance-test gate on HTML shell validation.

**Minor (1):**
- **L3 C4 diagram doesn't visualize the runtime event loop.** The text explains input → dispatch → reduce → render → announce clearly, but the diagram alone doesn't show the loop. Optional enhancement: add a sequence or state-machine diagram. Not required for approval.

### Required Revisions

**None.** The medium-severity bootstrap issue is appropriately deferred to the crafter wave.

### Notes for DEVOPS (nw-platform-architect)

1. **Bundle monitoring:** Lighthouse CI gate must enforce ≤50KB gzipped per PR. Break-on-failure for any dependency >1KB (implies ADR-0002 supersession).
2. **KPI-2 aggregate counter (if implemented):** ADR-0004 specifies shape — single stateless endpoint, anonymous timing samples only, no per-session IDs / cookies / IP logging. DEVOPS picks runtime (Cloudflare Worker / Netlify Function). Shipping v1 without instrumentation is acceptable.
3. **CSP header:** `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` — guards KPI-5.
4. **`dependency-cruiser` rule in CI:** forbid `src/core/**` importing from `src/adapters/**`.
5. **Static host preference order** (per ADR-0004): GitHub Pages / Cloudflare Pages / Netlify. No technical blocker for any; pick on cost and familiarity.

### Notes for DISTILL (nw-acceptance-designer)

1. **Architectural seams as test boundaries:**
   - Core-adapter ports: pure functions on both sides, fast unit + property tests in core.
   - AI interface seam: uniform `AiFn` signature → property tests attach to the interface, not implementations.
   - Bootstrap orchestration: the `maybeRunAi` branching (solo: schedule AI if turn is AI mark; hot-seat: never) is the one mode-dependent behavior — needs explicit Playwright coverage.
2. **Recommended CI gate sequence:** lint + bundle-size → unit + property (Vitest + fast-check) → axe-core a11y audit on 4 canonical states → network-assertion (0 external requests on load) → Playwright narrow integration (moves, win banner, ARIA, keyboard).
3. **AC behavioral boundaries:** all 7 slice ACs in DISCUSS are already observable-behavior phrased — no translation needed.

### Handoff Status

**APPROVED — cleared for DEVOPS (full artifact set) and DISTILL (architectural seams) in parallel.** Carry the medium-severity bootstrap observation forward to the crafter wave.
