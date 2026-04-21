import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('axe-core accessibility — scaffold shell', () => {
  test('empty page has no axe violations', async ({ page }) => {
    await page.goto('/tic-tac-toe/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
