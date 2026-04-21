# Wave Decisions — tic-tac-toe DISCOVER

**Wave:** DISCOVER (phases 1-4)
**Feature ID:** tic-tac-toe
**Facilitator:** Scout
**Date:** 2026-04-21
**User:** Dale Stewart (dale.stewart@meresoftware.com)

---

## 1. Framing & Exemption

This DISCOVER wave was executed as a **methodology-practice exercise**, not a real product-validation effort. The feature under study — a web-based tic-tac-toe game — is a solved classic with no genuine discovery risk. The user explicitly chose to run a full DISCOVER wave on it to see what the methodology looks like end-to-end, knowing this is an instructional exercise.

### Evidence Tier: C (illustrative, minimal user involvement)

- **Not** Tier A (user-as-interview-subject): the user declined to be interviewed.
- **Not** Tier B (persona role-play): the user declined to role-play personas.
- **Tier C** (chosen): Scout drives the wave using publicly-known, uncontroversial assumptions about casual-game users. Every such section is labeled `[ILLUSTRATIVE — ...]` so the reader can distinguish reasoning from data. No fabricated quotes. No invented interview participants.

### Honest consequence

Standard evidence gates G1-G4 (which strictly require interview data) are recorded as **conditional passes under the practice-exercise exemption**. A real project would not proceed past G1 on the evidence this wave produced.

---

## 2. Scope Decisions

| ID | Decision | Rationale | Status |
|----|----------|-----------|--------|
| D1 | **v1 scope: solo vs AI + hot-seat (same-device) multiplayer. No networked multiplayer in v1.** | Classic 3x3 + AI + hot-seat covers the top-3 opportunities (O1, O2, O4) without backend complexity. Networked MP (A6) is explicitly deferred as nice-to-have. | Scout decision, not pinged to user — fits the "develop a web-based tic-tac-toe" seed and is the lowest-friction MVP |
| D2 | **Variant: classic 3x3 only for v1. Ultimate TTT, NxN, misere deferred.** | O7 scored lowest (6) and serves a narrow hobbyist segment. | Scout decision |
| D3 | **Monetization: none / donation-only.** | Phase 4 viability analysis shows zero viable ad-based model given Google's dominance on the TTT SERP; donation-only is consistent with the "no ads" UVP. | Scout decision |
| D4 | **Accessibility: WCAG 2.2 AA as hard baseline.** | Non-negotiable regardless of opportunity score. Keyboard nav, ARIA live regions, color-blind-safe palette. | Scout decision |
| D5 | **Open-source posture.** | Supports the "trustworthy" UVP (O4) by making "no tracking" claims verifiable. Also supports the only viable channel beyond direct share. | Scout decision |

---

## 3. Gate Results

| Gate | Phase Transition | Criteria | Evidence Tier | Status |
|------|------------------|----------|---------------|--------|
| **G1** | 1 -> 2 | 5+ interviews, >60% confirmation, customer words, 3+ examples | Tier C — no interviews | **Conditional pass** (practice exemption) |
| **G2** | 2 -> 3 | OST complete, top 2-3 scored >8, job-step coverage >=80%, team alignment | Tier C — scores are reasoned priors | **Conditional pass** — structural work sound, scores illustrative |
| **G3** | 3 -> 4 | 5+ users tested, >=80% task completion, core flow validated | Tier C — no user tests | **Conditional pass** — hypotheses well-formed, untested |
| **G4** | 4 -> handoff | Lean Canvas complete, 4 risks acceptable, go/no-go, stakeholder signoff | Tier C — no stakeholder review | **Conditional pass** — viability honestly marked red under "build a business" framing, green under "portfolio project" framing |

### Honesty ledger

Under the standard DISCOVER methodology with full evidence tiers, **all four gates would fail**. They pass here only because:

1. The user has explicitly scoped this as a practice exercise.
2. The feature is a trivially understood, culturally universal game with no meaningful discovery risk.
3. The artifacts produced demonstrate the methodology (shape of the work) without claiming validated evidence.

No one reading these artifacts should treat them as a substitute for real customer research on a non-trivial product.

---

## 4. User Pings During the Wave

**One consideration point, no ping issued.** The solo-vs-networked-multiplayer scope fork (D1) was resolved by Scout in favor of the lower-complexity MVP, consistent with:

- The minimalist framing of the feature seed ("I want to develop a web-based tic-tac-toe game")
- The Phase 2 scoring where networked MP (A6, part of O3) scored 11 vs solo (O1/O2) at 13-14
- The Tier C directive to "keep user interaction to a minimum"

If Dale wants networked multiplayer in scope, this decision can be revisited in DISCUSS or DEFINE.

---

## 5. Handoff Readiness

### What is handing off

A complete DISCOVER artifact set at `/home/dale/Projects/Me/tic-tac-toe/docs/feature/tic-tac-toe/discover/`:

- `problem-validation.md`
- `opportunity-tree.md`
- `solution-testing.md`
- `lean-canvas.md`
- `interview-log.md`
- `wave-decisions.md` (this file)

### What the next wave (DISCUSS / product-owner) should know

1. **Do not treat the illustrative assumptions as validated.** They are reasoned priors, not customer evidence. If product-owner wants to write firm requirements, they should either (a) accept the practice-exercise framing, or (b) commission a minimal validation pass first.
2. **V1 scope is tight:** classic 3x3, solo vs AI (3 levels) + hot-seat, a11y baseline, no ads, no signup, open source.
3. **The honest viability picture:** this is a portfolio / craft project. If anyone starts talking about growth, SEO-driven acquisition, or monetization strategy, re-read the Lean Canvas — those paths are not open.
4. **Key assumptions still untested** (if the next wave wants to do any live validation): A1 (no-signup want), A6 (multiplayer necessity), A7 (ad tolerance). A 2-hour fake-door landing page test could resolve these for <$100 if desired.

### Peer review

Invoked after artifact production. Review feedback and revisions documented below this section once complete.

---

## 6. Peer Review Outcome

**Review Date:** 2026-04-21
**Reviewer:** Beacon (`nw-product-discoverer-reviewer`)
**Verdict:** **APPROVED**

### Strengths

- **Structural rigor across all frameworks.** Problem-validation applies Mom Test methodology; opportunity-tree uses the correct scoring formula (Importance + Max(0, Importance − Satisfaction)); solution-testing deploys the hypothesis template ("We believe [X] for [Y] will [Z]"); lean-canvas fills all 9 boxes coherently; wave-decisions documents each decision with transparent rationale.
- **Honest labeling throughout.** Every illustrative section is tagged `[ILLUSTRATIVE — practice exercise]` with the method that would be used in real discovery specified. Zero fabricated quotes, zero invented personas, zero false claims of evidence. `interview-log.md` explicitly states "no interviews conducted."
- **Tier C framing is transparent.** Section 1 of this document explicitly states this is not Tier A or B evidence, and names the consequence: gates would fail under standard methodology. The practice exemption is not hidden.
- **Internal coherence.** Problem → JTBD → opportunities → solution hypotheses → scope → viability all track consistently. No contradictions detected between artifacts.
- **Go/no-go framing is defensible and caveated.** GO is explicitly conditioned on "personal / portfolio / practice project." Viability risk is honestly marked RED as a business venture under the economic analysis.

### Issues Found

None blocking approval.

**Minor observation (tone only, non-blocking):** In `problem-validation.md` §4, the phrasing around emotional intensity ("we're aware and proceeding anyway") could be softened to "if this were a real business venture, this would be a kill signal" to match the honest-labeling tone of the rest of the artifacts. Not required for approval.

### Required Revisions

None. Artifacts are submission-ready for DISCUSS handoff.

### Notes for DISCUSS (Product-Owner)

1. **Assumptions are reasoned priors, not validated evidence.** Accept the practice-exercise framing, or commission a minimal validation pass (fake-door landing page, ~2h / <$100) to resolve A1 / A6 / A7 first.
2. **V1 scope is locked** per D1–D5: classic 3x3, solo vs AI (3 levels) + hot-seat, WCAG 2.2 AA, no ads/signup/tracking, open source. Networked MP and variants (Ultimate TTT, NxN, misère) deferred. Revisit D1 before DEFINE if demand shifts.
3. **Viability is green for portfolio, red as business.** If stakeholders ask about a business model, the answer is: there isn't one, by design. Document this in any stakeholder-facing materials.
4. **Hypotheses H1–H7 are well-formed but untested.** A ~2-week validation pass (~$1500 if outsourcing user tests) is optional and described in `solution-testing.md` §4.
5. **Natural next-iteration hook:** O3 (networked multiplayer) scored 11 vs O1/O2 at 13–14. If real user feedback surfaces multiplayer demand after v1 ships, D1 is the decision to revisit.

### Handoff Status

**Cleared for DISCUSS handoff** (nw-product-owner). The practice-exercise framing must be carried forward into DISCUSS so the product-owner doesn't treat the illustrative assumptions as harder evidence than they are.
