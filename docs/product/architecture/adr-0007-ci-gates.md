# ADR-0007: CI gate set for tic-tac-toe

## Status

Accepted — 2026-04-21

## Context

The DESIGN peer-review note to DEVOPS listed five non-negotiable gate requirements derived from the five outcome KPIs plus the architectural invariant: bundle ≤50KB gzipped, CSP `default-src 'self'`, `dependency-cruiser` rule forbidding core-to-adapter imports, Lighthouse perf ≥90, a11y ≥95 with axe-core zero violations, and a network-request assertion proving zero third-party requests on load.

DISCUSS peer-review reinforced this with the standalone non-negotiable list: *"Non-negotiable CI gates per PR: Lighthouse a11y ≥95, performance ≥90, axe-core 0 violations, 0 third-party requests, bundle ≤50KB gzipped."*

A CI gate set is a collective decision: adding too few lets regressions through; adding too many slows the development loop and creates flaky noise. The present ADR fixes the **exact gate count, scope, and break-conditions** so the crafter wave is writing to a precise target, not a wishlist.

## Decision

**Eight blocking per-PR gates**, plus one post-deploy smoke gate that runs only after `main` deploy. All eight PR gates also gate the `main`-push deploy (no asymmetry between PR and main gates — see `ci-pipeline.md` rationale).

### The gate set

| # | Gate | Type | Threshold / break condition | Traces to |
| --- | --- | --- | --- | --- |
| 1 | `lint-and-typecheck` | Blocking | Any ESLint error; any `tsc --noEmit` error | DESIGN constraint #10 (OSS-only, source-link footer requires compile cleanliness); general code-quality baseline |
| 2 | `unit-and-property` | Blocking | Any failing test; any fast-check counterexample; coverage below repo-level threshold (target: core ≥90% line, whole-repo ≥80% line — exact numbers locked in DELIVER) | DESIGN constraint #8 (property-test obligations); DISCUSS US-01..US-07 ACs |
| 3 | `dependency-cruiser` | Blocking | `src/core/**` imports from `src/adapters/**`; any circular dependency; any orphan module | DESIGN constraint #2 (core-adapter direction inward only); DESIGN peer-review note to DEVOPS item 3 |
| 4 | `bundle-size-check` | Blocking | Total gzipped `dist/**/*.{js,css}` > 50 KB; warn at > 45 KB | DESIGN constraint #1 (bundle ceiling); DISCUSS KPI guardrail; DESIGN peer-review note to DEVOPS item 1 |
| 5 | `lighthouse-ci` | Blocking | Perf score < 0.90; a11y score < 0.95; CLS > 0.1; FMP > 500 ms; total byte-weight > 50 KB | KPI-1, KPI-3, KPI-4; DESIGN peer-review note to DEVOPS item 1 |
| 6 | `axe-core-a11y` | Blocking | Any violation at severity `minor`+ on any of 4 canonical board states (empty / mid-game / won / draw) | KPI-3; DESIGN constraint #9 (4 canonical states); DISCUSS user-story US-03 |
| 7 | `network-assertion` | Blocking | Any request to a non-`self` origin on load; any `Set-Cookie`; any `document.cookie` present | KPI-5; DESIGN constraint #5 (no runtime third-party requests); DESIGN peer-review note item 2 (CSP) |
| 8 | `build` | Blocking (implicit) | Vite exits non-zero; expected outputs missing | Prerequisite for gates 4–7 |

Gate 8 (`build`) is named in the ADR for visibility even though it's structurally a precondition rather than a threshold gate. The reason it's listed as a distinct numbered gate: the build itself can break independently of tests (e.g., a Vite plugin misconfiguration) and the failure message is qualitatively different from the test-family gates — so crafting it as a separately-visible job improves diagnosability.

Plus:

| # | Gate | Type | Threshold | Runs when |
| --- | --- | --- | --- | --- |
| 9 | `deploy-smoke` | Blocking (advisory rollback) | HTTP 200 on `/`; HTML content-type; CSP meta tag present; `data-build-sha` matches commit | After `main` deploy only |

Gate 9 is **advisory** in the rollback sense — its failure does not trigger an automatic revert (there is no auto-revert infrastructure for GitHub Pages, and an auto-revert on a false-positive smoke failure would be worse than the false positive itself). Instead, smoke failure flags the commit red; the response is a manual `git revert` if the smoke actually indicates a bad deployment.

### Explicitly not gated in v1

| Not a gate | Rationale |
| --- | --- |
| CodeQL / other SAST | ESLint + small well-known dependency set covers realistic threat model at this scope |
| License compliance check | All dependencies pre-verified permissive (DESIGN tech-stack table); revisit when dependency list grows |
| Mutation testing | Principle 9 recommendation is per-feature Stryker strategy; NOT installed without Dale's explicit CLAUDE.md-persist approval. Flagged in platform brief §Open items. |
| Visual regression | Not in scope; trivial UI (3×3 grid); axe-core + Playwright behavioural coverage is sufficient |
| Contract tests | No external contracts (no backend, no API consumers) |
| Load / capacity tests | Static CDN; capacity is vendor concern |
| Chaos engineering | No distributed runtime; incoherent at this scale |

This is not laziness — each omission traces to an explicit scope or threat-model condition that removes the need.

## Consequences

### Positive

- **Every outcome KPI is CI-enforceable pre-merge.** No KPI depends on post-hoc manual review or stakeholder opinion.
- **The architectural invariant is CI-enforced.** Core cannot accidentally import adapters; that is not a review-time discipline, it is a gate.
- **The gate count is sized to the pipeline budget** (~5-minute total CI run on a cache hit). Each gate earns its seconds.
- **Symmetry between PR and main gates** means the "main must always be releasable" GitHub Flow invariant holds by construction.
- **No soft / advisory gates except smoke.** Advisory-with-rollback was considered for the Lighthouse perf score (trend-based regression detection), rejected as premature for a greenfield codebase where every first measurement is also the baseline.

### Negative

- **First-run CI will fail repeatedly until all thresholds are defensible.** This is normal and expected; the crafter wave's first week should produce several "calibrate thresholds" PRs. The risk is baseline-drift (see `nw-cicd-and-deployment` "baseline drift" pitfall) — mitigated by requiring that any threshold change carries an ADR note or a written rationale in the PR.
- **Test infrastructure cost is non-trivial.** Playwright browser download, axe-core integration, Lighthouse CI setup all carry ~1 hour of crafter-wave effort each. Accepted — the alternative is not being able to enforce the KPIs.
- **Bundle-size gate can cause churn** if a beneficial dependency sits just above the ceiling. Mitigation: ADR-0002 explicitly permits superseding ADRs for >1 KB additions; the gate is a conversation starter, not a wall.

## Alternatives considered

### Alternative A — Fewer gates, more manual review

- **What:** Keep gates 1–4 (lint, tests, dep-cruiser, bundle-size) blocking; run Lighthouse / axe / network-assertion only on a nightly schedule.
- **Rejected because:** violates the DISCUSS peer-review non-negotiable list ("**per PR**"). Regressions in perf or a11y detected nightly instead of at merge mean broken main for up to 24 hours; for a release-from-main pipeline that is unacceptable.

### Alternative B — More gates (add CodeQL, license-check, Snyk SCA, visual regression)

- **What:** Industry-baseline "secure SDLC" gate set.
- **Pros:** Broader defense-in-depth.
- **Cons:** Each gate doubles CI runtime or requires its own SaaS account; none trace to an outcome KPI; Dependabot already covers SCA; ESLint security rules already cover SAST at this scope.
- **Rejected because:** adding gates without a traced requirement is the exact over-engineering anti-pattern called out in the skill library. Revisit when the codebase or threat model grows.

### Alternative C — Tiered gates (blocking "must pass" + advisory "worth watching")

- **What:** Mark Lighthouse perf / a11y as advisory; use the number for trend but not for block.
- **Rejected because:** DISCUSS peer-review explicitly marks these as blocking. Advisory-only would permit merging a PR that breaks KPI-3 or KPI-4, which is exactly what the KPI guardrail structure exists to prevent.

## Cross-references

- Gate implementation specification: `docs/product/platform/ci-pipeline.md`.
- Platform brief: `docs/product/platform/brief.md` §CI/CD Pipeline Design.
- Traced KPIs: `docs/feature/tic-tac-toe/discuss/outcome-kpis.md`.
- Traced architectural constraints: `docs/feature/tic-tac-toe/design/wave-decisions.md` §Constraints Established (items 1, 2, 5, 8, 9).
- DESIGN peer-review notes (source of non-negotiables): `docs/feature/tic-tac-toe/design/wave-decisions.md` §Notes for DEVOPS.
- DISCUSS peer-review notes (source of non-negotiables): `docs/feature/tic-tac-toe/discuss/wave-decisions.md` §Notes for DEVOPS.
