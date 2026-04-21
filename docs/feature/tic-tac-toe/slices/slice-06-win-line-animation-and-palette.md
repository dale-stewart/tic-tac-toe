# Slice 06 — Win-Line Animation and Color-Blind-Safe Palette

**Part of:** Release 2 (craft polish)
**Estimated effort:** ≤ 0.5 day
**Story:** US-06 Game feels polished

## Hypothesis

`[BUILD]` *"Win-line animation and a color-blind-safe palette can be added without regressing the a11y audit from Slice 3. If the a11y score drops, our visual layer is now conflicting with our semantic layer."*

## User-observable outcome

A player finishing a game now sees:

- The winning three-cell line draw itself smoothly (≤ 500ms)
- X and O marks rendered in shapes that are distinguishable beyond color (e.g., X with diagonal strokes, O as a ring — testable via color-blind filter)
- Focus rings and active states using a palette that meets WCAG 4.5:1 contrast for text and 3:1 for UI elements

## Not in this slice

- No sound effects (scope-creep trap — skip unless specifically requested)
- No dark mode (deferred)

## Acceptance criteria

- [ ] Win-line animation draws across the three winning cells within 500ms total
- [ ] Animation respects `prefers-reduced-motion: reduce` — falls back to static highlight
- [ ] X and O marks pass a protanopia / deuteranopia / tritanopia filter comparison (distinguishable without color)
- [ ] All text meets 4.5:1 contrast, all UI elements meet 3:1 contrast
- [ ] Lighthouse a11y score remains ≥ 95 (no regression from Slice 3)
- [ ] Lighthouse performance score ≥ 90 on first paint

## Integration points

- Animation consumes `winningLine` (already a registry artifact)
- No new state introduced

## Traces to

- Journey: both journeys, Step 4 (game ends)
- Registry artifacts: `winningLine`, visual layer only
- KPI: KPI-3 (a11y), KPI-4 (Lighthouse perf)

## Hypothesis is falsified if

- A11y score regresses below 95
- Animation causes layout shift (CLS > 0.1)
- `prefers-reduced-motion` is not honored
