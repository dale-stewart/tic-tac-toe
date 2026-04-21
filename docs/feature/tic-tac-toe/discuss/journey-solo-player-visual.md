# Journey: Solo Player (vs AI)

**Persona:** Casual-Idle-Time Player (primary archetype, see `docs/feature/tic-tac-toe/discover/problem-validation.md` §2)
**Goal:** Complete a satisfying game of tic-tac-toe vs AI in < 90 seconds, with zero setup.
**Platform:** Web (browser, mobile + desktop)
**Evidence tier:** C (illustrative — carried forward from DISCOVER; see `discover/wave-decisions.md` §1)

> Lightweight per D3: one simple emotional arc, happy-path focus, minimal branching.

---

## Emotional Arc (Discovery Joy)

```
 Curious  --->  Focused  --->  Satisfied
   |             |              |
 "Let's see    "Okay, think    "Nice. One
 what this    — where does    more? Or
 is."         the AI block?"  I'm done."
```

- **Start:** Curious (arrived from search / shared URL / bookmark)
- **Middle:** Focused (playing, reading the board, deciding moves)
- **End:** Satisfied (win, loss, or draw — all three should feel complete)

Emotional transitions are small by design. This is a 90-second interaction; large emotional swings would feel manipulative.

---

## Horizontal Flow

```
[Arrive]  -->  [See board]  -->  [Make move]  -->  [AI responds]  -->  [Repeat]  -->  [Game ends]  -->  [Play again? / leave]
  |              |                |                  |                  |              |                  |
 URL load    Board + turn       Click / tap /      AI marks O         Alternating    Win line or         Focus on
 < 500ms     indicator          keyboard input     within 300ms       X/O until      draw banner,        "Play again",
             visible <          on empty cell                         terminal       "Play again"        ESC or link
             100ms after                                              state          button focused      leaves
             first paint
```

---

## Step-by-step with Mockups

### Step 1 — Arrive & See Board

```
+------------------------------------------------------+
|  tic-tac-toe                     [solo vs AI: medium ▾] [hot-seat] |
|                                                      |
|                +------+------+------+                |
|                |      |      |      |                |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |      |      |                |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |      |      |                |
|                |      |      |      |                |
|                +------+------+------+                |
|                                                      |
|  Your turn (X).                                      |
|                                                      |
|  No ads. No signup. No tracking. [source]            |
+------------------------------------------------------+
```

- Board visible within 500ms of URL load (H1, solution-testing.md)
- Default mode: solo vs medium AI (smart default, no modal)
- Turn indicator: "Your turn (X)." — present from first paint
- `${gameMode}` = "solo vs AI: medium" (shared artifact)
- `${turnIndicator}` = "Your turn (X)." (shared artifact)

**Feels:** Curious → oriented within 2 seconds.

### Step 2 — Make First Move

```
+------------------------------------------------------+
|  tic-tac-toe                     [solo vs AI: medium ▾] [hot-seat] |
|                                                      |
|                +------+------+------+                |
|                |      |      |      |                |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |  X   |      |    <-- human placed X   |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |      |      |                |
|                |      |      |      |                |
|                +------+------+------+                |
|                                                      |
|  AI is thinking...                                   |
+------------------------------------------------------+
```

- Human clicks / taps / presses Enter on focused cell
- Visual placement within 100ms of input
- Turn indicator transitions: "Your turn (X)." → "AI is thinking..."
- ARIA live region announces "X placed at row 2, column 2"

**Feels:** Focused — first commitment made.

### Step 3 — AI Responds

```
+------------------------------------------------------+
|  tic-tac-toe                     [solo vs AI: medium ▾] [hot-seat] |
|                                                      |
|                +------+------+------+                |
|                |      |      |      |                |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |  X   |      |                |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |      |  O   |    <-- AI placed O    |
|                |      |      |      |                |
|                +------+------+------+                |
|                                                      |
|  Your turn (X).                                      |
+------------------------------------------------------+
```

- AI responds within 300ms (feels instant but not jarring)
- ARIA live region: "O placed at row 3, column 3. Your turn."
- `${turnIndicator}` flips back to "Your turn (X)."

**Feels:** Engaged — real opponent presence.

### Step 4 — Game Ends (Win/Loss/Draw)

```
+------------------------------------------------------+
|  tic-tac-toe                     [solo vs AI: medium ▾] [hot-seat] |
|                                                      |
|                +------+------+------+                |
|                |  X===X===X  |      |  <-- win line animated |
|                +------+------+------+                |
|                |      |  X   |      |                |
|                +------+------+------+                |
|                |      |  O   |  O   |                |
|                +------+------+------+                |
|                                                      |
|  You win!                                            |
|                                                      |
|     [ Play again ]     (focused)                     |
+------------------------------------------------------+
```

- Winning line animated (if win); draw shows "Draw."; loss shows "AI wins."
- `${gameResult}` = "You win!" | "AI wins." | "Draw."
- "Play again" button auto-focused (keyboard-ready)
- ARIA live region announces the result

**Feels:** Satisfied — clean closure.

### Step 5 — Play Again / Leave

- Clicking / pressing Enter on "Play again" resets board, keeps mode & difficulty
- Board re-renders within 100ms
- Alternating who starts? v1 picks: human always starts as X (simplest mental model; see `user-stories.md` US-05 tech notes)

**Feels:** Satisfied → back to Curious for the next round, or closed tab without regret.

---

## Shared Artifacts (tracked in `shared-artifacts-registry.md`)

- `${gameMode}` — solo vs AI difficulty OR hot-seat
- `${turnIndicator}` — whose turn, human-readable
- `${boardState}` — 3x3 cell grid (`.` | `X` | `O`)
- `${gameResult}` — win / loss / draw text

---

## Error & Recovery Paths (lightweight)

| Error | What user sees | Recovery |
|-------|----------------|----------|
| Click on already-filled cell | No placement; gentle shake or no-op; ARIA announces "cell already taken" | No action needed; user tries another cell |
| Page reload mid-game | Board state is lost (v1 accepts this; no server persistence) | Fresh board, same default mode. Acceptable per "no tracking" UVP |
| Unsupported browser feature (e.g. ancient IE) | Static fallback message explains browser too old | User opens in any modern browser |

Error paths are intentionally minimal for a 90-second solo game.

---

## Integration Checkpoints (for DISTILL)

- Board state must be authoritative — turn indicator, win detection, AI move must all read from the same `${boardState}` source
- After any move, all of: board visual, turn indicator, ARIA live region must update in the same frame
- AI responds if and only if game is not terminal AND it is AI's turn — must not fire after a human-winning move

See `journey-solo-player.yaml` for the structured integration_validation block.
