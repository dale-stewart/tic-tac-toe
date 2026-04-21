import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: ['**/a11y/**/*.spec.ts', '**/e2e/**/*.spec.ts', '**/privacy/**/*.spec.ts'],
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'on-first-retry',
  },
  // Two preview servers run in parallel:
  //   - port 4173: default-base preview for a11y/privacy/walking-skeleton specs
  //   - port 4174: /tic-tac-toe/-base preview for production-bundle regression spec
  webServer: [
    {
      command: 'pnpm preview --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env['CI'],
      timeout: 30_000,
    },
    {
      command: 'pnpm preview:pages',
      url: 'http://127.0.0.1:4174/tic-tac-toe/',
      reuseExistingServer: !process.env['CI'],
      timeout: 30_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      testIgnore: ['**/production-bundle.spec.ts'],
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173' },
    },
    {
      name: 'production-bundle',
      testMatch: ['**/production-bundle.spec.ts'],
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4174' },
    },
  ],
});
