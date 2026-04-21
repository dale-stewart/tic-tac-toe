# tic-tac-toe

Greenfield web-based tic-tac-toe SPA — methodology practice project.

## Stack

- **Build**: Vite + TypeScript (strict, ES2022)
- **Render**: lit-html (~4 KB gzipped) over vanilla TS
- **Tests**: Vitest + fast-check (unit/property) | Playwright + @axe-core/playwright (a11y + privacy)
- **Architecture**: pure FP core in `src/core/` | thin adapters in `src/adapters/` | enforced by dependency-cruiser

## Local quality gates

```bash
pnpm install         # one-time
pnpm lint            # ESLint
pnpm typecheck       # tsc --noEmit
pnpm test            # Vitest + fast-check
pnpm depcruise       # architectural boundary check
pnpm build           # Vite production build
pnpm size            # gzipped bundle-size check (≤ 50 KB)
pnpm test:e2e        # Playwright (axe-core + network-assertion)
pnpm lhci            # Lighthouse CI
pnpm check:all       # run them all sequentially
```

CI runs the same gates plus the Lighthouse and Playwright suites that are too
slow for pre-push (see `docs/product/platform/ci-pipeline.md`).

## Layout

```
src/
  core/         # pure functional domain — no DOM, no IO
  adapters/     # bootstrap, render, input, announce
tests/
  unit/         # Vitest
  a11y/         # Playwright + axe-core
  privacy/      # Playwright network-assertion
  e2e/          # Playwright scenario tests (future)
```

See `docs/product/architecture/brief.md` for the full architecture.
