# ADR-0002: Vanilla TypeScript + lit-html for rendering

## Status

Accepted — 2026-04-21

## Context

The SPA must meet a hard ≤50KB gzipped bundle ceiling, Lighthouse perf ≥90, FMP ≤500ms, CLS ≤0.1, and TTFM ≤3s on commodity mobile. It must load with zero third-party network requests and no tracking. The UI is small: a 3×3 grid, a difficulty selector, a mode toggle, a result banner, a win-line overlay, a footer. The rendering requirement is "take a `GameState`, produce DOM." No routing, no server-side rendering, no streaming, no complex component tree.

Open-source-first policy (global architecture rule) excludes proprietary toolchains without explicit override.

## Decision

Use **vanilla TypeScript** (no component framework) with **lit-html** (~4KB gzipped, BSD-3-Clause) as the rendering library. The `render` adapter is a single function `(state: GameState) => TemplateResult`; lit-html's own `render(template, container)` applies the template to the real DOM with targeted patches.

Build toolchain: **Vite** (dev loop + production build + bundle analysis). Vite is MIT-licensed, actively maintained, and its esbuild+rollup output is production-ready out of the box.

## Consequences

**Positive**
- Bundle budget is easy to hit — lit-html ~4KB leaves ~45KB headroom.
- No framework runtime, no virtual-DOM reconciler, no hydration complexity.
- Templates are plain tagged template literals — `html\`\`` — so rendering code reads like HTML with interpolation. Low-ceremony.
- Works natively with pure-FP core: `state → TemplateResult` is a pure function.
- TypeScript gives full type inference on templates when helpers are typed.
- Zero lock-in: lit-html is a library, not a framework. Could be replaced by direct DOM manipulation later with no architectural change.

**Negative**
- No built-in component model means state management is entirely our responsibility (addressed by ADR-0003).
- No built-in routing or data-fetching conventions — not needed for this feature, but would need to be added explicitly if scope grows.
- Community is smaller than React's; fewer off-the-shelf recipes. Acceptable given the small surface area of this app.

## Alternatives considered

**Svelte** *(runner-up)* — compiles to small runtime (~2-3KB), excellent DX, reactive primitives built in.
- *Rejected because:* (a) the compiler is another moving part; (b) Svelte's reactivity model is its own mental model, and mixing it with a pure-FP core creates two sources of state truth unless we're disciplined — ADR-0003's single reducer is cleaner; (c) for a UI this small, lit-html is simpler with no meaningful size penalty. Would be a strong choice if the UI had significantly more interactive components.

**Preact** — 3-4KB React-compatible runtime.
- *Rejected because:* brings the component/hooks mental model which encourages per-component state — again in tension with single-source-of-truth. Useful when the team is React-fluent and wants to migrate gradually; no migration story applies here.

**React + Next.js** — industry standard, largest ecosystem.
- *Rejected because:* (a) bundle cost (~40KB+ for React alone) consumes the budget before we ship a line of app code; (b) Next.js adds SSR/routing complexity this feature doesn't need; (c) resume-driven-development risk flagged — the tool is wildly oversized for a tic-tac-toe SPA. Explicit reject per DISCOVER Tier-C evidence.

**No library at all — manual `document.createElement` / `innerHTML`** — zero runtime.
- *Rejected because:* templating by hand is error-prone (XSS, event-listener leaks on re-render), and lit-html's ~4KB pays for itself by making the render code declarative. Saving 4KB in a 50KB budget doesn't justify 10× more fragile render code.
