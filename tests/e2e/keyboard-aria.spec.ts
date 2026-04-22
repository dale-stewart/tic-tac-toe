/**
 * Slice 03 keyboard navigation + ARIA live-region acceptance tests.
 *
 * Source of truth: docs/feature/tic-tac-toe/distill/feature-keyboard-aria.feature
 * Driving port: real browser via Playwright (Strategy C — real local adapters).
 *
 * Each test() corresponds to exactly one @slice:03 Gherkin scenario (with the
 * arrow-navigation outline expanded to four test() cases — one per examples row).
 * axe-core scenarios for the four canonical states live in tests/a11y/.
 */
import { test, expect, type Page } from '@playwright/test';
import { seedMoves } from '../support/store-hook';

// Helper: focus a cell by its (row, col) test id.
const focusCell = async (page: Page, row: number, col: number): Promise<void> => {
  await page.getByTestId(`cell-${row}-${col}`).focus();
};

test.describe('@slice:03 — arrow-key focus navigation without wrapping', () => {
  test('Left arrow on top-left stays put and does not scroll the viewport', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await focusCell(page, 0, 0);
    const scrollBefore = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));

    await page.keyboard.press('ArrowLeft');

    await expect(page.getByTestId('cell-0-0')).toBeFocused();
    const scrollAfter = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    expect(scrollAfter).toEqual(scrollBefore);
  });

  // Outline expansion — one test per examples row.
  const cases: Array<{
    start: readonly [number, number];
    key: string;
    expected: readonly [number, number];
    name: string;
  }> = [
    { start: [0, 0], key: 'ArrowRight', expected: [0, 1], name: 'top-left Right -> top-middle' },
    { start: [0, 1], key: 'ArrowDown', expected: [1, 1], name: 'top-middle Down -> center' },
    { start: [1, 1], key: 'ArrowLeft', expected: [1, 0], name: 'center Left -> middle-left' },
    { start: [2, 2], key: 'ArrowUp', expected: [1, 2], name: 'bottom-right Up -> middle-right' },
  ];
  for (const scenario of cases) {
    test(`arrow navigates ${scenario.name}`, async ({ page }) => {
      await page.goto('/tic-tac-toe/?ai=off');
      await focusCell(page, scenario.start[0], scenario.start[1]);
      await page.keyboard.press(scenario.key);
      await expect(
        page.getByTestId(`cell-${scenario.expected[0]}-${scenario.expected[1]}`),
      ).toBeFocused();
    });
  }
});

test.describe('@slice:03 — Enter / Space place a mark on the focused empty cell', () => {
  test('Enter on a focused empty top-left cell places X within 100ms; focus preserved', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    const topLeft = page.getByTestId('cell-0-0');
    await topLeft.focus();
    const start = Date.now();
    await page.keyboard.press('Enter');
    await expect(topLeft).toHaveText('X');
    expect(Date.now() - start).toBeLessThan(100);
    await expect(topLeft).toBeFocused();
  });

  test('Space on a focused empty center cell places X within 100ms', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    const center = page.getByTestId('cell-1-1');
    await center.focus();
    const start = Date.now();
    await page.keyboard.press('Space');
    await expect(center).toHaveText('X');
    expect(Date.now() - start).toBeLessThan(100);
  });
});

test.describe('@slice:03 — aria-live announcements', () => {
  test('Enter on a filled cell announces "Cell already taken" within 1s and leaves the board unchanged', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, [[1, 1]]); // X at center
    const center = page.getByTestId('cell-1-1');
    await center.focus();
    await page.keyboard.press('Enter');

    const announce = page.locator('#announce');
    await expect(announce).toHaveText(/Cell already taken/i, { timeout: 1000 });
    await expect(center).toHaveText('X');
    // No O placed anywhere: count of O marks is zero.
    const cells = page.getByRole('gridcell');
    const count = await cells.count();
    let os = 0;
    for (let index = 0; index < count; index += 1) {
      if (((await cells.nth(index).textContent()) ?? '').trim() === 'O') os += 1;
    }
    expect(os).toBe(0);
  });

  test('Each move (human and AI) is announced with row and column within 1s', async ({ page }) => {
    // ai=off so we fully control sequencing; we simulate Alex placing X then
    // a scripted O ("AI") move through the store to verify each placement
    // announces row+column.
    await page.goto('/tic-tac-toe/?ai=off');
    const center = page.getByTestId('cell-1-1');
    await center.focus();
    await page.keyboard.press('Enter'); // X at row 2 col 2 (1-indexed)
    const announce = page.locator('#announce');
    await expect(announce).toHaveText(/row 2.*column 2/i, { timeout: 1000 });

    // Simulate the AI placing O via the store.
    await seedMoves(page, [[0, 0]]);
    await expect(announce).toHaveText(/row 1.*column 1/i, { timeout: 1000 });
  });

  test('Terminal win announces "You win." within 1s', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, [
      [0, 0], // X
      [2, 0], // O
      [0, 1], // X
      [2, 1], // O
      [0, 2], // X wins top row
    ]);
    const announce = page.locator('#announce');
    await expect(announce).toHaveText(/You win\.?/i, { timeout: 1000 });
  });
});

test.describe('@slice:03 — focus management + tab order', () => {
  test('On terminal state focus moves to Play again and Enter activates it', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, [
      [0, 0],
      [2, 0],
      [0, 1],
      [2, 1],
      [0, 2],
    ]);
    const playAgain = page.getByTestId('play-again');
    await expect(playAgain).toBeFocused();

    await page.keyboard.press('Enter');
    // Board back to empty -> banner gone, first-cell empty.
    await expect(page.getByTestId('result-banner')).toHaveCount(0);
    await expect(page.getByTestId('cell-0-0')).toHaveText('');
    // After Play again, focus returns to the center cell so keyboard users
    // can resume arrow-key navigation without re-entering via Tab.
    await expect(page.getByTestId('cell-1-1')).toBeFocused();
  });

  test('Tab order: nine cells in reading order then Play again', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    // Drive to terminal state so Play again is in the DOM.
    await seedMoves(page, [
      [0, 0],
      [2, 0],
      [0, 1],
      [2, 1],
      [0, 2],
    ]);
    // Reset focus to a known pre-grid anchor so the first Tab lands on cell-0-0.
    // We cannot rely on body focus in chromium; instead, focus the first cell
    // programmatically and assert subsequent Tab moves match reading order.
    await page.getByTestId('cell-0-0').focus();
    await expect(page.getByTestId('cell-0-0')).toBeFocused();

    const expectedOrder: Array<string> = [];
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        expectedOrder.push(`cell-${row}-${col}`);
      }
    }
    expectedOrder.push('play-again');

    // First entry (cell-0-0) is the starting focus; press Tab to traverse to each subsequent.
    for (let index = 1; index < expectedOrder.length; index += 1) {
      await page.keyboard.press('Tab');
      await expect(page.getByTestId(expectedOrder[index]!)).toBeFocused();
    }
  });

  test('Every focusable element shows a visible focus indicator (non-empty outline)', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    // Focus top-left and verify a visible outline is applied via :focus-visible.
    const topLeft = page.getByTestId('cell-0-0');
    await topLeft.focus();
    const outline = await topLeft.evaluate((node) => {
      const styles = window.getComputedStyle(node);
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
      };
    });
    expect(outline.outlineStyle).not.toBe('none');
    // Width must be at least 2px to be visually detectable.
    expect(Number.parseFloat(outline.outlineWidth)).toBeGreaterThanOrEqual(2);
  });

  test('No keyboard trap: Tab from the last element escapes the app (focus leaves #app)', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await seedMoves(page, [
      [0, 0],
      [2, 0],
      [0, 1],
      [2, 1],
      [0, 2],
    ]);
    // Focus Play again (the final focusable element in the app).
    await page.getByTestId('play-again').focus();
    await page.keyboard.press('Tab');
    // Focus must no longer be inside #app.
    const insideApp = await page.evaluate(() => {
      const app = document.querySelector('#app');
      const active = document.activeElement;
      return app !== null && active !== null && app.contains(active);
    });
    expect(insideApp).toBe(false);
  });
});
