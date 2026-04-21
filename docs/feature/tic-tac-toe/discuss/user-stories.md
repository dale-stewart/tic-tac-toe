<!-- markdownlint-disable MD024 -->
# User Stories: tic-tac-toe

**Wave:** DISCUSS
**Feature:** tic-tac-toe
**Evidence tier:** C (illustrative, practice exercise — see `docs/feature/tic-tac-toe/discover/wave-decisions.md` §1)

## System Constraints (apply to every story)

- **Platform:** Single-page web application; runs in evergreen browsers (latest 2 versions of Chrome, Firefox, Safari, Edge). Graceful fallback message for older.
- **Accessibility:** WCAG 2.2 AA hard baseline (DISCOVER D4). Keyboard-only operation. ARIA live region. Color-blind-safe palette. Minimum target size 24x24 CSS px (44x44 preferred).
- **Privacy:** No accounts, no signup, no cookies beyond legal minimum, no third-party tracking. No PII ever sent to any server.
- **Monetization:** None for v1 (DISCOVER D3). No ads. Future: optional donation footer link only.
- **Performance budget:** First meaningful paint ≤ 500ms on a 10 Mbps connection. Time-to-interactive ≤ 1s. Bundle size ≤ 50KB gzipped (toy project, no excuse for bloat).
- **Framing:** This is a portfolio / craft / methodology-practice project (DISCOVER lean-canvas §4). Viability is green under that framing, red as a business. Stories reflect craft priority, not growth priority.
- **Illustrative-evidence note:** DoR items relating to customer-validated need are marked `CONDITIONAL PASS` and cite the practice-exercise exemption. See `dor-validation.md`.

---

## US-01: Empty board on load

### Problem

A casual player lands at the URL (from a search result, a shared link, or a bookmark). They expect to see a board and know what to do immediately. If anything blocks that — modal, signup, cookie wall, loading spinner lasting more than a second — they close the tab. DISCOVER H1 pins this to a 500ms budget.

> Evidence: `[ILLUSTRATIVE]` — carried from DISCOVER problem-validation §1, opportunity-tree O1, solution-testing H1.

### Who

- **Casual-Idle-Time Player** — arrives from search or shared URL, has 30-120 seconds, has never heard of this particular app, already knows how tic-tac-toe works from cultural knowledge.
- **Context:** mid-break, mobile or desktop, patience measured in seconds.
- **Motivation:** start playing, now, without reading instructions.

### Solution

Render an empty 3x3 grid and a "Your turn (X)." indicator on first paint. Default to solo vs medium AI. No modals. No onboarding.

### Domain Examples

1. **Happy path — Sam on mobile during bus wait.** Sam clicks a link from a friend at 08:42, sees the board at 08:42.0004 (400ms later), taps the center cell. Default mode: solo vs medium AI.
2. **Edge — Priya on slow 3G.** Priya's connection is 2 Mbps. She sees the board at ~900ms. Still feels fast compared to ad-heavy alternatives. No loading spinner appears (the SPA is below the lightweight budget).
3. **Error boundary — Jae on an ancient browser.** Jae opens the site in IE11 on a library PC. Instead of a broken page, they see a short message: "This game needs a modern browser. Try Firefox, Chrome, Safari, or Edge." The message is keyboard-navigable and the fallback is announced to screen readers.

### UAT Scenarios (BDD)

#### Scenario: Board is ready to play on first paint

```
Given a casual player navigates to the tic-tac-toe URL on an evergreen browser
When the page finishes its first meaningful paint
Then an empty 3x3 board is visible
And the turn indicator reads "Your turn (X)."
And the default mode is "solo vs AI: medium"
And no modal, cookie wall (beyond legal minimum), or signup prompt blocks interaction
And the board is interactive within 500 milliseconds of URL load
```

#### Scenario: The board fits on small mobile viewports

```
Given the player arrives on a 360px-wide mobile device
When the page finishes first paint
Then the 3x3 grid is fully visible without horizontal scrolling
And each cell is at least 44x44 CSS pixels
```

#### Scenario: Fallback for unsupported browsers

```
Given the player's browser lacks a required feature (e.g., ES2020 syntax support)
When the page attempts to load
Then a message reading "This game needs a modern browser. Try Firefox, Chrome, Safari, or Edge." is shown
And the message is announced to assistive technology
And no broken UI is rendered below the message
```

### Acceptance Criteria

- [ ] First meaningful paint shows an empty 3x3 grid
- [ ] Turn indicator "Your turn (X)." is present from first paint
- [ ] Default `gameMode` is `solo-medium`
- [ ] No modal, signup, or cookie banner (beyond legal minimum)
- [ ] Board is interactive within 500ms of URL load on a 10 Mbps connection
- [ ] Grid fits within a 360px viewport with ≥ 44x44 px cells
- [ ] Unsupported browsers see a graceful fallback message

### Outcome KPIs

- **Who:** First-time casual visitors
- **Does what:** Reach an interactive board without dropping off
- **By how much:** ≥ 95% of sessions reach first meaningful paint in ≤ 500ms on median device
- **Measured by:** Client-side Performance API (if privacy-compatible aggregate pings) OR synthetic Lighthouse runs in CI. Baseline: N/A (greenfield)
- **Baseline:** 0% (no build yet)

### Technical Notes

- No routing; single static `index.html`
- No build-time config requires PII
- Constraint: must not ship analytics in v1

---

## US-02: Complete a first game

### Problem

A player wants the satisfaction of actually finishing a game in one sitting — clicking, seeing the opponent respond, and reaching a win / loss / draw with clear closure. DISCOVER Phase 2 opportunity O1 + O2 (time-to-first-move + solo fun).

> Evidence: `[ILLUSTRATIVE]` — reasoned from DISCOVER O1, O2, H1, H2.

### Who

- **Casual-Idle-Time Player** playing solo vs AI.
- **Context:** has the board in front of them (US-01 shipped).
- **Motivation:** the 90-second loop from first click to "Play again".

### Solution

Clicks place X. AI responds with a random empty cell (walking skeleton difficulty). Win / loss / draw detection. Result banner. Keyboard-focused "Play again" button resets the board.

### Domain Examples

1. **Happy path — Sam wins.** Sam places X at center. AI picks top-right O. Sam plays bottom-right X. AI picks top-left O. Sam plays bottom-left X. AI picks middle-right O. Sam plays top-middle X — three X in a column. Banner: "You win!" Play-again button receives focus.
2. **Edge — draw.** Priya and the AI fill the board 5-4 with no line. Banner: "Draw."
3. **Error boundary — Sam clicks a filled cell.** Sam clicks the center (where they already placed X). Nothing changes. Screen reader says "Cell already taken." Sam clicks an empty cell instead.

### UAT Scenarios (BDD)

#### Scenario: Player completes a winning game against the AI

```
Given an empty board in solo vs AI mode (any difficulty)
When the player places X in three cells forming a row, column, or diagonal
Then the winning line is highlighted
And the result banner reads "You win!"
And the "Play again" button receives keyboard focus
And the AI does not place any further mark
```

#### Scenario: Game ends in a draw

```
Given the board has 8 cells filled with no three-in-a-row
When the final mark is placed and no line is completed
Then the result banner reads "Draw."
And the "Play again" button receives keyboard focus
```

#### Scenario: Player loses

```
Given the AI is in a position to complete three O in a row
When the AI takes its next turn
Then the winning line is highlighted
And the result banner reads "AI wins."
And the "Play again" button receives keyboard focus
```

#### Scenario: Clicking a filled cell is a safe no-op

```
Given the center cell contains an X
When the player clicks the center cell again
Then the board state does not change
And a screen reader announces "Cell already taken"
And the turn indicator does not change
```

#### Scenario: Play again resets the board

```
Given the previous game has ended and the result banner is visible
When the player activates "Play again"
Then the board is empty
And the mode is unchanged
And the turn indicator reads "Your turn (X)."
And the result banner is no longer visible
```

### Acceptance Criteria

- [ ] All 8 winning lines (3 rows, 3 columns, 2 diagonals) are detected
- [ ] Draw is detected when board fills with no winner
- [ ] Result banner strings match `gameResult` registry values: `"You win!"` / `"AI wins."` / `"Draw."`
- [ ] Clicking a filled cell is a no-op with a screen-reader announcement
- [ ] "Play again" resets board and result banner, preserves mode
- [ ] AI responds within 300ms of the human's move
- [ ] AI never places on a non-empty cell
- [ ] AI never fires after a terminal state

### Outcome KPIs

- **Who:** Players who made at least one move
- **Does what:** Reach a terminal state (win/loss/draw) in one session
- **By how much:** ≥ 70% game-completion rate (DISCOVER H1 target)
- **Measured by:** Aggregate counter of (games started, games completed) — no per-user tracking
- **Baseline:** 0% (greenfield)

### Technical Notes

- Walking skeleton AI is random; difficulty levels come in US-04
- Win detector is a pure function used by both solo and hot-seat (US-05)
- No server persistence; reload = fresh game

---

## US-03: Keyboard and screen-reader baseline

### Problem

A keyboard-only or assistive-tech user wants to play tic-tac-toe with the same ease as a mouse user. DISCOVER D4 makes WCAG 2.2 AA a hard baseline (non-negotiable).

> Evidence: `[ILLUSTRATIVE]` — DISCOVER A9, H5, D4.

### Who

- **Keyboard-only power user** (e.g., developer, RSI, mobility difference) who navigates the web without a pointing device.
- **Screen-reader user** (e.g., blind or low-vision, using NVDA / JAWS / VoiceOver / TalkBack).

### Solution

Arrow-key navigation on the grid, Enter/Space to place, ARIA live region for every state change, visible focus indicator.

### Domain Examples

1. **Happy path — Alex with NVDA.** Alex tabs into the page, arrow-keys to the center cell, presses Enter. NVDA announces "X placed at row 2, column 2. AI is thinking." Moments later: "O placed at row 1, column 3. Your turn." Alex plays to completion without touching a mouse.
2. **Edge — Dana with a keyboard and visible focus.** Dana is sighted, uses a keyboard for all input. Every focused cell has a 3px outline; focus does not get trapped anywhere; Tab order is predictable.
3. **Error — focus after result.** Alex reaches a terminal state. Focus moves automatically to "Play again". Pressing Enter re-starts. No lost-focus moment where keyboard navigation dead-ends.

### UAT Scenarios (BDD)

#### Scenario: Full game playable with keyboard only

```
Given the player uses only a keyboard
When the player navigates with Tab and arrow keys, places moves with Enter, and reaches a terminal state
Then every cell is reachable via arrow keys
And focus indicators are visible on every interactive element
And the game can be completed without a mouse
```

#### Scenario: Every state change is announced

```
Given a screen reader is active
When any mark is placed (human or AI), or a result is reached, or a no-op occurs (cell already taken)
Then an ARIA live region announcement is made within 1 second
And the announcement includes position or result information
```

#### Scenario: Focus moves to Play-again automatically at terminal state

```
Given the game has just ended
When the result banner appears
Then keyboard focus moves to the "Play again" button
And pressing Enter or Space activates "Play again"
```

#### Scenario: Arrow keys navigate the grid without wrapping

```
Given the top-left cell is focused
When the player presses Left or Up arrow
Then focus remains on the top-left cell
And the arrow press does not scroll the viewport
```

### Acceptance Criteria

- [ ] Arrow keys move focus between cells (bounded, no wrap)
- [ ] Enter or Space on a focused empty cell places a mark
- [ ] Every state change fires an ARIA live-region announcement within 1s
- [ ] Focus indicator visible and passes ≥ 3:1 contrast
- [ ] Tab order: cells in reading order → Play-again (when visible) → mode/difficulty controls
- [ ] Lighthouse a11y score ≥ 95
- [ ] No keyboard traps
- [ ] Automated a11y test (axe-core or equivalent) passes in CI

### Outcome KPIs

- **Who:** Keyboard and assistive-tech users
- **Does what:** Complete a game with keyboard only at parity with mouse users
- **By how much:** ≥ 95% task-completion rate for keyboard-only flows; Lighthouse a11y ≥ 95
- **Measured by:** Synthetic a11y tests in CI; manual keyboard-only smoke test per release
- **Baseline:** N/A (greenfield)

### Technical Notes

- Use semantic HTML (button / grid ARIA pattern) from the start, not retrofitted
- Live region must use `aria-live="polite"`, not `assertive` (assertive interrupts user speech)

---

## US-04: Choose AI difficulty

### Problem

A solo player who wins three times at the default level wants a harder opponent; a player who loses three times wants an easier one. A single difficulty level makes the game boring fast. DISCOVER O2, H2.

> Evidence: `[ILLUSTRATIVE]` — DISCOVER A10 (solved-game frustration), H2 (multi-difficulty drives replay).

### Who

- **Repeat solo player** who has completed at least one game and wants adjustment.
- **New solo player** who wants to pick a level before starting.

### Solution

A three-option control: easy / medium / perfect. Default medium. Disabled mid-game. Three pure AI functions sharing a signature.

### Domain Examples

1. **Happy path — Marcus switches up.** Marcus beats medium twice. After the second win, he uses the difficulty control to switch to "perfect". His next game ends in a draw — he can no longer beat the AI.
2. **Edge — Jae starts on easy.** Jae is playing with their 5-year-old (solo mode so the child drives the human side). They switch to "easy" so the AI occasionally plays suboptimally. The child wins their first game.
3. **Error — trying to change mid-game.** Marcus tries to click "perfect" mid-game. The control is disabled and announced as unavailable by the screen reader. He finishes the current game; the control becomes enabled again.

### UAT Scenarios (BDD)

#### Scenario: Player selects a difficulty between games

```
Given the game is not in progress (no moves played OR terminal state reached)
When the player activates the "perfect" difficulty option
Then subsequent AI moves use minimax
And the selected difficulty is visually indicated
And a screen reader announces "Difficulty: perfect"
```

#### Scenario: Medium AI blocks an immediate three-in-a-row threat

```
Given the human has two X in a row and one empty cell completes that line
And the AI is playing medium difficulty
When the AI takes its turn
Then the AI places O in the blocking cell
```

#### Scenario: Medium AI completes its own winning line when available

```
Given the AI has two O in a row and one empty cell completes that line
And the AI is playing medium difficulty
When the AI takes its turn
Then the AI places O to complete the line
```

#### Scenario: Perfect AI is unbeatable

```
Given the AI is playing perfect difficulty
When 100 randomly-started games are played to completion against the AI
Then the AI wins or draws every game
And the AI never loses
```

#### Scenario: Difficulty control is disabled mid-game

```
Given a game is in progress with at least one move placed
When the player attempts to change difficulty
Then the difficulty control is disabled
And the current game continues without interruption
```

### Acceptance Criteria

- [ ] Difficulty control shows three options: easy / medium / perfect
- [ ] Default is medium
- [ ] Control is keyboard-reachable using the ARIA radio-group pattern
- [ ] Control is disabled mid-game; re-enabled at terminal state
- [ ] **Scope note:** the disable/enable behavior on mode & difficulty controls is introduced in this slice (Slice 04). The walking skeleton (Slice 02) has no mode toggle or difficulty selector; this AC does not apply until Slice 04 ships. The same behavior extends to the hot-seat mode toggle introduced in Slice 05.
- [ ] Selected difficulty persists across "Play again" within the session
- [ ] Easy AI plays any empty cell (random)
- [ ] Medium AI blocks immediate threats and completes its own lines
- [ ] Perfect AI plays minimax and never loses (100-game property test)
- [ ] All three AI functions share signature `(boardState, playerMark) -> [row, col]`

### Outcome KPIs

- **Who:** Solo players who play more than one game per session
- **Does what:** Change difficulty at least once across sessions
- **By how much:** ≥ 25% of repeat-session users switch difficulty at least once (DISCOVER H2-adjacent target; baseline speculation)
- **Measured by:** Aggregate counter of difficulty-change events (no per-user tracking)
- **Baseline:** 0% (greenfield)

### Technical Notes

- Minimax for 3x3 has a bounded state space; perfect AI is textbook (DISCOVER H7)
- No persistence of difficulty across sessions (no cookies, no localStorage with PII)

---

## US-05: Hot-seat pair on one device

### Problem

Two humans next to each other (a parent and child; two friends at a café) want to play a quick game without sharing a device back and forth via URLs or accounts. DISCOVER O3, H4, JTBDs "Teach a young child" and "Brief face-to-face social bond".

> Evidence: `[ILLUSTRATIVE]` — DISCOVER A5 (hot-seat covers two-human needs), H4 (toggle discoverability).

### Who

- **Hot-Seat Pair** — two humans, one device. Could be parent + child, two colleagues, strangers at a bar.
- **Context:** physically co-located; passing a phone or both looking at one screen.
- **Motivation:** a shared 60-120s interaction with clear turn attribution.

### Solution

A mode toggle (segmented control) next to the difficulty selector switches from solo to hot-seat. Turn indicator and result banner change vocabulary accordingly (P1 / P2 instead of You / AI). No AI fires in hot-seat.

### Domain Examples

1. **Happy path — Dale and his nephew Ben.** Dale toggles hot-seat. Dale plays X, Ben plays O. Dale wins. Banner: "P1 wins!" Ben wants a rematch — they hit "Play again" and keep playing.
2. **Edge — discoverability.** A user asked to "play with the person next to you" finds the hot-seat toggle within 30 seconds (DISCOVER H4). The toggle is a segmented control labeled "Solo" / "Hot-seat", visible without scrolling.
3. **Error — accidental toggle mid-game.** Ben tries to switch back to solo mid-game. The toggle is disabled. After the current game ends, the toggle becomes available.

### UAT Scenarios (BDD)

#### Scenario: Switching to hot-seat resets the board when no game is in progress

```
Given the player is in solo mode with no moves played OR a terminal game state
When the player activates the hot-seat toggle
Then the board is empty
And the mode is "hot-seat"
And the turn indicator reads "P1's turn (X)."
```

#### Scenario: P1 places X and turn passes to P2

```
Given hot-seat mode with an empty board
When P1 places X in any empty cell
Then the X appears in that cell within 100 milliseconds
And the turn indicator reads "P2's turn (O)."
And no AI move is triggered
```

#### Scenario: Hot-seat game ends with mode-appropriate banner

```
Given hot-seat mode and a terminal state is reached
When the game ends
Then the result banner reads one of "P1 wins!" / "P2 wins!" / "Draw."
And the "Play again" button receives keyboard focus
And the mode toggle becomes re-enabled
```

#### Scenario: Mode toggle disabled mid-game

```
Given hot-seat mode with at least one move placed
When the player attempts to toggle back to solo
Then the toggle is disabled
And the current game continues
```

#### Scenario: Rematch keeps hot-seat mode

```
Given a hot-seat game has just ended
When the players activate "Play again"
Then the board is empty
And the mode is still "hot-seat"
And the turn indicator reads "P1's turn (X)."
```

### Acceptance Criteria

- [ ] Mode toggle is a keyboard-reachable segmented control ("Solo" / "Hot-seat")
- [ ] Toggling to hot-seat resets the board only when no game is in progress
- [ ] In hot-seat, AI move generator is not invoked
- [ ] In hot-seat, turn indicator uses "P1 / P2" vocabulary
- [ ] In hot-seat, result banner uses "P1 wins! / P2 wins! / Draw." vocabulary
- [ ] Mode toggle is disabled mid-game; re-enabled at terminal state
- [ ] Same win-detector module handles both modes (integration-level invariant)
- [ ] "Play again" in hot-seat mode does not change mode

### Outcome KPIs

- **Who:** Visitors who ever enter hot-seat mode
- **Does what:** Complete at least one hot-seat game per entry into hot-seat mode
- **By how much:** ≥ 70% completion rate (mirror of KPI-2 for hot-seat)
- **Measured by:** Aggregate counter of hot-seat games started vs completed
- **Baseline:** 0% (greenfield)

### Technical Notes

- Depends on US-02 (base game loop) and US-03 (a11y baseline)
- v1 rule: P1 always starts (alternating starters deferred)

---

## US-06: Game feels polished

### Problem

After the core works, the game should feel considered — movements that make sense, palette that works for everyone, animation that communicates rather than distracts. This separates a craft-quality portfolio piece from a functional but forgettable one.

> Evidence: `[ILLUSTRATIVE]` — framing from DISCOVER lean-canvas (portfolio/craft framing) and emotional-design skill (Walter's Hierarchy).

### Who

- **All players** — solo and hot-seat.

### Solution

Win-line animation ≤ 500ms; color-blind-safe palette with shape-distinct X/O; focus-ring contrast ≥ 3:1; reduced-motion fallback.

### Domain Examples

1. **Happy path — Sam sees the win line draw.** After winning, Sam watches a crisp line sweep across the three winning cells in ~400ms. Satisfying; not animated for its own sake.
2. **Edge — Priya with `prefers-reduced-motion`.** Priya has reduced motion enabled in her OS. The winning line appears as a static overlay instantly, not animated. She still sees a clear win indicator.
3. **Edge — Deuteranopic user.** A user with red-green color blindness still easily distinguishes X (diagonal strokes) from O (ring outline); no state information is color-only.

### UAT Scenarios (BDD)

#### Scenario: Winning line animates within 500ms

```
Given a player has just completed a winning line
When the terminal state is reached
Then an animated line draws across the three winning cells within 500 milliseconds
And no layout shift occurs during the animation
```

#### Scenario: Reduced motion is respected

```
Given the user's system has "prefers-reduced-motion: reduce" set
When a winning line appears
Then the line is shown as a static overlay
And no animation plays
```

#### Scenario: X and O are distinguishable without color

```
Given any game state with both X and O marks on the board
When the display is rendered through a protanopia, deuteranopia, or tritanopia filter
Then X and O marks remain distinguishable by shape
```

#### Scenario: No a11y regression after polish

```
Given the app has shipped US-01 through US-05 and now US-06
When Lighthouse audits the a11y score
Then the score is >= 95
And no previously-passing a11y rule fails
```

### Acceptance Criteria

- [ ] Win-line animation completes within 500ms
- [ ] `prefers-reduced-motion: reduce` disables animation (static overlay only)
- [ ] X and O shapes remain distinguishable under color-blind simulation (all three types)
- [ ] Text contrast ≥ 4.5:1, UI-element contrast ≥ 3:1
- [ ] Cumulative Layout Shift ≤ 0.1 during animation
- [ ] Lighthouse a11y ≥ 95 (no regression from US-03)
- [ ] Lighthouse performance ≥ 90

### Outcome KPIs

- **Who:** All players
- **Does what:** Experience terminal-state feedback without visual regression for any user group
- **By how much:** Lighthouse a11y ≥ 95 AND perf ≥ 90; zero color-blind-accessibility failures
- **Measured by:** Synthetic Lighthouse CI + axe-core + manual color-blind filter check
- **Baseline:** N/A

### Technical Notes

- No sound effects (scope creep)
- No dark mode (deferred)
- Depends on US-02 (`winningLine` artifact exists)

---

## US-07: Trust messaging visible

### Problem

Casual web users arriving from ad-heavy alternatives don't trust a free game. They expect a catch. If they don't see the "no ads, no signup, no tracking" claim, the "trust" UVP (DISCOVER O4) isn't actually delivered.

> Evidence: `[ILLUSTRATIVE]` — DISCOVER O4, A7, H6, lean-canvas UVP.

### Who

- **Skeptical casual user** arriving from typical ad-heavy web games or mobile app stores.

### Solution

A compact footer: `"No ads. No signup. No tracking."` with a `[source]` link to the public repo. No additional copy. No pop-up. No toast.

### Domain Examples

1. **Happy path — Priya, burnt by an ad-heavy competitor.** Priya notices the footer line and checks the source link. She bookmarks the site.
2. **Edge — Marcus, totally uninterested.** Marcus ignores the footer entirely. The game still works. The footer is unobtrusive.
3. **Error boundary — repo link dead.** If the public repo URL is wrong (build-time typo), no broken state is created — the link simply 404s. A CI check verifies the URL resolves.

### UAT Scenarios (BDD)

#### Scenario: Trust message is visible on first paint

```
Given the player loads the page on a 1280x800 viewport
When first meaningful paint completes
Then a footer reading "No ads. No signup. No tracking." is visible without scrolling
And a "[source]" link is present and keyboard-focusable
```

#### Scenario: Source link opens the public repository

```
Given the footer is visible
When the player activates the "[source]" link via mouse or keyboard
Then the public repository URL opens in a new tab
And the tab uses rel="noopener noreferrer"
```

#### Scenario: No third-party requests on load

```
Given the player navigates to the URL
When the page loads
Then zero network requests are made to third-party hosts
(static assets are served from the same origin only)
```

### Acceptance Criteria

- [ ] Footer text is exactly `"No ads. No signup. No tracking."`
- [ ] Source link points to the canonical public repository URL (verified in CI)
- [ ] Footer visible above the fold on a 1280x800 viewport
- [ ] Link opens in new tab with `rel="noopener noreferrer"`
- [ ] No third-party network requests on page load (DevTools Network panel + automated assertion)
- [ ] No JavaScript is added to implement this story (pure HTML/CSS)

### Outcome KPIs

- **Who:** All visitors
- **Does what:** Can verify the no-tracking claim is true
- **By how much:** 0 third-party requests on load; 0 server-persisted PII; source link resolves in CI
- **Measured by:** Automated network-request assertion + CI link-checker
- **Baseline:** N/A

### Technical Notes

- This is the only piece of on-page copy that exists specifically for marketing / trust positioning. Keep it tight.
- Open-source repo must be public by release
