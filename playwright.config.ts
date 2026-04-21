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
  // Single preview server serving the Pages-shaped bundle at /tic-tac-toe/.
  // Every test (a11y, privacy, walking-skeleton, production-bundle) runs
  // against the production base path — parity by construction, no fork.
  webServer: {
    command: 'pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173/tic-tac-toe/',
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173' },
    },
  ],
});
