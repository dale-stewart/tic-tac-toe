# Shared Artifacts Registry — tic-tac-toe

**Feature:** tic-tac-toe
**Wave:** DISCUSS
**Scope:** covers all journeys (`journey-solo-player.yaml`, `journey-hot-seat.yaml`)

This registry tracks every `${variable}` used in mockups, scenarios, and user-story AC. Each one must have a single source of truth and documented consumers. Untracked artifacts are the #1 source of horizontal integration failure.

---

## Registry

### `gameMode`

- **Source of truth:** client-side state (SPA has no server)
- **Allowed values:** `"solo-easy"` | `"solo-medium"` | `"solo-perfect"` | `"hot-seat"`
- **Default:** `"solo-medium"`
- **Consumers:**
  - Mode toggle control (reads to render active state)
  - Turn indicator formatter (renders "Your turn" vs "P1's turn")
  - Result banner formatter (renders "AI wins" vs "P2 wins")
  - AI move generator (gated on `gameMode.startsWith("solo-")`)
  - (optional) aggregate counters
- **Owner:** game state module
- **Integration risk:** HIGH — mismatch causes wrong vocabulary or AI firing in hot-seat
- **Validation:** `turnIndicator` and `gameResult` strings must always derive from `gameMode` via a single formatter

---

### `boardState`

- **Source of truth:** client-side state, 3x3 matrix of `"."` | `"X"` | `"O"`
- **Default:** empty grid (nine `"."`)
- **Consumers:**
  - Board cell renderers (one per cell)
  - Win detector (reads full matrix)
  - AI move generator (reads full matrix)
  - ARIA live region (reads delta + announces)
  - Turn indicator derivation (`whoseTurn(boardState, gameMode)`)
- **Owner:** game state module
- **Integration risk:** HIGH — any divergence between cell visuals and state logic is a critical bug
- **Validation:** board cells must render directly from `boardState`, never from an independent cache

---

### `turnIndicator`

- **Source of truth:** derived value — pure function of `(boardState, gameMode, gameResult)`
- **Examples:** `"Your turn (X)."` | `"AI is thinking..."` | `"P1's turn (X)."` | `""` (empty when game ended)
- **Consumers:**
  - Status text under the board
  - ARIA live region announcement (with `aria-live="polite"`)
- **Owner:** game state module (derivation), UI module (display)
- **Integration risk:** HIGH — if visible turn indicator doesn't match who can actually move next, the game is broken
- **Validation:** both consumers MUST pull from the same derivation function, never compute independently

---

### `gameResult`

- **Source of truth:** derived value — pure function of `(boardState, gameMode)`
- **Allowed values:**
  - Solo: `null` (not terminal) | `"You win!"` | `"AI wins."` | `"Draw."`
  - Hot-seat: `null` | `"P1 wins!"` | `"P2 wins!"` | `"Draw."`
- **Consumers:**
  - Result banner text
  - ARIA live region announcement
  - "Play again" button focus trigger (appears/focuses when `gameResult !== null`)
  - Mode toggle re-enable (re-enabled when `gameResult !== null`)
- **Owner:** game state module (derivation), UI module (display)
- **Integration risk:** HIGH — off-by-one in win detector is a common classic bug
- **Validation:** result banner, ARIA, and focus behavior must all read from the same single `gameResult` value

---

### `winningLine`

- **Source of truth:** derived value — array of three `[row, col]` tuples OR `null` if no winning line
- **Consumers:**
  - Win-line animated overlay
  - (optional) screen reader announcement ("X wins along the top row")
- **Owner:** game state module (detection), UI module (overlay)
- **Integration risk:** MEDIUM — visual-only artifact, a mismatch is cosmetic not functional
- **Validation:** must be `null` when `gameResult === null` or `gameResult === "Draw."`; must be a length-3 array otherwise

---

### `initialFocusCell`

- **Source of truth:** hard-coded convention (row 2, col 2 — the center cell)
- **Consumers:**
  - Page load focus setter (for keyboard users)
  - Documentation / help text
- **Owner:** UI module
- **Integration risk:** LOW — affects first-impression keyboard UX but not correctness
- **Validation:** on URL load, the center cell must receive focus if the user's first input is Tab

---

## Cross-Journey Consistency Check

Solo and hot-seat journeys share the ENTIRE artifact set. This is deliberate: one board, one win detector, one state model, only the vocabulary differs by mode.

| Artifact | Solo journey uses | Hot-seat journey uses | Single source? |
|----------|-------------------|-----------------------|----------------|
| `gameMode` | yes (default `solo-medium`) | yes (`hot-seat`) | yes |
| `boardState` | yes | yes | yes |
| `turnIndicator` | yes (`"Your turn (X)."` / `"AI is thinking..."`) | yes (`"P1's turn (X)."` / `"P2's turn (O)."`) | yes (formatter branches on `gameMode`) |
| `gameResult` | yes (`"You win!"` / `"AI wins."` / `"Draw."`) | yes (`"P1 wins!"` / `"P2 wins!"` / `"Draw."`) | yes (formatter branches on `gameMode`) |
| `winningLine` | yes | yes | yes |
| `initialFocusCell` | yes | yes | yes |

---

## Validation Questions (for DESIGN / DISTILL / reviewer)

- [ ] Does every `${variable}` in a mockup appear in this registry?
- [ ] Is every turn indicator string derivable from `(boardState, gameMode)`?
- [ ] Does the result banner wording in `journey-hot-seat.feature` exactly match `gameResult` values listed above?
- [ ] If someone hard-codes a second "whose turn" string somewhere, does this registry make that obvious during review?

---

## Evidence tier

Tier C (practice exercise). The registry is structurally complete; the artifact naming choices are authored, not validated against a real design system. No registry entries are fabricated — all values appear in the mockups or the user stories that follow.
