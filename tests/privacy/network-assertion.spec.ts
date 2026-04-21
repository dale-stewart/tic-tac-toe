import { test, expect } from '@playwright/test';

test.describe('network privacy — scaffold shell', () => {
  test('no third-party requests, no cookies on load', async ({ page, context }) => {
    const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const origin = new URL(page.url()).origin;
    const offenders = requests.filter((url) => new URL(url).origin !== origin);
    expect(offenders).toEqual([]);

    const cookies = await context.cookies();
    expect(cookies).toEqual([]);
  });
});
