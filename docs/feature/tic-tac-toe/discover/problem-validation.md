# Problem Validation — tic-tac-toe

**Phase:** 1 of 4 (Problem Validation)
**Status:** Conditional pass (practice exercise, Tier C)
**Date:** 2026-04-21
**Facilitator:** Scout (Product Discovery Facilitator)

---

## Practice Exercise Disclaimer

> `[ILLUSTRATIVE — practice exercise; real DISCOVER would validate via N>=5 Mom Test interviews with casual-game users, parents of young children, and students in bored-commute contexts]`

This is a methodology-practice exercise. No customer interviews were conducted. Every "finding" below is an **illustrative assumption** grounded in publicly known, uncontroversial observations about casual-game users. No quotes are fabricated. Where evidence would normally appear, the source is labeled as `[ILLUSTRATIVE]` so the reader can distinguish reasoning from data.

---

## 1. Problem Statement (in best-guess customer language)

> `[ILLUSTRATIVE]`

"I've got a few minutes of idle time — waiting in line, on a break, killing time with a kid — and I want something trivially familiar I can play without reading instructions, without signing up for anything, and without it trying to keep me engaged longer than I want."

### Restatement (neutral)

Casual web users in short-idle-time windows lack a frictionless, no-signup, no-ad-wall way to play a trivially familiar game for 30-120 seconds. Existing options either (a) demand account creation, (b) push heavy monetization (ads, upsells, dark patterns), or (c) are variants that require learning.

---

## 2. Hypothesized Jobs-to-be-Done

> `[ILLUSTRATIVE — derived from common-sense observation of how tic-tac-toe is used in daily life, not from interview data]`

| JTBD | Context | Desired outcome |
|------|---------|-----------------|
| **Kill 60 seconds** | Solo, mid-task break | Complete a diverting activity with zero setup cost |
| **Teach a young child** | Parent + 4-7 year old | Shared, rule-bounded play that teaches turn-taking and basic strategy |
| **Brief face-to-face social bond** | Two people, same room or same device | Share a playful, low-stakes interaction |
| **Remote social bond** | Two people, different locations | Share the same low-stakes interaction asynchronously or synchronously |
| **Sharpen the game itself** | Hobbyist / puzzle-curious | Explore harder variants (Ultimate TTT, misere, NxN) where the classic game's solved status does not apply |

Primary JTBD for a greenfield build is likely **Kill 60 seconds** (highest frequency, lowest friction requirement). Secondary: **Teach a young child**.

---

## 3. Assumption Tracker

Each assumption is scored on the standard rubric:

- **Impact if wrong** (x3): 1 minor / 2 significant rework / 3 solution fails
- **Uncertainty** (x2): 1 have data / 2 mixed / 3 speculation
- **Ease of testing** (x1): 1 days-cheap / 2 weeks-moderate / 3 months-expensive

Risk score = (Impact x 3) + (Uncertainty x 2) + (Ease x 1). Max 18.

| # | Assumption | Category | Impact | Uncertainty | Ease | Score | Priority | Would-be test |
|---|-----------|----------|--------|-------------|------|-------|----------|---------------|
| A1 | Casual-game users want a no-signup tic-tac-toe | Value | 3 | 2 | 1 | 14 | Test first | Fake-door landing page |
| A2 | Primary JTBD is "kill 60 seconds" not "play a deep game" | Value | 2 | 2 | 1 | 11 | Test soon | Mom Test interviews, session-length telemetry |
| A3 | Classic 3x3 is the preferred variant for casual users (vs Ultimate / NxN) | Value | 2 | 2 | 1 | 11 | Test soon | A/B variant selector, engagement data |
| A4 | AI opponent is table stakes for solo play | Value | 3 | 1 | 1 | 12 | Test first | Prototype with/without AI |
| A5 | Hot-seat (same-device) multiplayer covers most "play with my kid/friend" needs | Value | 2 | 2 | 1 | 11 | Test soon | Interview + prototype |
| A6 | Networked multiplayer is a *nice-to-have*, not a must-have, for v1 | Value | 2 | 3 | 2 | 14 | Test first | Survey, fake-door "play with a friend" button |
| A7 | Users will not tolerate ads on a game this trivial | Viability | 3 | 2 | 2 | 15 | Test first | Pricing / monetization survey |
| A8 | A web (browser) distribution is preferred over native app for this use case | Usability | 1 | 1 | 1 | 6 | Backlog | Channel research |
| A9 | Accessibility (keyboard nav, screen reader, color-blind palette) is expected baseline | Usability | 2 | 1 | 1 | 9 | Test soon | WCAG audit, assistive-tech user test |
| A10 | The solved-game nature of 3x3 TTT will frustrate adult repeat users | Value | 2 | 2 | 1 | 11 | Test soon | Retention cohort analysis |

**Top-3 highest-risk assumptions to test first:** A7 (ad tolerance), A1 (no-signup want), A6 (multiplayer necessity).

---

## 4. Frequency, Spending, Emotional Intensity

> `[ILLUSTRATIVE]`

| Metric | Target for Phase 1 pass | Illustrative position |
|--------|------------------------|-----------------------|
| Problem frequency | Weekly+ | Likely daily for target segment (idle moments are ubiquitous) |
| Current spending | >$0 on workarounds | Likely $0 direct; "cost" is ad exposure and attention hijack on existing free alternatives |
| Emotional intensity | Frustration evident | Mild. This is a low-stakes problem. Frustration shows up as aversion to existing ad-heavy options, not as acute pain |

**Honest note:** emotional intensity is low, which would normally be a *kill* signal in a real DISCOVER. For the practice exercise we proceed anyway, but a real PM should read this as "this is a hobby build, not a venture-scale opportunity."

---

## 5. Competitive / Alternative Landscape

> `[ILLUSTRATIVE — based on common knowledge of the casual-web-game space, not from a systematic review]`

- Generic search-result tic-tac-toe games (Google's inline doodle, countless .io sites)
- Ad-heavy flash-game portals (Poki, CrazyGames-style listings)
- Mobile app-store TTT apps (often monetized with interstitial ads)
- Pen-and-paper (the actual default for the "teach a child" JTBD)
- Physical board games from the toy aisle

The **dominant free alternative** (Google's inline widget when you search "tic tac toe") is already very good. Any new web TTT has to clear a high "why bother" bar.

---

## 6. G1 Gate Evaluation

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| 5+ interviews conducted | >=5 | 0 | **Fail (waived under practice-exercise exemption)** |
| Problem confirmation | >60% | N/A (no interviews) | Conditional |
| Problem in customer words | Yes | Inferred, labeled illustrative | Conditional |
| 3+ concrete examples | Yes | 5 JTBD contexts named, unvalidated | Conditional |

**Gate decision: CONDITIONAL PASS under practice-exercise exemption.** A real project would not proceed to Phase 2 from here. See `wave-decisions.md` for rationale.

---

## 7. What Real Phase 1 Validation Would Require

- 5-8 Mom Test interviews spanning: parents of 4-8 year olds, students, office workers on breaks, older adults who play casual web games, accessibility users
- Questions from the `Problem Discovery` toolkit: "Tell me about the last time you played a quick game on your phone or browser" — focus on past behavior only
- Outputs: verbatim customer quotes, frequency data, competitor-switching stories, commitment signals (intro / follow-up / bookmark)
- Minimum 3/5 consistent confirmation of the "quick, no-signup, no-ads" pain before proceeding
