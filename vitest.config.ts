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
      // Deny-list: include all source, exclude only what vitest cannot
      // observe (DOM-entangled adapters covered by Playwright instead).
      // New pure files are picked up automatically.
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/adapters/bootstrap.ts',
        'src/adapters/render.ts',
        'src/adapters/announce.ts',
        'src/adapters/input/pointer.ts',
        'src/adapters/input/keyboard.ts',
      ],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
});
