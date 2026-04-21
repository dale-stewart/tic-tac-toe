# Lean Canvas — tic-tac-toe

**Phase:** 4 of 4 (Market Viability)
**Status:** Conditional pass (practice exercise, Tier C)
**Date:** 2026-04-21

---

## Practice Exercise Disclaimer

> `[ILLUSTRATIVE — practice exercise; real DISCOVER would populate each box from validated Phase 1-3 evidence and stakeholder review (legal, finance, ops). Monetization and channel numbers are reasoned estimates, not validated economics.]`

---

## The Canvas

| # | Box | Content |
|---|-----|---------|
| 1 | **Problem** | (a) Quick-idle-time needs a friction-free option, (b) Existing free options are ad-heavy or attention-hijacking, (c) "Play with my kid/friend next to me" needs a clean hot-seat mode |
| 2 | **Customer Segments** | (a) Idle-time killers (broadest), (b) Parents teaching young children (4-8), (c) Hobbyists curious about variants (long tail) |
| 3 | **Unique Value Proposition** | "Tic-tac-toe that respects your 90 seconds. No ads. No signup. No tracking. Just the game." |
| 4 | **Solution** | (a) Zero-friction load (board ready in <500ms), (b) Three-tier AI + hot-seat mode, (c) WCAG 2.2 AA accessibility baseline |
| 5 | **Channels** | (a) Organic search (tic-tac-toe is a high-volume keyword), (b) Direct URL word-of-mouth, (c) Open-source repo as a dev-community channel |
| 6 | **Revenue Streams** | (a) None for v1 (free, no ads), (b) Optional "buy me a coffee" donation link in footer, (c) Potential future: white-label embed for education sites |
| 7 | **Cost Structure** | (a) Hosting (static CDN — effectively free at low traffic, ~$5-20/mo at scale), (b) Domain (~$12/yr), (c) One-time dev time (~16h per H7), (d) Ongoing maintenance (~1h/mo) |
| 8 | **Key Metrics** | (a) Games completed per session, (b) Day-1 and day-7 return rate, (c) Time-to-first-move (p50, p95), (d) Lighthouse a11y score, (e) Cost per month |
| 9 | **Unfair Advantage** | None, realistically. TTT is trivial to build; any advantage is aesthetic/craft/trust reputation. If built open-source with demonstrable no-tracking posture, the "trust" positioning is defensible against ad-heavy competitors but not against Google's built-in widget |

---

## 4 Big Risks Assessment

> `[ILLUSTRATIVE]`

| Risk | Question | Status | Notes |
|------|----------|--------|-------|
| **Value** | Will customers want this? | **Yellow** | Problem is real but low-intensity. Differentiation on "no ads" is plausible but unproven in Tier C. Google's free inline widget is a strong substitute. |
| **Usability** | Can customers use this? | **Green** | TTT is the most universally understood game UI there is. A11y is a solved problem at this scope. |
| **Feasibility** | Can we build this? | **Green** | ~16h dev effort. Minimax for 3x3 is textbook. Static hosting. No backend required for v1. |
| **Viability** | Does the business model work? | **Red (honestly)** | No revenue model. Cost is low but non-zero. At zero revenue with non-zero cost, this is a labor-of-love / portfolio piece, not a business. This is the honest answer and it's fine for a personal project; it would be a go/no-go failure for a venture-backed one. |

---

## Unit Economics (back-of-envelope)

> `[ILLUSTRATIVE]`

Assuming free-to-play, no ads, donation-only:

- **CAC:** $0 (organic + word-of-mouth)
- **LTV:** ~$0-0.10 per user (donations are rare and small)
- **Hosting cost per 10k sessions:** < $1 on a static CDN
- **LTV / CAC:** undefined (both near zero) — the metric doesn't meaningfully apply

**Honest conclusion:** this is a zero-revenue, near-zero-cost project. It passes viability **only** if reframed as: "personal portfolio project / methodology practice / open-source contribution." Under that framing, viability is green. Under a "build a business" framing, viability is red.

---

## Channel Validation

> `[ILLUSTRATIVE]`

| Channel | Viable? | Notes |
|---------|---------|-------|
| Organic search | Unlikely to rank | "tic tac toe" SERP is dominated by Google's own widget + massive established sites. New entrant has ~0% chance of top-5 ranking. |
| Direct / word-of-mouth | Viable at small scale | Share-a-URL works well for TTT. |
| Open-source / GitHub | Viable | Dev community can find and discuss a well-built minimal implementation. Positions it as a reference/learning artifact. |
| Paid acquisition | Not viable | No revenue to fund CAC. |
| Social media | Low-effort viable | One-off post, not a sustained channel. |

**Recommendation:** Build for direct-share and open-source positioning. Do not pursue SEO as a primary channel — you cannot beat Google's own widget on a Google search result page.

---

## Stakeholder Sign-off

> `[ILLUSTRATIVE]`

Skipped (solo practice). A real Phase 4 would require:

- **Legal:** privacy policy (even if minimal), cookie-banner requirement check (EU), child-directed-content compliance (COPPA) if targeting under-13s.
- **Finance:** confirm zero-revenue model is acceptable.
- **Ops:** on-call / incident response (N/A for static site).

---

## Go / No-Go Recommendation

**Recommendation: GO, with scope framed as personal / portfolio / practice project.**

Rationale:

1. Feasibility is trivial (green).
2. Usability is well-understood (green).
3. Value is real but low-intensity (yellow) — acceptable for a low-cost build.
4. Viability is red **as a business** but green **as a craft/portfolio artifact**. User has explicitly framed this as the latter.

**Do not proceed** if the implicit framing is "disrupt the casual web-game market" — Phase 1-2 evidence would be insufficient and Phase 4 economics are hostile.

---

## G4 Gate Evaluation

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Lean Canvas complete | All 9 boxes filled | Yes | Pass |
| 4 big risks assessed | All green/yellow | 3 green/yellow, 1 red (viability, honestly) | **Conditional pass** — red is acceptable under portfolio/practice framing |
| Channel validated | 1+ viable | 2+ (direct share, open-source) | Pass |
| Unit economics | LTV > 3x CAC | N/A (both ~0) | Conditional — doesn't apply to zero-revenue framing |
| Stakeholder signoff | Documented | N/A (solo) | Waived |
| Go/no-go documented | Yes | Yes (above) | Pass |

**Gate decision: CONDITIONAL PASS under practice-exercise / portfolio-project framing.**
