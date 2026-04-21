# Journey: Hot-Seat Pair (Two Humans, Same Device)

**Persona:** Hot-Seat Pair (secondary archetype — see `discover/problem-validation.md` §2, JTBDs "Teach a young child" and "Brief face-to-face social bond")
**Goal:** Two humans alternate turns on the same device with zero setup, experiencing a shared 60-120s interaction.
**Platform:** Web (browser, same device)
**Evidence tier:** C (illustrative — carried forward from DISCOVER)

> Lightweight per D3: one simple emotional arc, happy path focus.

---

## Emotional Arc (Shared Playfulness)

```
 Curious  --->  Alternating focus  --->  Shared closure
   |              |                        |
 "Let's         "Your turn."              "You won — again.
  play."        "No, yours!"               Rematch?"
```

Two emotional arcs share one device. The key shift from solo is **attribution clarity**: at any moment, both players must instantly know whose turn it is, or the interaction breaks.

---

## Horizontal Flow

```
[Arrive]  -->  [Toggle hot-seat]  -->  [P1 moves]  -->  [P2 moves]  -->  [Repeat]  -->  [Game ends]  -->  [Play again?]
  |              |                     |               |                |              |                  |
 Solo-vs-AI    One click, mode       P1 places X    P2 places O      Alternating    Win line or         Same mode
 default       toggles to            on empty cell  on empty cell    X/O until      draw,               preserved;
               "hot-seat"; P1        Turn ind:      Turn ind:        terminal.      banner says         new game
               is X, P2 is O         "P2's turn     "P1's turn       Both players   "P1 wins!" /        begins.
                                     (O)."          (X)."            can see        "P2 wins!" /
                                                                     attribution    "Draw."
```

---

## Step-by-step with Mockups

### Step 1 — Arrive & Toggle to Hot-Seat

```
+------------------------------------------------------+
|  tic-tac-toe         [solo vs AI: medium] [HOT-SEAT ●] |
|                                                      |
|                +------+------+------+                |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |      |      |                |
|                +------+------+------+                |
|                                                      |
|  P1's turn (X).                                      |
+------------------------------------------------------+
```

- Mode toggle: segmented control, hot-seat selected (filled dot signifies active)
- `${gameMode}` = "hot-seat"
- `${turnIndicator}` = "P1's turn (X)."
- Optional (deferred): let players label themselves ("Dale's turn (X).") — v1 uses P1/P2

**Feels:** Both players curious, one leans forward.

### Step 2 — P1 Moves (X)

```
+------------------------------------------------------+
|                +------+------+------+                |
|                |      |      |      |                |
|                +------+------+------+                |
|                |      |  X   |      |                |
|                +------+------+------+                |
|                |      |      |      |                |
|                +------+------+------+                |
|                                                      |
|  P2's turn (O).                                      |
+------------------------------------------------------+
```

- P1 clicks/taps/keyboards a move
- Turn indicator immediately flips to "P2's turn (O)."
- No "AI thinking" state — the indicator is the entire handoff signal

**Feels:** P1 focused, P2 shifts attention forward.

### Step 3 — P2 Moves (O)

Same pattern, mirror.

### Step 4 — Game Ends

```
+------------------------------------------------------+
|                +===+===+===+                         |
|                | X = X = X |  <-- P1 wins            |
|                +===+===+===+                         |
|                |   | O | O |                         |
|                +---+---+---+                         |
|                |   |   | O |                         |
|                +---+---+---+                         |
|                                                      |
|  P1 wins!                                            |
|                                                      |
|     [ Play again ]  (focused)                        |
+------------------------------------------------------+
```

- `${gameResult}` = "P1 wins!" | "P2 wins!" | "Draw."
- Both players see the same banner; no asymmetric feedback

**Feels:** Shared closure — even the loser sees the same ending simultaneously.

### Step 5 — Play Again (alternating starter?)

- v1 decision: **P1 always starts as X** (simplest mental model, matches solo-vs-AI)
- Alternating starters can be added in v2 if usability testing shows it matters

**Feels:** Cycle or stop.

---

## Shared Artifacts (see `shared-artifacts-registry.md`)

- `${gameMode}` — hot-seat vs solo
- `${turnIndicator}` — "P1's turn (X)." / "P2's turn (O)."
- `${boardState}` — 3x3 grid
- `${gameResult}` — "P1 wins!" / "P2 wins!" / "Draw."

---

## Error & Recovery Paths

| Error | What user sees | Recovery |
|-------|----------------|----------|
| Click on filled cell | No placement; ARIA "cell already taken"; turn does NOT change | Current player tries another cell |
| Accidental toggle to solo mid-game | Mode switch is discarded mid-game, OR prompts "Abandon current game?" | v1 choice: toggle is disabled mid-game (simpler); re-enable after game ends |
| Page reload | Same as solo — state lost (v1 accepts); bring-back expectations are low | Fresh board |

---

## Integration Checkpoints

- Turn indicator MUST update in the same frame as the mark appears. If they desync, the next player may not know it's their turn.
- Hot-seat and solo share the same `${boardState}` and `${gameResult}` contracts — one win detector, not two.
- Mode toggle disabled while a game is in progress.

See `journey-hot-seat.yaml` for structured validation.
