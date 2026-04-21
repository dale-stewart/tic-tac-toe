# Outcome KPIs: tic-tac-toe

**Wave:** DISCUSS
**Framing:** Portfolio / craft / methodology-practice project (DISCOVER lean-canvas §4)
**Evidence tier:** C (illustrative — no real-user baselines exist; every "target" is authored, not measured)

KPIs are reframed for a portfolio context. Traditional growth / revenue / engagement KPIs would force invented numbers. Instead, these KPIs target **craft quality** (performance, a11y, privacy) and **functional outcomes** (game completion) that can be measured honestly with static tools and aggregate counters. Per the DISCUSS task brief.

---

## Feature: tic-tac-toe

### Objective

Ship a trivially familiar, friction-free, accessible, privacy-respecting tic-tac-toe web game that a first-time visitor can complete in under 90 seconds, demonstrating craft-level end-to-end execution of the nWave methodology.

### Outcome KPIs

| # | Who | Does What | By How Much | Baseline | Measured By | Type |
|---|-----|-----------|-------------|----------|-------------|------|
| KPI-1 | First-time visitors | Reach an interactive board | Median time-to-first-move ≤ 3s on commodity mobile hardware | 0 (greenfield) | Synthetic Lighthouse runs in CI; optional aggregate client-side Performance API counter (no PII) | Leading |
| KPI-2 | Players who make ≥ 1 move | Reach a terminal state (win/loss/draw) in session | ≥ 70% game-completion rate *(see note ¹)* | 0 (greenfield) | Aggregate counter: games started vs games completed (no per-user tracking) | Leading |

*¹ The 70% target is authored under the practice-exercise framing; it is not calibrated against a comparable-project baseline. On a production effort this threshold would be recalibrated after first usable-prototype user tests. See "Honest caveat" below.*
| KPI-3 | All users including assistive-tech | Pass WCAG 2.2 AA baseline | Lighthouse a11y score ≥ 95; axe-core 0 violations | 0 (greenfield) | Synthetic Lighthouse + axe-core in CI | Leading (quality gate) |
| KPI-4 | All users | Experience responsive performance | Lighthouse performance ≥ 90; FMP ≤ 500ms; CLS ≤ 0.1 | 0 (greenfield) | Lighthouse CI | Leading (quality gate) |
| KPI-5 | All users | Trust the no-tracking claim | 0 server-persisted PII; 0 third-party requests on page load; 0 cookies beyond legal minimum | 0 (greenfield) | Automated network-request assertion; cookie audit; CI link checker on source URL | Guardrail |

### Metric Hierarchy

- **North Star:** KPI-2 (game-completion rate) — the single most direct proxy for "the game is good enough to play through".
- **Leading Indicators:** KPI-1 (time-to-interactive), KPI-3 (a11y), KPI-4 (perf). Each predicts KPI-2.
- **Guardrail Metrics:** KPI-5 (privacy) — must never degrade. Any deploy that introduces a third-party request fails the build.

### Why these KPIs and not engagement / revenue / retention

On a practice / portfolio project, inventing engagement or revenue numbers would be fabrication. These KPIs are **measurable from day 1 using tools that don't require real users**:

- Lighthouse runs in CI — no users needed
- axe-core runs in CI — no users needed
- Aggregate counters of started/completed games do not require PII or login
- Network-request assertion is a static build check

They are honest because they are targets for **how the code is built**, not for **how the market responds**. Real user-behavior KPIs (day-1 return, session length, ad tolerance) are flagged as DEFERRED in DISCOVER H1, H2, H6 and would need real users to validate.

### Measurement Plan

| KPI | Data Source | Collection Method | Frequency | Owner |
|-----|------------|-------------------|-----------|-------|
| KPI-1 (time-to-interactive) | Lighthouse CI | Synthetic run on every PR | Per PR + weekly scheduled | DELIVER wave (CI setup) |
| KPI-2 (completion rate) | Aggregate counter | Privacy-preserving aggregate increment (no cookies, no IPs, no fingerprints); daily total written to a flat log | Daily | DEVOPS wave (if aggregate counter is in scope) |
| KPI-3 (a11y) | Lighthouse + axe-core | CI job | Per PR | DELIVER wave |
| KPI-4 (perf) | Lighthouse | CI job | Per PR | DELIVER wave |
| KPI-5 (privacy) | Automated network-request assertion | Playwright / Puppeteer script in CI | Per PR | DELIVER wave |

### Hypothesis

We believe that a **zero-friction, no-signup, a11y-first tic-tac-toe web app** for **casual web users in short-idle-time contexts** will achieve **≥ 70% session-level game-completion rate with a Lighthouse a11y score ≥ 95 and zero third-party tracking**.

We will know this is true when **KPI-1 through KPI-5 are all met in production**.

We will know this is false (or that the evidence is too thin to conclude) if:
- KPI-2 < 50% (below half-completion suggests something in the build is broken for real users)
- Any a11y or perf KPI regresses after a release

### Guardrails

**Must NOT degrade:**

- KPI-5: any new third-party request fails the build.
- Total JS bundle size: ≤ 50KB gzipped.
- Automated a11y violations: must stay at 0.

**Will NOT be measured (explicitly):**

- Per-user identifiers
- Individual session paths (rationale: honors the "no tracking" UVP from DISCOVER O4)
- Ad click-through (rationale: there are no ads)
- Signup conversion (rationale: there is no signup)

### Cross-references

- Traces to DISCOVER H1 (time-to-first-move), H2 (difficulty drives replay), H5 (a11y baseline), H6 (trust messaging)
- Informs DEVOPS wave: KPI instrumentation requirements (aggregate counter, Lighthouse CI, axe-core CI, network-request assertion)
- Informs DISTILL wave: acceptance tests can assert KPI-3, KPI-4, KPI-5 directly in CI

### Honest caveat

Under a full DISCOVER, KPI targets would be calibrated against user research baselines. Here they are authored reasonable-sounding numbers. A real project would revise all targets after first usable-prototype user tests.
