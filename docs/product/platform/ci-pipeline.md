# CI Pipeline Specification — tic-tac-toe

*Owner: platform-architect (Apex). Wave: DEVOPS (platform-design phase). Date: 2026-04-21.*
*Sibling SSOT: `docs/product/platform/brief.md`.*

This document is a prose + table specification of the CI/CD pipeline stages, gate thresholds, inputs/outputs, and trigger rules. **Actual YAML lives under `.github/workflows/`** and is written in the DELIVER (crafter) wave — not here. The shape is captured in enough detail that the crafter wave can translate 1:1 without platform decisions leaking into implementation.

## Workflow file layout (target)

The crafter wave will produce a single workflow:

- `.github/workflows/ci.yml` — runs on PR + push-to-main + `workflow_dispatch`

Optionally a second workflow:

- `.github/workflows/dependency-review.yml` — Dependabot-friendly dependency review on PRs (zero-config GitHub feature)

No release workflow in v1 (GitHub Flow — deploy happens in the same workflow on `main` push).

## Trigger matrix

| Trigger | Paths filter | Jobs run | Deploy? |
| --- | --- | --- | --- |
| `pull_request` to `main` | `**` | 2 through 9 | No |
| `push` to `main` | `**` | 2 through 10 | Yes (10 is deploy) |
| `workflow_dispatch` | N/A | All 2 through 10 (deploy step gated on `main` branch) | Conditional |
| `schedule` | N/A | **not used in v1** | No |

Docs-only changes (`docs/**` path-only PRs) still run the full pipeline because the bundle-size gate guards the ADR invariant — there is no safe "docs-only skip" for a project with this tight a bundle budget. However, the build is fast enough (~5 min total) that the extra cost is trivial.

## Stage map

The pipeline is structured as three logical stages matching `nw-cicd-and-deployment`:

1. **Commit stage** (jobs 2–4): fast, isolated, no build artifact required.
2. **Build + quality stage** (jobs 5–9): produces `dist/` and gates it against all outcome KPIs.
3. **Deploy stage** (job 10, `main` only): publishes to GitHub Pages.

Local gates (pre-commit, pre-push) mirror stage 1. Stages 2 and 3 are CI-only.

## Local quality gates (mirror of commit stage)

Framework: **lefthook** (polyglot, fast parallel execution per `nw-cicd-and-deployment` skill). Alternative: husky + lint-staged if Dale prefers the JS-native ecosystem — decision deferred to crafter wave but lefthook is the Apex recommendation.

### `pre-commit` (< 30s)

| Check | Tool | Scope | Break? |
| --- | --- | --- | --- |
| Format | Prettier | Staged `*.ts`, `*.css`, `*.html`, `*.md`, `*.yml` | Yes |
| Lint | ESLint | Staged `*.ts` | Yes |
| Secrets scan | gitleaks-lite or `gitleaks protect --staged` | Staged files | Yes |
| Fast unit tests | Vitest (only touching tests for changed files) | Changed-file reverse-deps only | Yes |

Escape hatch: `git commit --no-verify` permitted for genuine emergencies; CI will still block the merge.

### `pre-push` (< 5 min)

| Check | Tool | Scope | Break? |
| --- | --- | --- | --- |
| Full unit + property suite | Vitest + fast-check | All tests | Yes |
| Type-check | `tsc --noEmit` | All `*.ts` | Yes |
| Dependency-cruiser | `depcruise src` | `src/**` | Yes |
| Build dry-run | `vite build` | All | Yes |

Lighthouse / axe-core / bundle-size / network-assertion remain CI-only (too slow for pre-push budget). Developer has `npm run check:all` to run them locally on demand.

## CI job table

### Job 1 — `install`

| Field | Value |
| --- | --- |
| Name | `install` |
| Runs on | `ubuntu-latest` |
| Inputs | Source tree; `package-lock.json` hash |
| Outputs | `node_modules/` cache entry keyed by lockfile hash |
| Tool | `actions/setup-node@v4` + `actions/cache@v4` on `node_modules/` or pnpm store |
| Break condition | `npm ci` non-zero exit |
| Est. duration | ~30–60s cold, ~5s warm (cache hit) |
| Blocks merge? | Yes (transitively — every other job depends on it) |

### Job 2 — `lint-and-typecheck`

| Field | Value |
| --- | --- |
| Name | `lint-and-typecheck` |
| Needs | `install` |
| Inputs | Source tree + `node_modules` |
| Outputs | ESLint report (stdout); `tsc` typecheck result |
| Tool | `eslint .` + `tsc --noEmit` (parallel via `run-p` or two steps) |
| Break condition | Any ESLint error (warnings do not break); any `tsc` error |
| Est. duration | ~30s |
| Blocks merge? | Yes |

### Job 3 — `unit-and-property`

| Field | Value |
| --- | --- |
| Name | `unit-and-property` |
| Needs | `install` |
| Inputs | Source tree + `node_modules` |
| Outputs | Vitest JUnit report (for PR annotation); coverage report |
| Tool | `vitest run --coverage` (with fast-check for property tests — same runner) |
| Break condition | Any failing test; any property counterexample; coverage below threshold (threshold set in DELIVER — Apex recommends core ≥90% line, adapters ≥70% line, whole-repo ≥80%; final number in crafter wave) |
| Est. duration | ~1–2 min |
| Blocks merge? | Yes |

### Job 4 — `dependency-cruiser`

| Field | Value |
| --- | --- |
| Name | `dependency-cruiser` |
| Needs | `install` |
| Inputs | Source tree + `.dependency-cruiser.js` config |
| Outputs | dependency-cruiser report |
| Tool | `depcruise --config .dependency-cruiser.js src` |
| Break condition | `src/core/**` imports from `src/adapters/**` (the named rule from DESIGN constraint #2); any orphan module; any circular dependency |
| Est. duration | ~10s |
| Blocks merge? | Yes |

Config rules (crafter wave writes; shape here for reference — **all three families required**):

```
forbidden: [
  {
    name: 'core-cannot-import-adapters',        // DESIGN constraint #2 — architectural invariant
    severity: 'error',
    from: { path: '^src/core/' },
    to:   { path: '^src/adapters/' }
  },
  {
    name: 'no-circular',                        // maintainability guard on the core
    severity: 'error',
    from: { path: '^src/core/' },
    to:   { circular: true }
  },
  {
    name: 'no-orphans',                         // catch modules disconnected from the graph
    severity: 'error',
    from: {
      orphan: true,
      pathNot: '(^|/)\\.(eslintrc|prettierrc)|\\.d\\.ts$'
    },
    to: {}
  }
]
```

Rationale: the named `core-cannot-import-adapters` rule guards the ports-and-adapters boundary, but without the companion `no-circular` and `no-orphans` rules, orphan adapters or core-internal cycles could be merged undetected and degrade the architecture over time. All three rule families must ship together.

### Job 5 — `build`

| Field | Value |
| --- | --- |
| Name | `build` |
| Needs | `lint-and-typecheck`, `unit-and-property`, `dependency-cruiser` |
| Inputs | Source tree + `node_modules` |
| Outputs | `dist/` directory (static assets); uploaded as workflow artifact `dist-v${{ github.run_id }}` |
| Tool | `vite build` |
| Break condition | Non-zero exit from Vite; missing expected outputs (`dist/index.html`, `dist/assets/*.js`) |
| Est. duration | ~30–60s |
| Blocks merge? | Yes |

### Job 6 — `bundle-size-check`

| Field | Value |
| --- | --- |
| Name | `bundle-size-check` |
| Needs | `build` |
| Inputs | `dist/` artifact |
| Outputs | Gzipped-size report per asset + total (printed to PR check summary) |
| Tool | `size-limit` (preferred — declarative config in `package.json`) or a shell script using `gzip -9 -c | wc -c` on each file and summing |
| Break condition | **Total gzipped size of `dist/**/*.{js,css}` > 50 KB** (51200 bytes); **warn at >45 KB** with a PR comment |
| Est. duration | ~10s |
| Blocks merge? | Yes |

Configuration snippet (crafter wave writes — shape for reference):

```jsonc
// package.json
"size-limit": [
  { "path": "dist/**/*.js",  "limit": "45 KB" },
  { "path": "dist/**/*.css", "limit": "5 KB" },
  { "path": "dist/**/*.{js,css}", "limit": "50 KB", "name": "total-budget" }
]
```

The `"total-budget"` entry is the enforcement gate; the per-type entries exist to surface regressions early (e.g., "JS grew 3 KB because of a new AI helper") so the PR reviewer has shaped feedback, not just a single aggregate number.

### Job 7 — `lighthouse-ci`

| Field | Value |
| --- | --- |
| Name | `lighthouse-ci` |
| Needs | `build` |
| Inputs | `dist/` artifact |
| Outputs | Lighthouse JSON report + trend upload to Lighthouse CI temporary storage |
| Tool | `lhci autorun` (starts `npx serve dist/`, runs 3 Lighthouse iterations on mobile profile, uploads to temporary storage) |
| Break condition | `categories.performance < 0.90`; `categories.accessibility < 0.95`; any assertion in `lighthouserc.json` fails (includes explicit `cumulative-layout-shift ≤ 0.1`, `first-meaningful-paint ≤ 500ms`, `total-byte-weight ≤ 51200`) |
| Est. duration | ~1–2 min |
| Blocks merge? | Yes |

`lighthouserc.json` shape (crafter wave writes):

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3,
      "settings": { "preset": "mobile" }
    },
    "assert": {
      "assertions": {
        "categories:performance":    ["error", { "minScore": 0.90 }],
        "categories:accessibility":  ["error", { "minScore": 0.95 }],
        "cumulative-layout-shift":   ["error", { "maxNumericValue": 0.1 }],
        "first-meaningful-paint":    ["error", { "maxNumericValue": 500 }],
        "total-byte-weight":         ["error", { "maxNumericValue": 51200 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

### Job 8 — `axe-core-a11y`

| Field | Value |
| --- | --- |
| Name | `axe-core-a11y` |
| Needs | `build` |
| Inputs | `dist/` artifact |
| Outputs | axe-core violation report (per state) |
| Tool | Playwright + `@axe-core/playwright`; fixture renders the app and forces it through 4 canonical board states |
| Break condition | **Any violation** at severity `minor` or above on **any of the 4 canonical states: empty, mid-game, won, draw** |
| Est. duration | ~1 min |
| Blocks merge? | Yes |

Test-shape pseudo (crafter wave writes the actual Playwright spec):

```
for state in [empty, midGame, won, draw]:
    await page.goto(`dist/index.html#seed=${state.seed}`)
    // or: mount with a test hook that dispatches a sequence of PLACE_MARK actions
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations).toEqual([])
```

The four canonical states are the same four from the DESIGN testing strategy (`docs/product/architecture/brief.md` §Testing strategy) — re-used, not re-invented. How the adapter layer forces each state (seeded RNG + dispatch script vs URL-hash fixture vs test-only API) is a DELIVER wave decision.

### Job 9 — `network-assertion`

| Field | Value |
| --- | --- |
| Name | `network-assertion` |
| Needs | `build` |
| Inputs | `dist/` artifact |
| Outputs | Network-request log (uploaded on failure for debugging) |
| Tool | Playwright headless; `page.on('request', …)` records; cookie-store enumeration at end |
| Break condition | **Any request to an origin other than the page's own origin during load**; **any `Set-Cookie` received from any response**; **any `document.cookie` set at runtime** (via periodic poll inside the test) |
| Est. duration | ~30s |
| Blocks merge? | Yes |

Test-shape pseudo:

```
const requests = []
page.on('request', r => requests.push(r.url()))
await page.goto(`http://localhost:<serve-port>/index.html`)
await page.waitForLoadState('networkidle')

const origin = new URL(page.url()).origin
const offenders = requests.filter(u => new URL(u).origin !== origin)
expect(offenders).toEqual([])

const cookies = await page.context().cookies()
expect(cookies).toEqual([])
```

### Job 10 — `deploy` (main branch only)

| Field | Value |
| --- | --- |
| Name | `deploy` |
| Needs | `lint-and-typecheck`, `unit-and-property`, `dependency-cruiser`, `build`, `bundle-size-check`, `lighthouse-ci`, `axe-core-a11y`, `network-assertion` (ALL must pass) |
| Guard | `if: github.ref == 'refs/heads/main' && github.event_name == 'push'` |
| Inputs | `dist/` artifact |
| Outputs | Live deployment at the Pages URL |
| Tools | `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v4` |
| Break condition | Any non-2xx from Pages publish; post-deploy smoke fails (see below) |
| Est. duration | ~1–2 min |
| Blocks merge? | N/A (runs post-merge); on failure, the commit on `main` does not get deployed and the next commit retries |

**Post-deploy smoke (part of the deploy job, as a final step):**

```
curl -fsS https://<pages-url>/ -o /dev/null                          # asserts 200
curl -fsI https://<pages-url>/ | grep -iq 'content-type: text/html'   # asserts HTML served
# CSP is a <meta> tag (Pages doesn't set headers), so inspect body:
curl -fsS https://<pages-url>/ | grep -q 'http-equiv="Content-Security-Policy"'
# Build-SHA meta tag matches the commit:
curl -fsS https://<pages-url>/ | grep -q "data-build-sha=\"${GITHUB_SHA}\""
```

Failure of any smoke step flags the deploy as failed but does not automatically roll back (Pages has just published; rollback is `git revert` + next build — see Platform Brief §Incident Response). The job failure surfaces as a red check on the commit in GitHub.

**Smoke-failure escalation policy** (which failure demands which response):

| Smoke check | Failure interpretation | Required response |
| --- | --- | --- |
| `curl -fsS … -o /dev/null` (HTTP 200) | The built asset is broken or Pages did not publish it. | **Mandatory `git revert`** — the new commit is unserviceable. |
| `content-type: text/html` header | Pages served the wrong MIME type; the asset is malformed. | **Mandatory `git revert`.** |
| CSP meta tag present | Security regression — a commit removed or broke the `<meta http-equiv="Content-Security-Policy">` tag. | **Mandatory `git revert`.** |
| `data-build-sha` matches `GITHUB_SHA` | Either the build is wrong (source-of-truth mismatch) or Pages is eventually consistent (CDN propagation lag). | **Investigate first.** Re-run the smoke step after ~2 min. If still mismatched after two retries, `git revert`. |

The first three are deterministic failures indicating a broken deploy; the fourth is the only legitimate flake case. This policy converts post-deploy smoke from advisory-only into a concrete gate the responder can apply without ad-hoc judgement.

## PR gate vs. main-branch gate summary

| Gate | PR (blocks merge) | main push (blocks deploy) |
| --- | --- | --- |
| install | ✓ | ✓ |
| lint-and-typecheck | ✓ | ✓ |
| unit-and-property | ✓ | ✓ |
| dependency-cruiser | ✓ | ✓ |
| build | ✓ | ✓ |
| bundle-size-check | ✓ | ✓ |
| lighthouse-ci | ✓ | ✓ |
| axe-core-a11y | ✓ | ✓ |
| network-assertion | ✓ | ✓ |
| deploy | skipped | ✓ |
| post-deploy smoke | skipped | ✓ (part of deploy job) |

All gates are identical between PR and main pushes — there is no "PR-lite" and "main-strict" asymmetry. Rationale: main branch must always be releasable (GitHub Flow invariant); PR gates must prove that. Asymmetry would create a window where PR-green commits break on main, which violates the branching-strategy contract.

## Caching strategy

| Cache | Key | Restore fallback |
| --- | --- | --- |
| `node_modules/` (or pnpm store) | `${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}` | `${{ runner.os }}-node-` |
| Playwright browsers | `${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}` | `${{ runner.os }}-playwright-` |
| Vite build cache | `${{ runner.os }}-vite-${{ hashFiles('package-lock.json', 'vite.config.*') }}` | `${{ runner.os }}-vite-` |

Cache is best-effort; pipeline must pass cold (no cache) because first-time runs and dependency bumps invalidate.

## Artifact strategy

| Artifact | Produced by | Consumed by | Retention |
| --- | --- | --- | --- |
| `dist-v${{ github.run_id }}` (static build) | `build` | `bundle-size-check`, `lighthouse-ci`, `axe-core-a11y`, `network-assertion`, `deploy` | 7 days |
| `lighthouse-report` (JSON) | `lighthouse-ci` | humans (via run summary) | 7 days |
| `axe-report` (JSON, on failure only) | `axe-core-a11y` | humans | 14 days |
| `sbom.cdx.json` (SBOM) | `build` (as a post-step) | none in v1 (kept for audit) | 90 days |

## DORA target benchmarks (to track forward)

Per `nw-platform-engineering-foundations` skill, track against Accelerate performance levels:

| Metric | v1 target | Realistic measurement |
| --- | --- | --- |
| Deployment frequency | Multiple/day (Elite) when actively developing | Count `main`-push CI runs per week; attainable at solo pace during feature weeks |
| Lead time for changes | ≤1h commit-to-prod (Elite) | PR open → merge → deploy: CI ~5 min + review wait; ≤1h achievable when reviewer is responsive |
| Change failure rate | ≤15% (Elite) | Count `git revert` or follow-up-fix PRs against main-commits; aim <1/20 |
| Time to restore | ≤1h (Elite) | Revert-and-redeploy is ~10 min — Elite by construction |

v1 is solo-paced so these numbers are mostly aspirational. They exist so DELIVER/later waves have a versioned baseline to compare against.

## What the crafter wave must produce

Concrete deliverables owed to DELIVER:

1. `.github/workflows/ci.yml` — YAML translation of the job table above.
2. `.github/dependabot.yml` — weekly dependency-update PRs.
3. `lefthook.yml` (or `.husky/*`) — local hook config.
4. `.dependency-cruiser.js` — with the `core-cannot-import-adapters` rule.
5. `lighthouserc.json` — with the assertion bundle.
6. `size-limit` config in `package.json` (or `.size-limit.json`).
7. Playwright specs: `tests/a11y/axe-canonical-states.spec.ts`, `tests/privacy/network-assertion.spec.ts`.
8. `tests/smoke/post-deploy.spec.ts` or inline bash in the deploy job.
9. HTML shell with CSP meta tag and `data-build-sha` attribute (likely in `index.html` or templated during build).
10. Repo one-time config (Settings → Pages → Source: GitHub Actions; Settings → Branches → Branch protection on `main` with the 8 required checks).

Nothing in this list requires more platform decisions; each item has a prescriptive shape above.

## Open items / forward notes

1. **CodeQL (SAST for JS/TS)** is technically available free on public repos. Not included in v1 because ESLint + `eslint-plugin-security` + small dependency count covers the realistic threat model. Add in v2 if the bundle grows or new adapter types appear (e.g., a service worker).
2. **License compliance** (license-checker) not gated in v1 — every dependency in the DESIGN tech-stack table is already verified permissive. Revisit when the dependency list grows.
3. **Nightly Lighthouse trend run** not scheduled in v1 — every PR is a measurement, and main pushes land at whatever cadence development happens. If measurement cadence needs to be regularized for reporting purposes (e.g., weekly snapshot), add a `schedule: cron` trigger.
