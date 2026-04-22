/**
 * Slice-06 polish E2E acceptance tests.
 *
 * Source of truth: docs/feature/tic-tac-toe/distill/feature-polish.feature
 *   @ac:US-06-animation-within-500ms
 *   @ac:US-06-reduced-motion
 *   @ac:US-06-shape-distinguishable
 *   @ac:US-06-no-a11y-regression (no-regression sanity; main spec is tests/a11y/four-canonical-states.spec.ts)
 *   @ac:US-06-text-contrast
 *   @ac:US-06-cls-budget
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { seedMoves } from '../support/store-hook';

const WIN_TOP_ROW: readonly (readonly [number, number])[] = [
  [0, 0], // X
  [2, 0], // O
  [0, 1], // X
  [2, 1], // O
  [0, 2], // X wins top row
];

test.describe('@slice:06 — winning-line animation', () => {
  test('animated win line appears across three winning cells and completes within 500ms', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, WIN_TOP_ROW);

    const winLine = page.getByTestId('win-line');
    await expect(winLine).toBeVisible();

    // Animation completes within 500ms — wait for all animations on the node to finish.
    const started = Date.now();
    await page.evaluate(async () => {
      const el = document.querySelector('[data-testid="win-line"]');
      if (!el) throw new Error('win-line not found');
      // Gather all running animations (CSS transitions and keyframes).
      const anims = (el as Element & { getAnimations?: () => Animation[] }).getAnimations?.() ?? [];
      await Promise.all(anims.map((a) => a.finished.catch(() => undefined)));
    });
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(600); // 500ms budget + 100ms slack for test harness

    // Overlay is absolutely positioned so it doesn't move grid children.
    const position = await winLine.evaluate((node) => getComputedStyle(node).position);
    expect(['absolute', 'fixed']).toContain(position);
  });

  test('prefers-reduced-motion: reduce shows static overlay with no motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, WIN_TOP_ROW);

    const winLine = page.getByTestId('win-line');
    await expect(winLine).toBeVisible();

    // Under reduced-motion: animation is disabled. Either no Animation objects are
    // attached, or all of them are already finished (currentTime >= effect.endTime).
    const motionState = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="win-line"]');
      if (!el) return { found: false, anyActive: false };
      const anims = (el as Element & { getAnimations?: () => Animation[] }).getAnimations?.() ?? [];
      const anyActive = anims.some((a) => a.playState === 'running');
      return { found: true, anyActive };
    });
    expect(motionState.found).toBe(true);
    expect(motionState.anyActive).toBe(false);
  });

  test('X and O cells are distinguishable by text shape, not color only', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, [
      [0, 0], // X
      [1, 1], // O
    ]);

    const xCell = page.getByTestId('cell-0-0');
    const oCell = page.getByTestId('cell-1-1');

    // Distinguishable by text content alone (shape, not color).
    await expect(xCell).toHaveText('X');
    await expect(oCell).toHaveText('O');
  });

  test('axe-core: no accessibility regression in won state', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, WIN_TOP_ROW);
    await expect(page.getByTestId('result-banner')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core color-contrast passes on in-progress and won states', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    // in-progress check
    await seedMoves(page, [
      [0, 0],
      [1, 1],
    ]);
    const midResults = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(midResults.violations).toEqual([]);

    // won check
    await seedMoves(page, [
      [0, 1],
      [2, 2],
      [0, 2],
    ]);
    await expect(page.getByTestId('result-banner')).toBeVisible();
    const wonResults = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(wonResults.violations).toEqual([]);
  });

  test('winning-line animation does not shift layout (CLS <= 0.1)', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');

    // Start observing layout shifts BEFORE the win-line appears.
    await page.evaluate(() => {
      (window as unknown as { __clsSum: number }).__clsSum = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shiftEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!shiftEntry.hadRecentInput) {
            (window as unknown as { __clsSum: number }).__clsSum += shiftEntry.value ?? 0;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    });

    // Capture the grid box before win.
    const gridBefore = await page.getByRole('grid').boundingBox();

    await seedMoves(page, WIN_TOP_ROW);
    await expect(page.getByTestId('win-line')).toBeVisible();

    // Wait for animation to settle.
    await page.waitForTimeout(600);

    const gridAfter = await page.getByRole('grid').boundingBox();
    expect(gridBefore).not.toBeNull();
    expect(gridAfter).not.toBeNull();
    // Grid box unchanged: zero layout shift from the overlay insertion.
    expect(gridAfter!.x).toBe(gridBefore!.x);
    expect(gridAfter!.y).toBe(gridBefore!.y);
    expect(gridAfter!.width).toBe(gridBefore!.width);
    expect(gridAfter!.height).toBe(gridBefore!.height);

    const cls = (await page.evaluate(
      () => (window as unknown as { __clsSum: number }).__clsSum,
    )) as number;
    expect(cls).toBeLessThanOrEqual(0.1);
  });
});
