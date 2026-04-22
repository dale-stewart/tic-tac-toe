# CLAUDE.md

Greenfield web-based tic-tac-toe SPA — methodology practice project.

## Development Paradigm

This project follows the **functional programming** paradigm. Use @nw-functional-software-crafter for implementation.

## Mutation Testing Strategy

`per-feature` — `/nw-deliver` gates each feature on Stryker mutation score (≥ 80% kill rate) against `src/core/**` plus pure adapter slices. DOM-entangled adapters are excluded via `stryker.config.json`'s deny-list (Playwright covers them). Config: `stryker.config.json`. Local: `make mutation`.

The **break threshold is 80% but the project standard is 100%**. When a mutation run leaves survivors:

1. **Export private helpers** where survivors cluster so tests can target them directly (e.g. `findPlacement`, `isResetToEmpty`, `combine`, `opponent`, `pickBetter`). Add a one-line comment "exported for direct mutation-kill coverage; not part of the adapter's public surface" so the export reads as a test seam, not API growth.
2. **Write targeted tests** that distinguish the mutant's output from the original's — `it.each` across coordinate values to kill first-iteration short-circuits, explicit tie-breaking tests to kill strict-vs-non-strict inequality mutants.
3. **Annotate genuinely equivalent mutants** with `// Stryker disable next-line <MutatorName>: <rationale>` inline. Recurring equivalents in this repo: `col < 3` → `col <= 3` loop bounds (reading index 3 yields `undefined`, fails `=== null`), `if (cell === null) push` guards when downstream code re-filters via `placeMark`.
4. If a survivor resists both targeted tests and equivalent-mutant analysis, stop and discuss — don't lower the threshold.

Precedent commits applying this pattern: `ab38407` (slice-01), `ab2036f` (slice-03), `4b85a0e` (slice-04).

## UI Change Verification

**Acceptance tests that assert only ARIA / semantic state are insufficient for UI work.** Slice-04 shipped a semantically correct `role="radiogroup"` with passing Playwright tests and zero CSS — the result was three stacked plain-text lines with no visible control (fix: commit `8f2e30b`).

When a commit touches rendered markup or styles:

1. **Eyeball the running app** before committing — `bun run dev` or `bun run preview`, inspect the changed element. A Playwright headless probe of the preview works if manual browsing is inconvenient.
2. **Add computed-style assertions** alongside semantic ones when the scenario depends on CSS: e.g. `getComputedStyle(el).backgroundColor` differs between selected / unselected, `getBoundingClientRect().height > 0` for visibility, no layout shift measured via `performance.getEntriesByType('layout-shift')`.
3. **Architectural split matters for testability:** TemplateResult builders (DOM-entangled) live in `render.ts`, `announce.ts`, `input/keyboard.ts` — excluded from vitest + Stryker, covered by Playwright. Pure string / logic helpers live in `*-strings.ts` / `*-pure.ts` companions — vitest-tested at 100% mutation. Follow this split for any new adapter code.
