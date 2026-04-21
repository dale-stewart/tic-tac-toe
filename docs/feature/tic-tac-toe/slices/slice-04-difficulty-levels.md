# Slice 04 — AI Difficulty Levels

**Part of:** Release 1 (core v1)
**Estimated effort:** ≤ 1 day
**Story:** US-04 Choose AI difficulty

## Hypothesis

`[BUILD]` *"Easy / medium / perfect can be implemented as three small pure functions sharing a signature `(boardState) -> [row, col]`. If we need per-difficulty state or special casing, the abstraction is wrong."*

## User-observable outcome

A solo player can now:

- See a visible difficulty control: easy / medium / perfect
- Switch difficulty between games (disabled mid-game)
- Experience a meaningfully different opponent at each level:
  - Easy: AI plays randomly (any empty cell)
  - Medium: AI blocks immediate three-in-a-row threats and completes its own if possible; otherwise random
  - Perfect: AI plays minimax — never loses

## Not in this slice

- No hot-seat visible yet (Slice 5)
- No alternating starter — human always starts

## Acceptance criteria

- [ ] Difficulty control is keyboard-reachable and activatable (Enter/Space or arrow-within-radio-group per ARIA pattern)
- [ ] Default is "medium" per DISCOVER solution scope
- [ ] Selected difficulty is visually indicated AND announced via ARIA
- [ ] Difficulty control is disabled mid-game and re-enabled at terminal state
- [ ] Medium AI blocks an opponent three-in-a-row threat when it exists (unit test with 6 distinct threat configurations)
- [ ] Medium AI completes its own winning line when available (unit test with 3 configurations)
- [ ] Perfect AI plays minimax and is unbeatable (property test: over 100 random games vs random-move opponent, AI never loses; worst case is draw)
- [ ] All three AI functions share signature `(boardState, playerMark) -> [row, col]`
- [ ] Switching difficulty mid-session (between games) preserves that choice on "Play again"

## Integration points

- AI selection reads `gameMode` — adds branching in the `gameMode` formatter
- New state-machine rule: toggle disabled mid-game (also affects Slice 5 hot-seat toggle)

## Traces to

- Journey: `journey-solo-player.yaml` Step 3 (AI responds)
- Registry artifacts: `gameMode` (now carries difficulty), `boardState` (read-only consumer)
- KPI: KPI-2 (game completion), DISCOVER H2 (multi-difficulty AI drives replay)

## Hypothesis is falsified if

- AI functions end up with different signatures or shared state
- Perfect AI loses any of 100 test games
- Difficulty-switching logic sprawls into multiple modules
