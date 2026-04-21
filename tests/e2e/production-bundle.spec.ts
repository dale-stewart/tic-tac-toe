/**
 * Production-bundle regression test — closes the 01-02 deploy gap.
 *
 * Why this test exists:
 *   GitHub Pages serves this project under the `/tic-tac-toe/` path prefix.
 *   If Vite's `base` option is not set, the built `index.html` references
 *   assets at absolute `/assets/...` paths, which 404 under the project-page
 *   prefix. The result is an empty `<main id="app">` in production even though
 *   the dev-server and preview-at-root tests both pass (test/prod parity gap).
 *
 * What this test enforces:
 *   The built `dist/` bundle, served at a Pages-shaped base path, hydrates
 *   correctly with zero asset 404s.
 *
 * Plumbing:
 *   This spec runs in its own Playwright project (`production-bundle`) whose
 *   webServer is `pnpm preview:pages` (vite preview --base /tic-tac-toe/ on
 *   port 4174). The project's baseURL is `http://127.0.0.1:4174` so that
 *   `page.goto('/tic-tac-toe/')` hits the production base path exactly as
 *   GitHub Pages would serve it.
 */
import { test, expect, type Request, type Response } from '@playwright/test';

test.describe('@regression — production bundle under /tic-tac-toe/ base path', () => {
  test('hydrates with zero asset 404s, renders grid, and shows turn indicator', async ({
    page,
  }) => {
    const failedResponses: Array<{ url: string; status: number }> = [];
    page.on('response', (response: Response) => {
      if (response.status() >= 400) {
        failedResponses.push({ url: response.url(), status: response.status() });
      }
    });
    const failedRequests: Array<{ url: string; failure: string | null }> = [];
    page.on('requestfailed', (request: Request) => {
      failedRequests.push({ url: request.url(), failure: request.failure()?.errorText ?? null });
    });

    await page.goto('/tic-tac-toe/', { waitUntil: 'networkidle' });

    // Assertion 1: no HTTP failure responses for any resource fetched during load.
    expect(
      failedResponses,
      `expected zero 4xx/5xx responses but got: ${JSON.stringify(failedResponses)}`,
    ).toEqual([]);
    expect(
      failedRequests,
      `expected zero network failures but got: ${JSON.stringify(failedRequests)}`,
    ).toEqual([]);

    // Assertion 2: after hydration, the grid is present in the DOM.
    await expect(page.getByRole('grid')).toBeVisible();

    // Assertion 3: turn indicator reads exactly the mandated string.
    await expect(page.getByTestId('turn-indicator')).toHaveText('Your turn (X).');
  });
});
