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
      // Core only. Adapters wire the browser DOM and are exercised by
      // Playwright, which vitest cannot observe. Their correctness is
      // asserted by e2e + a11y suites, not line coverage here.
      include: ['src/core/**/*.ts'],
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
