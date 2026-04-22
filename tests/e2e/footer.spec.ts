/**
 * Slice-07 footer E2E acceptance tests.
 *
 * Source of truth: docs/feature/tic-tac-toe/distill/feature-footer.feature
 *   @ac:US-07-footer-text
 *   @ac:US-07-source-link-present
 *   @ac:US-07-new-tab-noopener
 *   @ac:US-07-footer-above-fold
 */
import { test, expect } from '@playwright/test';

const REPO_URL = 'https://github.com/dale-stewart/tic-tac-toe';

test.describe('@slice:07 — footer visibility and source link', () => {
  test('footer text is visible without scrolling at 1280x800', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/tic-tac-toe/');
    const footer = page.getByTestId('site-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('No ads. No signup. No tracking.');

    const box = await footer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(800);

    // Computed styles — lesson from 02-02: make sure CSS actually renders.
    const display = await footer.evaluate((node) => getComputedStyle(node).display);
    expect(display).not.toBe('none');
  });

  test('[source] link is keyboard-focusable with a visible focus indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/tic-tac-toe/');
    const link = page.getByTestId('source-link');
    await expect(link).toBeVisible();

    await link.focus();
    await expect(link).toBeFocused();
    // Visible focus indicator — outline width non-zero under :focus-visible styling.
    const outlineWidth = await link.evaluate((node) => {
      const styles = getComputedStyle(node);
      return parseFloat(styles.outlineWidth || '0');
    });
    expect(outlineWidth).toBeGreaterThan(0);

    // Canonical repo URL.
    await expect(link).toHaveAttribute('href', REPO_URL);
  });

  test('[source] link opens in a new tab with rel=noopener noreferrer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/tic-tac-toe/');
    const link = page.getByTestId('source-link');
    await expect(link).toHaveAttribute('target', '_blank');
    const rel = await link.getAttribute('rel');
    expect(rel).not.toBeNull();
    expect(rel!).toContain('noopener');
    expect(rel!).toContain('noreferrer');
  });

  test('board AND footer both visible without scrolling at 1280x800', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/tic-tac-toe/');

    const board = page.getByRole('grid');
    const footer = page.getByTestId('site-footer');
    await expect(board).toBeVisible();
    await expect(footer).toBeVisible();

    const boardBox = await board.boundingBox();
    const footerBox = await footer.boundingBox();
    expect(boardBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    // Both sit fully above the 800px fold.
    expect(boardBox!.y + boardBox!.height).toBeLessThanOrEqual(800);
    expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(800);
  });
});

test.describe('@slice:07 — footer on small viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('footer still visible and board not pushed off-screen on a 375x667 viewport', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/');
    const board = page.getByRole('grid');
    const footer = page.getByTestId('site-footer');
    await expect(board).toBeVisible();
    await expect(footer).toBeVisible();

    // Board is at least partially in the initial viewport (top edge <= 667).
    const boardBox = await board.boundingBox();
    expect(boardBox).not.toBeNull();
    expect(boardBox!.y).toBeLessThan(667);
  });
});
