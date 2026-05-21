import { expect, test } from '@playwright/test';

const bodyClassRe = (theme: string) => new RegExp(`(?:^|\\s)theme-${theme}(?:$|\\s)`);

test.describe('Theme Customization', () => {
  test.beforeEach(async ({ page }) => {
    // A fresh Playwright context starts with empty localStorage, so this is a
    // genuine first visit. (Don't clear via addInitScript — that re-runs on
    // every navigation and would wipe a saved preference before reload.)
    await page.goto('/tic-tac-toe/');
    // Default first-visit theme is light (no saved preference, no OS dark hint
    // under the default Playwright context).
    await expect(page.locator('body')).toHaveClass(bodyClassRe('light'));
  });

  test('renders a labelled theme selector', async ({ page }) => {
    await expect(page.locator('#theme-select')).toBeVisible();
    await expect(page.locator('label[for="theme-select"]')).toHaveText('Theme:');
    await expect(page.locator('#theme-select')).toHaveValue('light');
  });

  test('changes the body theme class via the dropdown', async ({ page }) => {
    await page.selectOption('#theme-select', 'dark');
    await expect(page.locator('body')).toHaveClass(bodyClassRe('dark'));

    await page.selectOption('#theme-select', 'retro');
    await expect(page.locator('body')).toHaveClass(bodyClassRe('retro'));

    await page.selectOption('#theme-select', 'light');
    await expect(page.locator('body')).toHaveClass(bodyClassRe('light'));
  });

  test('repaints the page palette when the theme changes', async ({ page }) => {
    const bodyBg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    const lightBg = await bodyBg();
    await page.selectOption('#theme-select', 'dark');
    await expect(page.locator('body')).toHaveClass(bodyClassRe('dark'));
    const darkBg = await bodyBg();

    expect(darkBg).not.toBe(lightBg);
  });

  test('persists the chosen theme to localStorage', async ({ page }) => {
    await page.selectOption('#theme-select', 'dark');
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('preferred-theme')))
      .toBe('dark');
  });

  test('restores the saved theme on reload', async ({ page }) => {
    await page.selectOption('#theme-select', 'retro');
    await expect(page.locator('body')).toHaveClass(bodyClassRe('retro'));

    await page.reload();

    await expect(page.locator('body')).toHaveClass(bodyClassRe('retro'));
    await expect(page.locator('#theme-select')).toHaveValue('retro');
  });

  test('respects OS dark-mode preference on first visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.locator('body')).toHaveClass(bodyClassRe('dark'));
  });
});
