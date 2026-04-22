# CLAUDE.md

Greenfield web-based tic-tac-toe SPA — methodology practice project.

## Development Paradigm

This project follows the **functional programming** paradigm. Use @nw-functional-software-crafter for implementation.

## Mutation Testing Strategy

`per-feature` — `/nw-deliver` gates each feature on Stryker mutation score (≥ 80% kill rate) against `src/core/**`. Adapters are excluded (DOM code is covered by Playwright; Stryker cannot drive it). Config: `stryker.config.json`. Local: `make mutation`.
