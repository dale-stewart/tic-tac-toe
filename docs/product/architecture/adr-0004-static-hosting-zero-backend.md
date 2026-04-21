# ADR-0004: Static hosting, zero runtime backend

## Status

Accepted — 2026-04-21

## Context

The application is a fully client-side SPA. Game logic, AI, rendering, and state all live in the browser. There is no persistent data per user, no accounts, no online multiplayer, no server-authoritative behaviour. DISCUSS constraints forbid third-party network requests on load and tracking.

KPI-2 (median TTFM ≤3s on commodity mobile) may be measured by the product owner; if so, a lightweight aggregate-counter endpoint receiving anonymous load-timing samples is the only potential need for any server-side component.

## Decision

Deploy as **pure static assets** (HTML + JS + CSS) served by a static web host. **Final host selection deferred to the DEVOPS wave** (platform-architect); candidates in order of preference:

1. **GitHub Pages** (free for public repos, zero-config, MIT-friendly host)
2. **Cloudflare Pages** (free tier, fast global CDN, free optional Worker sidecar for KPI-2 counter)
3. **Netlify** (free tier, functions available if needed)

**KPI-2 aggregate-counter instrumentation**, *if and when implemented*, MUST be a single stateless endpoint with the following constraints:
- accepts an anonymous timing sample (integer ms), no identifiers, no cookies
- writes to a counter / aggregator (implementation: Cloudflare Worker, Netlify Function, or equivalent — architecture-agnostic)
- has no read endpoint from the client
- is disabled by default; opt-in via a build flag

The choice of runtime (Worker, Function, etc.) and the hosting target are **DEVOPS-wave decisions**, not a DESIGN-wave decision. Architecture prescribes the shape of the endpoint, not the vendor.

## Consequences

**Positive**
- Zero operational burden: no servers to patch, no databases to back up, no scaling concerns.
- Cost: $0 at MVP and effectively $0 at any plausible tic-tac-toe traffic volume.
- Security surface is minimal — no API routes, no auth flows, no database.
- Privacy posture holds: with the counter disabled, literally zero user data leaves the browser.
- Portability: the artifact is three files; swapping hosts is a 10-minute operation.

**Negative**
- No server-side rendering means first-paint latency is bounded by JS parse + execute on the client. Mitigated by small bundle (ADR-0002) and inlined critical CSS.
- Online multiplayer would require a real backend; not in scope. Should the product add that later, this ADR would be superseded.

## Alternatives considered

**Full serverless backend** (e.g., Node API on AWS Lambda + DynamoDB, or Next.js on Vercel with API routes).
- *Rejected because:* (a) nothing in scope requires server-side logic; (b) introduces potential privacy hazards (accidental logging, third-party telemetry from the provider's SDK) that a static-only deploy sidesteps entirely; (c) adds cost, ops complexity, and attack surface for no functional gain.

**Dedicated Node server** (Express / Fastify on a VPS).
- *Rejected because:* radically overkill. All the downsides of the serverless option plus manual patching and uptime responsibility. No benefits.

**Peer-to-peer / offline-first with service worker only** (no host network at all after first load).
- *Not rejected — partially adopted.* Post-first-load the SPA is fully offline-capable by design (no runtime fetches). A service worker for full PWA installability is out of scope for MVP but compatible with this ADR; DEVOPS wave can add one without architectural change.
