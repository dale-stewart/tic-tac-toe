/**
 * Walking-skeleton E2E acceptance tests — slice 01.
 *
 * Source of truth: docs/feature/tic-tac-toe/distill/feature-walking-skeleton.feature
 * Driving port: real browser via Playwright (Strategy C — real local adapters).
 *
 * Each test() corresponds to exactly one @slice:01 Gherkin scenario plus the
 * @ac:US-01-fallback-message scenario from feature-crosscutting.feature.
 */
import { test, expect } from '@playwright/test';

test.describe('@slice:01 — Sam opens the page and sees a ready-to-play board', () => {
  test('empty 3x3 board is visible with role=grid and 9 gridcells', async ({ page }) => {
    await page.goto('/tic-tac-toe/');
    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);
    // Every cell starts empty.
    for (let index = 0; index < 9; index += 1) {
      await expect(cells.nth(index)).toHaveText('');
    }
  });

  test('turn indicator reads exactly "Your turn (X)."', async ({ page }) => {
    await page.goto('/tic-tac-toe/');
    const turnIndicator = page.getByTestId('turn-indicator');
    await expect(turnIndicator).toHaveText('Your turn (X).');
  });

  test('turn indicator is ARIA-labeled (live region)', async ({ page }) => {
    await page.goto('/tic-tac-toe/');
    const announce = page.locator('#announce');
    await expect(announce).toHaveAttribute('role', 'status');
    await expect(announce).toHaveAttribute('aria-live', 'polite');
  });

  test('default mode is solo against a medium AI (data attribute contract)', async ({ page }) => {
    await page.goto('/tic-tac-toe/');
    const app = page.locator('#app');
    await expect(app).toHaveAttribute('data-mode', 'solo');
    await expect(app).toHaveAttribute('data-difficulty', 'medium');
  });

  test('no modal, signup prompt, or cookie wall blocks the board', async ({ page }) => {
    await page.goto('/tic-tac-toe/');
    // The grid must be visible and not covered by any dialog/overlay/cookie banner.
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    // No cookie/consent wall by common naming.
    await expect(page.locator('[class*="cookie" i], [id*="cookie" i]')).toHaveCount(0);
    await expect(page.locator('[class*="consent" i], [id*="consent" i]')).toHaveCount(0);
  });

  test('board is interactive within 500 milliseconds of page load', async ({ page }) => {
    const start = Date.now();
    await page.goto('/tic-tac-toe/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('grid').waitFor({ state: 'visible' });
    await page.getByRole('gridcell').first().waitFor({ state: 'visible' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

test.describe('@slice:01 — Priya on a 360px mobile viewport', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('3x3 grid is fully visible with no horizontal scroll and cells >=44x44', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/');
    // No horizontal scroll: scrollWidth must not exceed clientWidth of document.
    const overflow = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement;
      return { scrollWidth, clientWidth };
    });
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);
    for (let index = 0; index < 9; index += 1) {
      const box = await cells.nth(index).boundingBox();
      expect(box, `cell ${index} has a bounding box`).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('@ac:US-01-fallback-message — ancient browser fallback', () => {
  test('fallback message renders and is announced when a required feature is missing', async ({
    page,
  }) => {
    // Simulate an ancient browser by deleting a required modern feature BEFORE the
    // page scripts run. We rely on queueMicrotask as the feature-detect pivot.
    await page.addInitScript(() => {
      // Deliberately break a required modern feature to trigger the fallback.
      (globalThis as unknown as Record<string, unknown>)['queueMicrotask'] = undefined;
    });
    await page.goto('/tic-tac-toe/');

    const fallback = page.getByTestId('ancient-browser-fallback');
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveText(
      'This game needs a modern browser. Try Firefox, Chrome, Safari, or Edge.',
    );
    // Announced to AT: either aria-live on the fallback node itself OR the text
    // is copied into the shared #announce live region.
    const announcePresent = await page
      .locator('#announce')
      .evaluate((node) => (node.textContent ?? '').includes('modern browser'));
    const liveOnFallback = await fallback.evaluate((node) => {
      const liveAttr = node.getAttribute('aria-live');
      const roleAttr = node.getAttribute('role');
      return liveAttr === 'polite' || liveAttr === 'assertive' || roleAttr === 'alert';
    });
    expect(announcePresent || liveOnFallback).toBe(true);

    // No broken UI below the fallback: the grid MUST NOT be present.
    await expect(page.getByRole('grid')).toHaveCount(0);
  });
});
