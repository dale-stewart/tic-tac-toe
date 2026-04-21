# Story Map: tic-tac-toe

**Feature:** tic-tac-toe
**Persona primary:** Casual-Idle-Time Player (solo vs AI)
**Persona secondary:** Hot-Seat Pair (two humans, same device)
**Goal:** Play a satisfying game of tic-tac-toe in under 90 seconds, with zero setup, on any modern browser.
**Evidence tier:** C (illustrative — carried forward from DISCOVER)

---

## Backbone (user activities, left-to-right)

| Arrive | See Board | Pick Mode | Take Turns | End Game | Replay |
|--------|-----------|-----------|------------|----------|--------|

User activities, in chronological order, for BOTH personas (same spine, different mode toggle).

---

## Ribs (tasks per activity, priority descending)

```
Arrive              See Board           Pick Mode            Take Turns             End Game              Replay
-----------------   -----------------   ------------------   -------------------    -------------------   -----------------
Load SPA from URL   Render empty        (default: solo       Place mark (click)     Detect win/           Reset board
                    3x3 grid            medium — no pick     Place mark (keyboard)  loss/draw             
                                        needed)              Invalid-move no-op     Show result banner    
                                                             Turn indicator flip    Highlight win line    
....................................................................  <-- walking skeleton line
Announce via        Render status       Toggle to hot-seat   AI generates move      Announce result via   Preserve mode
ARIA live           text "turn ind"                          (solo only)            ARIA live             across replay
                                                             Disable toggle         Focus Play-again
                                                             mid-game               button
----------------------------------------------------------------------  <-- Release 1 line
Color-blind-safe    Keyboard focus      Difficulty selector  Multi-difficulty AI    Win-line animation    Alternating
palette             on first load       (easy/medium/        (easy random /                               starter
                                        perfect)             medium heuristic /                           (deferred)
                                                             perfect minimax)
----------------------------------------------------------------------  <-- Release 2 line
Analytics           Dark mode           Label-your-name      Undo last move         Share result URL      Streak counter
counter             (deferred)          (deferred)           (deferred)             (deferred)            (deferred)
(aggregate,
no PII)
```

Legend:
- Above skeleton line = Walking Skeleton (shipped first)
- Between skeleton and Release 1 = Release 1 (ships next, makes the core v1 usable)
- Between Release 1 and Release 2 = Release 2 (craft polish completing v1)
- Below Release 2 = backlog / deferred

---

## Walking Skeleton

**Definition:** The thinnest slice that proves "URL -> playable game" works end-to-end.

Tasks in the walking skeleton (one per activity):

1. **Arrive** — SPA loads from URL, HTML+JS reaches interactive state within budget
2. **See Board** — empty 3x3 grid visible with turn indicator "Your turn (X)."
3. **Pick Mode** — implicit default: `solo-easy` (random-move AI). No UI toggle required for the skeleton.
4. **Take Turns** — human click places X; AI picks a random empty cell and places O
5. **End Game** — win / loss / draw detected; banner shows `"You win!"` / `"AI wins."` / `"Draw."`
6. **Replay** — "Play again" clears the board

**Craft hypothesis for walking skeleton:** *"We can ship a deployable, a11y-skeleton-bearing, testable end-to-end slice in one day if we keep scope to a random-move AI and no visual polish. If it takes more than one day, our choice of framework, test harness, or deployment pipeline is too heavy for a toy project."*

This is a **learning-about-the-build** hypothesis, not a learning-about-the-market one. On a toy project, genuine market hypotheses would be forced — see the `prioritization.md` note.

---

## Release 1 — "Meet the v1 scope promise"

**Target outcome:** A player can complete a satisfying game at their chosen difficulty, in either solo or hot-seat mode, with a11y baseline.

**Tasks added on top of walking skeleton:**

- Mode toggle (solo vs hot-seat) as a visible control
- Three AI difficulty levels (easy = random; medium = one-move-ahead heuristic; perfect = minimax)
- Keyboard navigation (arrow keys between cells, Enter to place)
- ARIA live region announcing every state change
- Win-line visual highlight (not animation yet — static overlay is fine for R1)
- "Play again" preserves mode and difficulty
- Mode toggle disabled mid-game

**Outcome KPI trace:** see `outcome-kpis.md` — this release targets "time-to-first-move ≤ 3s median", "game-completion rate ≥ 70%", and "Lighthouse a11y ≥ 95".

**Why R1 and not skeleton:** these behaviors make the game actually usable and honest to the DISCOVER scope. The skeleton proves the pipeline; R1 delivers the promise.

---

## Release 2 — "Craft polish"

**Target outcome:** The game feels considered and thoughtful — delight without manipulation.

**Tasks added on top of R1:**

- Win-line animation (smooth draw, 400ms max)
- Color-blind-safe palette (X and O also distinguishable by shape, not only color)
- Initial-focus on center cell for keyboard users on load
- Subtle status transition animations (turn-indicator crossfade)
- Explicit "no ads, no signup, no tracking" footer with source link

**Outcome KPI trace:** Lighthouse performance ≥ 90, CLS < 0.1, zero regression on R1 KPIs.

---

## Scope Assessment (Elephant Carpaccio Gate)

- **Story count (planned):** 7 stories total (see `user-stories.md`). Well under the 10-story oversized threshold.
- **Bounded contexts:** 1 (single SPA, no backend for v1). Well under the 3-context threshold.
- **Walking skeleton integration points:** 1 (static asset host → browser). Well under the 5-point threshold.
- **Estimated effort:** ~16h engineering for full v1 per DISCOVER H7.

**Scope Assessment: PASS — 7 stories, 1 context, ~2 days estimated (walking skeleton ≤ 1 day; each subsequent slice ≤ 1 day).**

---

## Priority Rationale (summary — full table in `prioritization.md`)

1. **Walking Skeleton first** — derisks the build pipeline. Without an end-to-end working deploy, every later slice is guesswork.
2. **Solo vs AI before hot-seat** — solo is the primary JTBD per DISCOVER; hot-seat is secondary; shared win-detector means hot-seat is cheap once solo works.
3. **Random AI before minimax** — random plays the game; minimax is a polish step behind the curtain.
4. **Keyboard + a11y in Release 1, not Release 2** — WCAG 2.2 AA is a hard baseline per D4, not a nice-to-have.
5. **Visual polish last** — animations, color, focus rings in R2 after core works.
6. **Deferred (not in v1):** networked multiplayer, variants (Ultimate / NxN / misère), accounts, leaderboards, undo/redo, alternating starters.
