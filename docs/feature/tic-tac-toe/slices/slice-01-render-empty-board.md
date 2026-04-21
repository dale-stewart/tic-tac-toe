# Slice 01 — Render Empty Board

**Part of:** Walking Skeleton
**Estimated effort:** ≤ 4h
**Story:** US-01 Empty board on load

## Hypothesis

`[BUILD]` *"We can ship a static SPA with a keyboard-focusable 3x3 grid and an ARIA-labeled turn indicator in half a day. If we can't, our framework / build pipeline choice is too heavy for a toy project."*

## User-observable outcome

A first-time visitor navigates to the tic-tac-toe URL. Within 500ms of first meaningful paint, they see:

- An empty 3x3 grid
- The text "Your turn (X)." immediately below the grid
- No modal, no cookie banner (beyond legal minimum), no signup prompt
- The center cell is keyboard-focusable via Tab

## Not in this slice

- Clicking a cell does nothing (that is Slice 2)
- No AI, no game logic at all
- No mode toggle visible
- No win detection
- No styling beyond default

## Acceptance criteria

- [ ] SPA renders on load at the canonical URL
- [ ] 3x3 grid is visible with distinct cell boundaries
- [ ] Turn indicator text `"Your turn (X)."` is present and correctly labeled for screen readers (`aria-live="polite"`)
- [ ] Tabbing through the page reaches every cell
- [ ] Focus indicator is visible on the focused cell
- [ ] Lighthouse a11y score ≥ 95 on this slice alone

## Integration points

- Static asset host (GitHub Pages or equivalent) → browser
- No backend

## Traces to

- Journey: `journey-solo-player.yaml` Step 1
- Registry artifacts: `boardState` (initial empty), `turnIndicator` (initial "Your turn (X).")
- KPI: KPI-1 (time-to-first-move ≤ 3s median)

## Hypothesis is falsified if

- Build / deployment takes more than 4h from scratch
- Automated a11y audit fails on first CI run
- Any legally-unnecessary modal appears before the board
