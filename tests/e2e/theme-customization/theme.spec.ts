import { expect, test } from '@playwright/test';
import { setupTestPage } from '../../utils/page-setup';

// Helper to wait for a condition with timeout
const waitForCondition = async (fn: () => Promise<boolean>, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
};

test.describe('Theme Customization', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
    await page.waitForFunction(() => document.body.classList.contains('theme-light'));
  });

  test('should have theme selector and toggle button visible', async ({ page }) => {
    await expect(page.locator('#theme-select')).toBeVisible();
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
    await expect(page.locator('label[for="theme-select"]')).toHaveText('Theme:');
  });

  test('should toggle between light and dark themes with toggle button', async ({ page }) => {
    // Start in light theme
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-light(?:$|\s)/);

    // Click toggle to switch to dark
    await page.locator('[data-testid="theme-toggle"]').click();

    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-dark(?:$|\s)/);

    // Click toggle to switch back to light
    await page.locator('[data-testid="theme-toggle"]').click();

    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-light(?:$|\s)/);
  });

  test('should change theme via dropdown selection', async ({ page }) => {
    // Test light theme
    await page.selectOption('#theme-select', 'light');
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-light(?:$|\s)/);

    // Test dark theme
    await page.selectOption('#theme-select', 'dark');
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-dark(?:$|\s)/);

    // Test retro theme
    await page.selectOption('#theme-select', 'retro');
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-retro(?:$|\s)/);
  });

  test('should save theme preference to localStorage', async ({ page }) => {
    // Change to dark theme
    await page.locator('[data-testid="theme-toggle"]').click();

    // Wait for localStorage to be updated
    await waitForCondition(async () => {
      const savedTheme = await page.evaluate(() => localStorage.getItem('preferred-theme'));
      return savedTheme === 'dark';
    });

    const savedTheme = await page.evaluate(() => localStorage.getItem('preferred-theme'));
    expect(savedTheme).toBe('dark');
  });

  test('should load saved theme on page reload', async ({ page }) => {
    // Set dark theme and save to localStorage
    await page.evaluate(() => {
      localStorage.setItem('preferred-theme', 'dark');
    });

    // Reload page
    await page.reload();

    // Wait for theme to be applied
    await waitForCondition(async () => {
      const bodyClass = await page.evaluate(() => document.body.className);
      return bodyClass.includes('theme-dark');
    });

    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-dark(?:$|\s)/);
  });

  test('should respect OS dark mode preference on first visit', async ({ page }) => {
    // Clear localStorage
    await page.evaluate(() => localStorage.clear());

    // Mock OS prefers-color-scheme: dark
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    // Reload page
    await page.reload();

    // Wait for theme to be applied
    await waitForCondition(async () => {
      const bodyClass = await page.evaluate(() => document.body.className);
      return bodyClass.includes('theme-dark');
    });

    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-dark(?:$|\s)/);
  });

  test('should apply keyboard shortcuts for theme toggling and selection', async ({ page }) => {
    // Test T key for toggle
    await page.keyboard.press('T');
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-dark(?:$|\s)/);

    await page.keyboard.press('t');
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-light(?:$|\s)/);

    // Test 4 key for light theme
    await page.keyboard.press('4');
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-light(?:$|\s)/);

    // Test 5 key for dark theme
    await page.keyboard.press('5');
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-dark(?:$|\s)/);

    // Test 6 key for retro theme
    await page.keyboard.press('6');
    await expect(page.locator('body')).toHaveClass(/(?:^|\s)theme-retro(?:$|\s)/);
  });
});
