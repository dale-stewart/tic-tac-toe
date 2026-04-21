# Slice 02 — Accept One Move and Random AI

**Part of:** Walking Skeleton
**Estimated effort:** ≤ 4h
**Story:** US-02 Complete a first game

## Hypothesis

`[BUILD]` *"We can turn the grid into a playable game with a random-move AI, win detection, and a Play-again reset, in half a day. If not, our test / state model is too heavy for the problem."*

## User-observable outcome

A player who loaded the board (Slice 1) can now:

- Click a cell to place X
- See the AI place an O within 300ms
- Continue alternating until win / loss / draw
- See a result banner and a focused "Play again" button
- Press Play again to start over

## Not in this slice

- No difficulty choice (AI is always random)
- No mode toggle visible (hot-seat and difficulty selectors come later)
- No keyboard-input for moves yet (mouse/tap only — keyboard is Slice 3)
- No animation on win line (static highlight only)

## Acceptance criteria

- [ ] Clicking an empty cell places X in that cell within 100ms
- [ ] AI responds with a random empty cell placement within 300ms
- [ ] Win detection fires for all 8 winning lines (3 rows, 3 columns, 2 diagonals)
- [ ] Draw detection fires when the board is full with no winner
- [ ] Result banner text matches `gameResult` values: `"You win!"` / `"AI wins."` / `"Draw."`
- [ ] Clicking a filled cell is a no-op (does not replace mark, does not flip turn)
- [ ] "Play again" resets `boardState` and `gameResult`; does not change `gameMode`
- [ ] Unit tests cover: each of the 8 win lines, draw detection, invalid-move no-op

## Integration points

- `boardState` and `turnIndicator` now have live consumers (Slice 1 only had initial values)
- Win detector is introduced here and will be reused for all future slices

## Traces to

- Journey: `journey-solo-player.yaml` Steps 2-5
- Registry artifacts: `boardState`, `turnIndicator`, `gameResult`, `winningLine`
- KPI: KPI-2 (game-completion rate ≥ 70% in session)

## Hypothesis is falsified if

- The win detector requires more than a single pure function
- State management requires a third-party store for a 3x3 grid (signals over-engineering)
- Tests are non-trivial to write (signals poor abstraction)
