# ADR-0006: KPI-2 aggregate counter disposition — defer to v2

## Status

Accepted — 2026-04-21

## Context

KPI-2 from `docs/feature/tic-tac-toe/discuss/outcome-kpis.md` targets a **≥ 70% game-completion rate** among players who make at least one move. Its stated measurement is: *"Aggregate counter: games started vs games completed (no per-user tracking)."* ADR-0004 sketches a compatible endpoint shape — single stateless endpoint, anonymous timing samples only, no per-session IDs, no cookies, no IP logging.

The DESIGN peer-review note to DEVOPS was explicit: *"KPI-2 aggregate counter (if implemented): ADR-0004 specifies shape — single stateless endpoint, anonymous timing samples only, no per-session IDs / cookies / IP logging. DEVOPS picks runtime (Cloudflare Worker / Netlify Function). **Shipping v1 without instrumentation is acceptable.**"* (emphasis added)

The DISCUSS product-owner review note was similarly explicit: *"Aggregate counter design (if implemented): flat-file daily totals, no cookies, no IPs, no fingerprints. **Acceptable to ship v1 without KPI-2 instrumentation if judged over-engineering.**"*

So the question before DEVOPS is: **ship the counter with v1, or defer?**

### Inputs to the decision

- **Traffic expectation.** Portfolio project, no marketing, no SEO push. Plausible traffic in the first month: < 100 total visitors, most of whom are Dale, the author, and reviewers. A completion-rate measurement on < 100 sessions is statistically almost useless — the noise floor is higher than the signal.
- **Privacy posture.** KPI-5 is a hard guardrail ("zero third-party requests on load"). A counter endpoint, even if first-party, adds a `connect-src` target and exposes one more line of code to scrutiny per every subsequent CSP review. Every byte of counter infrastructure is new attack surface and new cognitive load.
- **Cost.** A Cloudflare Worker on the free tier is $0. The cost is not financial — it is attention.
- **Methodology honesty.** DISCOVER Tier-C framing is carried forward: every measured number is illustrative until real users exist. A 70% target with < 100 observed sessions is indistinguishable from "we made the number up." Deferring the counter until real users exist aligns the instrumentation shape to the actual state of evidence.
- **Effort.** Even a minimal Worker implementation costs ~2-4 hours plus ongoing low-level maintenance (re-check the endpoint quarterly, validate the aggregation file isn't growing unbounded, re-audit that no IPs are leaking into logs). That time is better spent on craft dimensions already measurable pre-users: bundle size, a11y, perf.

## Decision

**Defer KPI-2 aggregate-counter instrumentation from v1.** Ship the SPA without any `connect-src` target; KPI-2 remains formally specified but uninstrumented.

### Explicit consequences of deferring

- v1 cannot report an empirical game-completion rate. The KPI stays on the books as a target, but the measurement-plan row for KPI-2 is marked **deferred** in `docs/product/platform/brief.md` §KPI Instrumentation Map.
- No `connect-src` in the CSP. All five `src-`-family CSP directives are `'self'` or `'none'`. Network-assertion gate can be stricter: "zero non-self requests on load" remains a hard pass.
- No Worker or Function to provision, monitor, update, or decommission.
- If a stakeholder later wants the number, there is a clean resurrection path (below).

### Resurrection trigger

KPI-2 instrumentation will be revisited when **any** of the following becomes true:

1. **Real traffic exceeds ~500 unique visits/month** over a rolling 30-day window, as evidenced by GitHub Pages traffic analytics (first-party, aggregate, no user-level data — already free and already permitted).
2. **A stakeholder commissions a completion-rate study** (even informal — e.g., Dale decides he wants the number for a blog post).
3. **The project pivots out of portfolio framing** (e.g., acquires real users through deliberate promotion, or moves toward a production product). This is a DISCOVER-level pivot that would retrigger the whole wave chain, but is listed here for completeness.

When any trigger fires, a DEVOPS mini-wave revisits this ADR, selects a runtime per ADR-0004 shape constraints (Cloudflare Worker is the natural choice given ADR-0005 host selection — Worker is same-vendor-agnostic and same-free-tier model), and updates the platform brief and CI pipeline to include the endpoint plus a `connect-src` CSP entry.

### Future shape (for reference, not for v1 implementation)

Documented here so the resurrection is low-friction:

- **Transport:** HTTPS POST to `/metrics/session`.
- **Payload:** `{ "started": boolean, "completed": boolean, "result": "x_wins" | "o_wins" | "draw" | null }` — no timestamps, no session IDs, no referrer, no user-agent relay, no IP retention.
- **Storage:** Daily aggregate counters in a single flat file or KV-store cell — `{ "YYYY-MM-DD": { started: N, completed: M, x_wins: …, o_wins: …, draw: … } }`.
- **Retention:** 90 days rolling, then aggregated to monthly totals.
- **Server-side code:** ~30 lines. No external dependencies. No logging of request metadata.
- **CSP update:** add `connect-src 'self' https://<worker-domain>` (or whichever endpoint host).
- **Client-side code:** a single `fetch('/metrics/session', { method: 'POST', body: … })` in the reducer's "game started" and "game ended" paths, wrapped in `try { … } catch { /* swallow */ }` so network failures never affect gameplay.
- **Build flag:** opt-in via `VITE_ENABLE_METRICS=1`; disabled by default. Matches the ADR-0004 "disabled by default; opt-in via a build flag" requirement.

Nothing above is implemented in v1. It exists here so that the resurrection path is a specification-check rather than a re-design.

## Consequences

### Positive

- **Simpler v1.** No new vendor, no new endpoint, no new CSP directive, no new monitoring responsibility.
- **Stronger privacy posture for v1.** Zero outbound connections after asset load. The marketing claim "No ads. No signup. No tracking." (from DISCOVER O4 / user-story US-07) is literally true, not approximately true.
- **Aligns measurement cadence to evidence availability.** Tier-C framing means no real-user numbers are expected anyway; leaving the field blank is more honest than publishing a number built from 20 data points.
- **Lower cognitive load.** Every quarter, KPI-2 instrumentation would want re-auditing: is the flat file rotating? Any IPs leaking into logs? Any cookie quietly appearing via Cloudflare's default behaviour? Deferring removes all that recurring work.

### Negative

- **No ability to empirically validate the 70% completion-rate hypothesis in v1.** This is the intended tradeoff — the hypothesis remains unfalsified in either direction, and the practice-exercise framing explicitly permits this.
- **If KPI-2 is resurrected later, adding it requires a small ADR revision cycle (ADR-0006 status change, platform brief update, CI pipeline update).** Small surface, but non-zero.

## Alternatives considered

### Alternative A — Ship counter in v1 on Cloudflare Worker

- **What:** Build the ~30-line Worker per the "Future shape" section; wire a CSP `connect-src` entry; emit a POST on game start and game end.
- **Pros:** Data from day one; can report an actual completion-rate number after any meaningful traffic.
- **Cons:** Traffic in month 1 is ~unanalyzable; introduces a second vendor (Cloudflare — contra ADR-0005's "zero additional vendor surface"); adds CSP complexity; adds quarterly-audit responsibility; does not meaningfully advance any v1 KPI other than KPI-2 itself, which stakeholders have explicitly marked as OK-to-skip.
- **Rejected because:** all the cost, none of the value at current traffic scale.

### Alternative B — Ship counter in v1 on a GitHub Actions scheduled ping (no live endpoint)

- **What:** Instead of a live endpoint, emit a client-side counter to `localStorage` and have a scheduled GitHub Action scrape it... — this quickly collapses: there is no mechanism to collect `localStorage` from real visitors without a live endpoint.
- **Rejected because:** technically infeasible — the scraping pattern implies a live endpoint, which is Alternative A.

### Alternative C — Ship counter in v1 using a third-party analytics SaaS (Plausible, Simple Analytics, etc.)

- **What:** Add a script from a privacy-respecting analytics provider.
- **Rejected because:** violates KPI-5 hard guardrail (zero third-party requests on load). Non-negotiable.

### Alternative D — Ship v1 with GitHub Pages traffic analytics only

- **What:** Do nothing new; rely on GitHub's built-in repo-traffic views (page visits, unique visitors, referrers). These are first-party, aggregate, no user-level data, and always-on.
- **Pros:** Zero additional work; already free; zero privacy impact.
- **Cons:** Measures page-visit, not game-completion. Cannot compute a completion rate.
- **Relationship to decision:** this is effectively what deferring means in practice — page-level traffic is visible, session-level game outcome is not. The current decision accepts this.

## Cross-references

- Parent: `adr-0004-static-hosting-zero-backend.md` (specifies the endpoint shape if implemented).
- Sibling: `adr-0005-static-host-selection.md` (host choice is independent of this decision).
- Source KPI: `docs/feature/tic-tac-toe/discuss/outcome-kpis.md` §KPI-2.
- Platform brief: `docs/product/platform/brief.md` §KPI Instrumentation Map (reflects deferred status).
- DISCUSS guidance: `docs/feature/tic-tac-toe/discuss/wave-decisions.md` §Notes for DEVOPS item 3.
- DESIGN guidance: `docs/feature/tic-tac-toe/design/wave-decisions.md` §Notes for DEVOPS item 2.
