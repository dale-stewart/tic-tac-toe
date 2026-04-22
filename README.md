# tic-tac-toe

Greenfield web-based tic-tac-toe SPA — methodology practice project.

## Stack

- **Build**: Vite + TypeScript (strict, ES2022)
- **Render**: lit-html (~4 KB gzipped) over vanilla TS
- **Tests**: Vitest + fast-check (unit/property) | Playwright + @axe-core/playwright (a11y + privacy)
- **Architecture**: pure FP core in `src/core/` | thin adapters in `src/adapters/` | enforced by dependency-cruiser

## Local quality gates

Use `make` (see `make help` for the full list) or call `bun run <script>` directly.

Prerequisites: [`bun`](https://bun.sh) and [`uv`](https://docs.astral.sh/uv/) (uv provides `uvx`, used to run the Python-based `lizard` complexity analyzer without polluting a global environment).

```bash
make install         # one-time — bun install --frozen-lockfile
make lint            # ESLint (incl. complexity / max-lines / max-params rules)
make typecheck       # tsc --noEmit
make test            # Vitest + fast-check
make depcruise       # architectural boundary check
make duplication     # jscpd copy-paste detection
make complexity      # lizard cyclomatic complexity (via uvx)
make mutation        # Stryker mutation testing over src/core (≥ 80% kill rate, ~75s)
make build           # Vite production build
make size            # gzipped bundle-size check (≤ 50 KB)
make test-e2e        # Playwright (axe-core + network-assertion)
make lhci            # Lighthouse CI
make check           # all fast gates (pre-push equivalent)
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
