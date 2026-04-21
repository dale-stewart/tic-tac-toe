# Slice 03 — Keyboard and ARIA Baseline

**Part of:** Release 1 (core v1)
**Estimated effort:** ≤ 1 day
**Story:** US-03 Keyboard and screen-reader baseline

## Hypothesis

`[BUILD]` *"WCAG 2.2 AA baseline (keyboard nav, ARIA live, visible focus) passes an automated a11y audit on the first try if built with semantic HTML from the start. If we fail, we retrofitted a11y instead of starting with it — a known anti-pattern from DISCOVER H5."*

## User-observable outcome

A keyboard-only or screen-reader user can now:

- Navigate the 3x3 grid with arrow keys (wrap or bounded — spec below)
- Place a mark with Enter or Space on the focused cell
- Hear every state change announced via ARIA live region
- See a clear focus indicator on every interactive element (cells, Play-again button, mode toggle)
- Activate every interactive control with the keyboard alone

## Not in this slice

- No difficulty selector yet (Slice 4)
- No hot-seat mode visible (Slice 5)
- No palette changes (Slice 6)

## Acceptance criteria

- [ ] Arrow keys move focus between cells. Bounded (no wrap) — e.g., Right at column 3 does nothing
- [ ] Enter or Space on a focused empty cell places a mark
- [ ] Enter or Space on a focused filled cell is a no-op and announces "Cell already taken" via ARIA live
- [ ] Every move (human and AI) is announced via `aria-live="polite"` with row and column
- [ ] Every result banner change fires a live-region announcement
- [ ] Focus indicator is visible (thick outline or equivalent) on all interactive elements, and passes contrast ≥ 3:1
- [ ] Tab order: first cell → cells in reading order → "Play again" (when visible) → mode toggle
- [ ] Lighthouse a11y score ≥ 95 for the full app after this slice

## Integration points

- ARIA live region becomes a first-class consumer of `boardState`, `turnIndicator`, `gameResult`
- No new state; purely additive on Slice 2

## Traces to

- Journey: both `journey-solo-player.yaml` and `journey-hot-seat.yaml`
- Registry artifacts: `boardState`, `turnIndicator`, `gameResult` — now have an additional consumer (ARIA region)
- KPI: KPI-3 (Lighthouse a11y score ≥ 95)
- DISCOVER assumption: A9 (a11y expected baseline), H5

## Hypothesis is falsified if

- The a11y audit fails the first time it runs in CI
- More than 2h is spent retrofitting a11y on Slice 1-2 code
- Screen-reader announcements are noticeably delayed (> 1s) or in wrong order
