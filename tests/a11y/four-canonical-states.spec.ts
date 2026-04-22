/**
 * Slice 03 axe-core acceptance — four canonical states.
 *
 * Source of truth: docs/feature/tic-tac-toe/distill/feature-keyboard-aria.feature
 *   @ac:US-03-axe-empty / mid-game / won / draw
 *
 * Each test drives the app into the target canonical state through the store
 * test hook (the same driving port used by the walking-skeleton tests) and
 * asserts zero axe-core violations against the rendered page.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { seedMoves } from '../support/store-hook';

test.describe('axe-core — four canonical states @slice:03', () => {
  test('empty board passes axe with zero violations', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await expect(page.getByRole('grid')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('mid-game board (4 cells filled, in progress) passes axe with zero violations', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, [
      [0, 0], // X
      [1, 1], // O
      [0, 1], // X
      [2, 2], // O — 4 cells filled, no winner, in progress
    ]);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('won board passes axe with zero violations', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, [
      [0, 0],
      [2, 0],
      [0, 1],
      [2, 1],
      [0, 2], // X wins top row
    ]);
    await expect(page.getByTestId('result-banner')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('draw board passes axe with zero violations', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, [
      [0, 0], // X
      [0, 1], // O
      [0, 2], // X
      [1, 2], // O
      [1, 0], // X
      [2, 0], // O
      [1, 1], // X
      [2, 2], // O
      [2, 1], // X — draw
    ]);
    await expect(page.getByTestId('result-banner')).toHaveText('Draw.');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
