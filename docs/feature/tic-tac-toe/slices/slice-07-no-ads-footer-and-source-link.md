# Slice 07 — "No Ads" Footer and Source Link

**Part of:** Release 2 (craft polish)
**Estimated effort:** ≤ 0.25 day
**Story:** US-07 Trust messaging visible

## Hypothesis

`[BUILD]` *"Explicit trust messaging ('no ads, no signup, no tracking') and a source-code link are a one-file change. If we're editing three files, we've coupled content to something it should not be coupled to."*

## User-observable outcome

A visitor looking at the page now sees, at a glance:

- A compact footer line reading "No ads. No signup. No tracking."
- A "[source]" link pointing at the public repository
- Nothing else new (this is deliberately minimal)

## Not in this slice

- No donate button (deferred — DISCOVER lean-canvas says donation is optional post-v1)
- No detailed privacy policy page (simpler claim; policy only needed if collecting PII, and we collect none)

## Acceptance criteria

- [ ] Footer text exactly reads "No ads. No signup. No tracking."
- [ ] "[source]" link goes to the public repository URL
- [ ] Link is keyboard-focusable, has a visible focus indicator, and opens in a new tab with `rel="noopener noreferrer"`
- [ ] Footer is visible on load without requiring scroll on a 1280x800 viewport
- [ ] No new JavaScript added; pure HTML/CSS change
- [ ] No tracking pixels, no analytics beacons, no third-party requests (verified by DevTools network tab + automated assertion)

## Integration points

- No data flows; purely static content

## Traces to

- Journey: both journeys, Step 1 (arrive — visible in initial paint)
- Registry artifacts: none (no variables)
- KPI: KPI-5 (0 server-persisted PII; 0 third-party requests)
- DISCOVER assumption: A7 (no-ads tolerance), H6 (no-ads stance is noticed)

## Hypothesis is falsified if

- Implementing the footer requires changes to more than one source file
- Any third-party request appears on page load (analytics, fonts-as-a-service, etc.)
- The slice takes more than 2h end-to-end
