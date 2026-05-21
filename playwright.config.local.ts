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
    baseURL: 'http://localhost:4173',
  },
  // Disable webServer since we're running it separately
  webServer: undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173/tic-tac-toe/' },
    },
  ],
});
