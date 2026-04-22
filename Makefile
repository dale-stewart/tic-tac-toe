# tic-tac-toe — developer entry points.
# Mirrors the CI gates in .github/workflows/ci.yml so `make check` locally ≈ green PR.

.DEFAULT_GOAL := help
.PHONY: help install dev build preview preview-pages \
        lint typecheck lint-and-typecheck \
        test test-watch test-unit test-e2e test-a11y \
        depcruise duplication complexity size lhci \
        check clean distclean hooks

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## ── setup ────────────────────────────────────────────────────────
install: ## Install dependencies (frozen lockfile)
	bun install --frozen-lockfile

hooks: ## Install lefthook git hooks
	bunx lefthook install

## ── dev ──────────────────────────────────────────────────────────
dev: ## Run Vite dev server
	bun run dev

build: ## Production build (typecheck + Vite)
	bun run build

preview: ## Preview production build
	bun run preview

preview-pages: ## Preview production build at /tic-tac-toe/ base
	bun run preview:pages

## ── quality gates (match CI) ─────────────────────────────────────
lint: ## ESLint
	bun run lint

typecheck: ## tsc --noEmit
	bun run typecheck

lint-and-typecheck: ## Lint + typecheck
	bun run lint-and-typecheck

test: ## Vitest + fast-check (unit & property)
	bun run test

test-watch: ## Vitest watch mode
	bun run test:watch

test-unit: test ## Alias for test

test-e2e: ## Playwright e2e (requires: bunx playwright install chromium)
	bun run test:e2e

test-a11y: ## Playwright axe-core a11y suite
	bun run test:a11y

depcruise: ## Architectural boundary check
	bun run depcruise

duplication: ## Copy-paste detection (jscpd over src + tests)
	bun run duplication

complexity: ## Cyclomatic complexity (lizard via uvx; requires uv)
	uvx --from lizard lizard src -l typescript -C 10 -L 80 -a 5 -w

size: ## Bundle-size budget (≤ 50 KB gzipped)
	bun run size

lhci: ## Lighthouse CI
	bun run lhci

## ── aggregate ────────────────────────────────────────────────────
check: lint-and-typecheck test depcruise duplication complexity build size ## All fast gates (pre-push equivalent)

## ── cleanup ──────────────────────────────────────────────────────
clean: ## Remove build output
	rm -rf dist test-results .lighthouseci playwright-report

distclean: clean ## clean + remove node_modules
	rm -rf node_modules
