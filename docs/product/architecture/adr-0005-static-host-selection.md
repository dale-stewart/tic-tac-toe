# ADR-0005: Static host selection — GitHub Pages

## Status

Accepted — 2026-04-21

## Context

ADR-0004 established that the tic-tac-toe SPA ships as pure static assets with zero runtime backend, and listed three acceptable hosts in preference order: GitHub Pages, Cloudflare Pages, Netlify. Final selection was explicitly deferred to the DEVOPS wave.

The project is:

- A greenfield solo portfolio build (`docs/feature/tic-tac-toe/discover/wave-decisions.md` §1).
- Already resident in a GitHub repository (`git status` at wave start confirms `main` branch, clean, GitHub-hosted origin implied by project context).
- Constrained to $0/month running cost (`docs/feature/tic-tac-toe/discuss/outcome-kpis.md` — no monetization; DISCOVER D3).
- Subject to KPI-5: zero third-party requests, no cookies, no PII — so the host must deliver pure static assets over HTTPS without injecting its own scripts, tags, or tracking.
- Unlikely to need serverless functions in v1 (KPI-2 counter deferred; see ADR-0006).
- Expected to have trivial traffic — a portfolio-visitor volume, not a production-product volume.

The DESIGN reviewer's handoff note to DEVOPS was explicit: *"Static host preference order (per ADR-0004): GitHub Pages / Cloudflare Pages / Netlify. No technical blocker for any; pick on cost and familiarity."* The present ADR converts that permission into a concrete selection.

## Decision

**Deploy to GitHub Pages** via `actions/deploy-pages` as part of the same GitHub Actions workflow that runs the CI gates on `main` push.

### Configuration

- **Source:** "GitHub Actions" (modern Pages deployment model, not the legacy `gh-pages` branch model — avoids a second branch to maintain).
- **URL:** the default `<user>.github.io/tic-tac-toe` (no custom domain in v1).
- **HTTPS:** enforced (Pages default; non-optional on `*.github.io`).
- **Build source:** `dist/` directory emitted by Vite in the `build` CI job.

### Security headers

GitHub Pages does **not** permit customising response headers (no `_headers` file, no edge config). This is a known limitation and the reason Cloudflare Pages and Netlify were considered. For the current threat model — a static SPA with no authenticated state and no form submissions — the consequences are absorbed as follows:

| Header | Pages supports? | Workaround |
| --- | --- | --- |
| `Content-Security-Policy` | No (as HTTP header) | Set via `<meta http-equiv="Content-Security-Policy" …>` in the HTML shell. Equivalent for script/style blocking, inferior for `frame-ancestors` (meta-tag CSP ignores this directive per spec — acceptable since we also set `frame-ancestors 'none'` and verify via user-agent behaviour; if clickjacking risk rises, revisit). |
| `Strict-Transport-Security` | Pages sets it automatically on `*.github.io` | Accepted vendor-managed default |
| `X-Content-Type-Options` | Pages sets `nosniff` automatically | Accepted vendor-managed default |
| `Referrer-Policy` | Not set by default | Set via `<meta name="referrer" content="no-referrer">` in HTML shell |

This is the single real tradeoff vs. Cloudflare Pages / Netlify. For a static SPA with no inputs beyond click/keyboard on a 3x3 grid, it is an acceptable tradeoff.

## Consequences

### Positive

- **Zero additional vendor surface.** Repo, CI, and host are all GitHub. One account, one auth model, one status page, one support channel. No cross-vendor credential plumbing.
- **Zero config overhead.** `actions/deploy-pages` is declarative and first-party; Pages source = "GitHub Actions" is a single click in repo settings.
- **$0/month at expected traffic.** Free tier: public repos get unlimited Pages bandwidth (soft 100GB/mo cap) and 2000 Actions minutes/mo — both vastly above this project's expected use.
- **Trivially auditable deployment.** The deployed commit SHA appears in the Pages UI, matches the GitHub Actions run metadata, and is referenced in-page via a `data-build-sha` meta attribute (see `ci-pipeline.md` post-deploy smoke step).
- **Ported easily.** The artifact is `dist/index.html` + `dist/assets/*`. Switching to Cloudflare Pages or Netlify requires swapping the `deploy-pages` action for the respective vendor's upload action — a ~10 minute change, no application-code impact.

### Negative

- **No custom HTTP response headers.** CSP is applied via `<meta>` tag, which is spec-equivalent for the directives we actually need (`default-src`, `script-src`, `style-src`, `connect-src`, `img-src`, `base-uri`) but spec-deficient for `frame-ancestors` and `report-uri`. Mitigations are in the security-posture table of the platform brief.
- **No edge functions.** If the KPI-2 counter is later adopted (ADR-0006), it must run on a different host. Cloudflare Workers is the natural fit since they're vendor-native and usable cross-origin. This is not a v1 concern.
- **No per-PR preview URLs out of the box.** Addressed in the platform brief §PR preview deployments: accepted tradeoff for v1; Cloudflare Pages sidecar is the easy upgrade path if demand appears.
- **Vendor lock-in on `*.github.io` URL for v1.** Custom domain is straightforward later (CNAME file + DNS); not a migration concern.

## Alternatives considered

### Alternative A — Cloudflare Pages

- **What:** Deploy `dist/` to Cloudflare Pages via the wrangler CLI in CI; use Cloudflare's edge for HTTPS, global CDN, and Worker sidecar availability.
- **Pros:** First-class custom response headers (`_headers` file); Workers sit natively if KPI-2 counter is adopted; per-PR preview URLs native; global anycast CDN (marginally faster in some geos).
- **Cons:** Introduces a second vendor (account, auth, status page); requires committing Cloudflare API token as a repo secret (new secret to manage); one more system to understand and debug; no material benefit over Pages at expected traffic volume.
- **Rejected because:** the header-customization advantage is real but not earned by any current requirement — `<meta>` CSP is adequate for the threat model. The Workers advantage is conditional on KPI-2 adoption, which is deferred. The cons (extra vendor, extra secret, more to understand) are immediate and real. Net: added complexity with no earned benefit.

### Alternative B — Netlify

- **What:** Deploy `dist/` via Netlify CLI or GitHub integration; use Netlify's edge.
- **Pros:** First-class custom response headers (`_headers` file); built-in per-PR previews ("Deploy Previews"); Functions available if KPI-2 counter is adopted.
- **Cons:** Same as Cloudflare Pages re. second vendor; also a slightly tighter free-tier bandwidth cap (100GB/mo hard vs. Pages' soft cap); Netlify Functions have more aggressive free-tier execution caps than Cloudflare Workers.
- **Rejected because:** same reasoning as Cloudflare Pages — no earned advantage, measurable added complexity. Between Alternatives A and B, Cloudflare is the better upgrade target for the Worker shape, so Netlify is the least-justified option.

### Alternative C — Self-hosted VPS (e.g., DigitalOcean, Hetzner) behind nginx

- **What:** Rent a small VPS, install nginx, rsync `dist/` on deploy.
- **Pros:** Complete control over headers and deployment model.
- **Cons:** Monthly cost; patching and uptime responsibility; attack-surface expansion; DNS, TLS cert, log retention, firewall — all to be owned personally.
- **Rejected because:** radical overkill for a static SPA. Violates the ADR-0004 posture "zero operational burden" at the first step.

### Alternative D — Defer the choice; ship nothing until KPI-2 decision is made

- **What:** Keep the design-wave deferment in place; do not commit to a host until the KPI-2 shape is locked.
- **Cons:** Blocks DELIVER wave for no reason — the host choice doesn't depend on KPI-2. If KPI-2 is later adopted on a different host, it can be hosted separately from the SPA.
- **Rejected because:** the design-wave deferment was explicitly to let DEVOPS pick on cost and familiarity; KPI-2 disposition is an independent decision (ADR-0006); conflating them would delay v1.

## Cross-references

- Parent decision: `adr-0004-static-hosting-zero-backend.md`.
- Related: `adr-0006-kpi-2-aggregate-counter-disposition.md` (deferred counter; independent of host choice).
- Related: `adr-0007-ci-gates.md` (deploy job wiring).
- Implementation spec: `docs/product/platform/ci-pipeline.md` §Job 10 (`deploy`).
- Platform brief: `docs/product/platform/brief.md` §Delivery Platform.
