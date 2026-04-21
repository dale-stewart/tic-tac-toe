# Slice 05 — Hot-Seat Mode

**Part of:** Release 1 (core v1)
**Estimated effort:** ≤ 0.5 day
**Story:** US-05 Hot-seat pair on one device

## Hypothesis

`[BUILD]` *"Hot-seat reuses the same `boardState` and win detector as solo — adding hot-seat is a vocabulary-and-gating change, not a new game model. If we find ourselves writing a second win detector or a second board state, we're wrong."*

## User-observable outcome

Two humans on one device can now:

- Toggle to hot-seat mode from solo (replaces the difficulty selector)
- See P1/P2 turn indicators instead of You/AI
- Alternate placing X and O without AI firing
- See a P1/P2-worded result banner at game end
- Toggle back to solo between games

## Not in this slice

- No player-naming (deferred backlog)
- No alternating starter — P1 always starts

## Acceptance criteria

- [ ] Mode toggle is a two-option segmented control: "Solo" / "Hot-seat"
- [ ] In hot-seat mode, turn indicator reads "P1's turn (X)." or "P2's turn (O).", never "AI is thinking"
- [ ] In hot-seat mode, the AI move generator is NOT called
- [ ] In hot-seat mode, the result banner reads "P1 wins!" / "P2 wins!" / "Draw."
- [ ] Mode toggle is disabled mid-game; re-enabled at terminal state
- [ ] Switching to hot-seat clears the board only if no game is in progress; otherwise the toggle is disabled
- [ ] Keyboard reachability and a11y baseline (Slice 3) continue to pass in hot-seat
- [ ] Shared win-detector module is the SAME module used by solo mode (integration test asserts single import site)

## Integration points

- `gameMode` formatter now branches on "solo-*" vs "hot-seat" for turn indicator and result banner vocabulary
- Mode-toggle disabled-mid-game rule is shared with difficulty selector (Slice 4)

## Traces to

- Journey: `journey-hot-seat.yaml` Steps 1-5
- Registry artifacts: `gameMode`, `turnIndicator`, `gameResult` (all formatters now branch on mode)
- KPI: KPI-2 (game completion), DISCOVER O3, H4 (hot-seat discoverability)

## Hypothesis is falsified if

- A second win detector gets created for hot-seat
- AI code accidentally fires in hot-seat mode (integration test catches this)
- The mode toggle becomes more than a two-value control
