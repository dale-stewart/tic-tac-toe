# DEVOPS Decisions — tic-tac-toe

**Wave:** DEVOPS (platform-design phase)
**Author:** Apex (`nw-platform-architect`)
**Date:** 2026-04-21
**Evidence tier:** C (practice exercise)

## 1. Key Decisions

- **[D1] Static host = GitHub Pages.** The project already lives on GitHub, zero-cost, zero-config, atomic publishes. See `adr-0005-static-host-selection.md`. Alternatives (Cloudflare Pages / Netlify) documented as drop-in replacements if vendor lock-in becomes a concern (migration is ~10 minutes).
- **[D2] KPI-2 aggregate counter = DEFERRED to v2.** Portfolio-project traffic (<100 visitors in first month, most of them Dale + reviewers) makes a completion-rate measurement statistically useless; every byte of counter infrastructure adds CSP surface and cognitive load. See `adr-0006-kpi-2-aggregate-counter-disposition.md`. Clear resurrection trigger documented: revisit when sustained real-user traffic (>500 sessions/month for 2 consecutive months) exists.
- **[D3] CI pipeline = 8 blocking quality gates + 1 deploy job.** See `adr-0007-ci-gates.md` and `ci-pipeline.md`. Gates: lint/type-check, unit+property tests, dependency-cruiser (core↮adapters invariant), build, bundle-size ≤50KB gzipped, Lighthouse CI (perf ≥90, a11y ≥95), axe-core on 4 canonical board states, network-assertion (0 third-party requests on load).
- **[D4] Branching = GitHub Flow, squash-merge only.** Matches slice-at-a-time delivery cadence (≤1 day per slice, 7 slices total). Branch protection on `main` requires PR + all 8 gates + up-to-date + linear history + no force pushes.
- **[D5] No PR previews in v1.** Reviewers inspect uploaded CI build artifacts; slices small enough to run locally if visual verification needed. Cloudflare Pages sidecar documented as the cheap upgrade path if demand emerges.
- **[D6] No staging environment.** Full prod is a free CDN-backed static host; "staging" would be 100% parity with prod — paying round-trip cost for zero information gain.
- **[D7] No runtime alerting / no on-call.** CI red-X on PR + committer email IS the alerting channel. Static site, single author, traffic near zero — only incident shape is "build regression" and that's caught at the gate.
- **[D8] CSP = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`.** Enforces KPI-5 at the edge; network-assertion CI gate is the defence in depth.
- **[D9] Pre-commit / pre-push local gates** = format + lint + secrets scan + fast unit subset (pre-commit, <30s) and full unit+property+typecheck+dep-cruiser (pre-push, <5min). Heavyweight gates (Lighthouse, axe, network-assertion, bundle-size) stay CI-only.
- **[D10] Mutation testing = recommended per-feature (Stryker on changed files per PR, ~5–15 min); **Dale decides\*\* whether to install. Recorded as open item, not adopted by default.

## 2. Constraints Established (downstream must honour)

1. **Every PR must pass 8 blocking gates** before merge. No admin-override path; emergency fixes follow the same path.
2. **Any new runtime dependency >1KB gzipped requires a superseding ADR** to ADR-0002 before `bundle-size-check` will accept the increase.
3. **`src/core/**`MUST NOT import from`src/adapters/**`** — enforced by `dependency-cruiser` in CI and a pre-push local check.
4. **Zero runtime third-party network requests** — enforced by both CSP header and Playwright network-assertion. No analytics, fonts, CDN-hosted libs, error trackers, or `<link rel="preconnect">` to anything but `self`.
5. **Bundle ceiling = 50KB gzipped** (production build, JS+CSS combined). Soft warn at 45KB (PR comment), hard fail at 50KB.
6. **Lighthouse thresholds per PR:** perf ≥90, a11y ≥95, FMP ≤500ms, CLS ≤0.1.
7. **axe-core zero violations** on 4 canonical board states: empty / mid-game / won / draw.
8. **Rollback target ≤10 minutes from detect to restore** via `git revert <bad-sha>` + pipeline re-run + Pages propagation.
9. **No client-side telemetry in v1** (guarded by D2 + KPI-5).
10. **Build-time determinism:** `dist/` output hashable; `data-build-sha` meta tag matches commit; post-deploy smoke asserts this.

## 3. Production-Readiness Checklist

- [x] CI pipeline designed and gated (see `ci-pipeline.md`)
- [x] Deployment strategy defined (rolling via GitHub Pages atomic publish)
- [x] Rollback procedure documented (≤10 min target)
- [x] CSP header specified
- [x] Observability philosophy honest (static site = synthetic-only measurement)
- [x] KPI instrumentation map produced (KPI-1,3,4,5 in CI; KPI-2 deferred)
- [x] Cost envelope: **$0/month** at expected portfolio traffic
- [x] Security posture: no secrets, no cookies, no PII storage, HTTPS-only
- [x] DR plan honest: "N/A — single vendor-managed CDN"
- [ ] Actual CI workflow `.yml` authored — deferred to crafter wave (DELIVER)
- [ ] Static host chosen on GitHub (settings → Pages) — requires user action at deploy time

## 4. Reuse Analysis

| Existing Component | File | Overlap | Decision | Justification                                                         |
| ------------------ | ---- | ------- | -------- | --------------------------------------------------------------------- |
| N/A — greenfield   | —    | —       | N/A      | No pre-existing pipeline, deploy config, or platform infra to extend. |

## 5. Upstream Changes

None. All DESIGN + DISCUSS + DISCOVER constraints honoured without modification. Cross-checked against:

- `docs/feature/tic-tac-toe/discuss/outcome-kpis.md` — 5 KPIs all mapped to pipeline mechanisms (KPI-2 explicitly deferred per the wave's own permission)
- `docs/feature/tic-tac-toe/design/wave-decisions.md` §10 peer-review DEVOPS notes — all 5 items honoured (bundle ceiling, CSP, dep-cruiser, host preference order, counter discretion)
- `docs/product/architecture/brief.md` §KPI → architecture mapping — every KPI arch-driver has a pipeline counterpart
- `docs/product/architecture/adr-0004-static-hosting-zero-backend.md` — host narrowed to GitHub Pages; "zero runtime backend" preserved (counter deferred)

## 6. Peer Review Status

**Pending orchestrator dispatch of `@nw-platform-architect-reviewer`.** All platform artifacts on disk and ready for review. Expected review dimensions: pipeline gate completeness, CSP correctness, cost accuracy, honest observability claims, DR honesty, KPI instrumentation traceability.

## 7. Handoff to DELIVER

**Cleared for DELIVER wave handoff** pending peer-review approval. Crafter wave will:

1. Initialize the Vite + TypeScript + Vitest + Playwright + axe-core scaffolding.
2. Author the `.github/workflows/*.yml` from the pipeline spec in `ci-pipeline.md`.
3. Install `dependency-cruiser` with the core↮adapters rule.
4. Configure `lighthouserc.json`, `.eslintrc`, `tsconfig.json`, `playwright.config.ts`.
5. Add the pre-commit / pre-push hooks per D9.
6. Enable GitHub Pages on the repo (settings action — requires user).
7. Add CSP header via a `<meta http-equiv>` tag OR via a deploy-time Pages config, whichever is simpler.

### Mandatory HTML shell requirement (from peer review — reviewer escalation)

The crafter-authored HTML shell **MUST** include this exact CSP meta tag (or a stricter equivalent that still satisfies the gate):

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'"
/>
```

The network-assertion gate (Job 9) and the post-deploy smoke (Job 10) both check for this tag. Omitting or malforming it will fail the deploy with a red X. GitHub Pages does not permit custom HTTP response headers, so the meta-tag form is the only viable mechanism.

**Directives removed from the original mandate (post-01-02 bugfix):** `frame-ancestors 'none'` and `form-action 'none'` were dropped because browsers ignore both directives when delivered via `<meta http-equiv>` (per the CSP spec; they require a real response header) and emit a console warning at every page load. Defence in depth is unchanged: `default-src 'self'` already blocks form submissions to foreign origins, and GitHub Pages cannot set response headers anyway, so those two directives were pure noise. Downstream crafters MUST NOT reintroduce them in meta form.

---

## 8. Peer Review Outcome

**Review Date:** 2026-04-21
**Reviewer:** `nw-platform-architect-reviewer`
**Verdict:** **APPROVED WITH NOTES** — all three required revisions have been applied (§§below).

### Strengths

- **CI gate completeness** — all 8 gates trace to 5 KPIs + the core↮adapters invariant. No gates missing; none added without cause.
- **CSP correctness for lit-html** — `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` correctly permits lit-html's build-time-compiled templates while blocking runtime injection. Meta-tag form is the only option on GitHub Pages (no custom response headers).
- **ADR rigor** — 0005 (host), 0006 (KPI-2), 0007 (gates) each have ≥2 alternatives with honest rejection reasoning.
- **Cost accuracy** — $0/month realistic on portfolio traffic (Pages bandwidth <1GB/mo of 100GB cap; Actions ~250 min/mo of 2000 free).
- **Observability honesty** — no runtime RED/USE signals claimed that don't exist. Build health + synthetic quality + bundle drift + host status is the full honest picture for a static SPA.
- **Break-condition specificity** — every gate has a concrete, automatable threshold (no "investigate" advisory gates).
- **Rollback realism** — ≤10 min MTTR is achievable (revert ~1 min + CI ~5 min + Pages ~2 min + smoke ~1 min); matches DORA Elite comfortably.
- **KPI instrumentation map** — KPI-1/3/4/5 map to concrete mechanisms; KPI-2 deferred with a clear resurrection trigger.
- **Security posture** — no auth, no secrets, no PII, no cookies, HTTPS-only, CSP + Dependabot. Complete for scope.
- **Bundle budget enforceable** — "any dep >1KB requires superseding ADR" is wired into `bundle-size-check`, not honor system.

### Issues Found

**Critical (1):** Dependency-cruiser config lacked orphan + circular rules → **RESOLVED** (ci-pipeline.md Job 4 now specifies all three rule families).

**High (1):** CSP meta tag requirement was implicit → **RESOLVED** (this §7 now carries an explicit mandatory HTML-shell requirement).

**Major (1):** Post-deploy smoke failure escalation policy was ambiguous → **RESOLVED** (ci-pipeline.md Job 10 now includes a smoke-failure escalation table mapping each failure type to the required response).

**Medium (2, non-blocking):**

- Lighthouse CI temporary-storage 7-14 day retention may be insufficient long-term; forward note: consider self-hosted LHCI or GitHub Releases archival if trend history becomes important.
- Dependabot PR review cadence + auto-merge policy is unspecified; recommend auto-merge minor/patch, manual-review major + dev-deps. Not blocking for v1.

### DORA + External-validity checks

- Deployment frequency ✓ | Lead time ~7 min ✓ | Change failure rate trackable ✓ | Time to restore ≤10 min ✓
- Deployment path complete ✓ | Observability honest ✓ | Rollback present ✓ | Security gates integrated ✓

### Notes for DELIVER (crafter wave)

1. Wire the full `.dependency-cruiser.js` config per Job 4 (core↮adapters + no-circular + no-orphans).
2. Ensure the CSP meta tag is present in `index.html` from the first commit — the network-assertion gate enforces this.
3. Implement post-deploy smoke as Playwright (`tests/smoke/post-deploy.spec.ts`) for maintainability over inline curl+grep.
4. Accept LHCI temporary-public-storage for v1; add persistent trend archival only if needed later.
5. Choose `lefthook` over `husky` per the brief's recommendation (polyglot + fast + no JS ecosystem lock-in).
6. Use `size-limit` with declarative `package.json` config for bundle-size enforcement.
7. Do **not** install Stryker without explicit Dale sign-off (D10 remains open).

### Approval Status

**APPROVED WITH NOTES** — all three required revisions applied. Platform design is cleared for DELIVER wave handoff.
