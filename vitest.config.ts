import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts', 'tests/property/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tests/e2e', 'tests/a11y'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'reports/coverage',
      // Core + vitest-observable adapters. DOM-entangled adapters
      // (bootstrap, render's TemplateResult builders, pointer) are
      // exercised by Playwright and excluded below.
      include: ['src/core/**/*.ts', 'src/adapters/store.ts', 'src/adapters/render-strings.ts'],
      exclude: ['src/**/*.test.ts'],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
});
