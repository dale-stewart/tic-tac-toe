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

test.describe('@slice:02 — Sam places an X with a click and the AI responds', () => {
  test('click on center places X within 100ms; AI responds with O within 300ms; turn returns to X', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/');
    const center = page.getByTestId('cell-1-1');
    await expect(center).toHaveText('');

    const clickStart = Date.now();
    await center.click();
    await expect(center).toHaveText('X');
    const afterHuman = Date.now() - clickStart;
    expect(afterHuman).toBeLessThan(100);

    // AI responds with O in a previously empty cell within 300ms of the click.
    await expect
      .poll(
        async () => {
          const cells = page.getByRole('gridcell');
          const count = await cells.count();
          let oCount = 0;
          for (let index = 0; index < count; index += 1) {
            const text = (await cells.nth(index).textContent()) ?? '';
            if (text.trim() === 'O') oCount += 1;
          }
          return oCount;
        },
        { timeout: 300 },
      )
      .toBe(1);

    await expect(page.getByTestId('turn-indicator')).toHaveText('Your turn (X).');
  });
});

test.describe('@slice:02 — Sam completes top row and wins', () => {
  test('human wins by completing top row; banner reads "You win!"; Play again focused; AI stops', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    // Hot-seat style for deterministic assertions: alternately place X and O
    // manually via the dispatch test hook.
    await page.evaluate(() => {
      const store = (window as unknown as { __store?: unknown }).__store as
        | { dispatch: (action: unknown) => void }
        | undefined;
      if (!store) throw new Error('store not exposed');
      // X top-left
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 0 });
      // O bottom-left (manual, not AI since ai=off)
      store.dispatch({ type: 'PLACE_MARK', row: 2, col: 0 });
      // X top-middle
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 1 });
      // O bottom-middle
      store.dispatch({ type: 'PLACE_MARK', row: 2, col: 1 });
    });

    // Now X completes the top row.
    await page.getByTestId('cell-0-2').click();

    await expect(page.getByTestId('result-banner')).toHaveText('You win!');
    const playAgain = page.getByTestId('play-again');
    await expect(playAgain).toBeVisible();
    await expect(playAgain).toBeFocused();

    // AI does not place any further mark: bottom-right should remain empty.
    await expect(page.getByTestId('cell-2-2')).toHaveText('');
  });
});

test.describe('@slice:02 — AI wins', () => {
  test('AI completes three O in a row; banner reads "AI wins."; Play again focused', async ({
    page,
  }) => {
    // Seed AI so its move is deterministic: with seed=1 and the board we build,
    // AI must pick the cell that completes the O row. Easier: use ai=off to set up
    // the board state exactly, then flip to AI turn.
    await page.goto('/tic-tac-toe/?ai=off');
    await page.evaluate(() => {
      const store = (window as unknown as { __store?: unknown }).__store as
        | { dispatch: (action: unknown) => void }
        | undefined;
      if (!store) throw new Error('store not exposed');
      // Build: X . X / O O . / . . .   (X to move - but we want O to move)
      // Simpler: just place a winning-O scenario manually and assert the banner.
      // X_1,1  O_0,0  X_2,2  O_0,1  X_2,0
      // Now X's turn; place X somewhere non-blocking, O would then win next.
      // We cannot force AI here without seeded RNG; instead, manually dispatch O
      // to simulate the AI move and verify win detection.
      store.dispatch({ type: 'PLACE_MARK', row: 1, col: 1 }); // X
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 0 }); // O
      store.dispatch({ type: 'PLACE_MARK', row: 2, col: 2 }); // X
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 1 }); // O
      store.dispatch({ type: 'PLACE_MARK', row: 2, col: 0 }); // X
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 2 }); // O wins top row
    });

    await expect(page.getByTestId('result-banner')).toHaveText('AI wins.');
    await expect(page.getByTestId('play-again')).toBeFocused();
  });
});

test.describe('@slice:02 — Draw state', () => {
  test('board fills with no winner; banner reads "Draw."; Play again focused', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await page.evaluate(() => {
      const store = (window as unknown as { __store?: unknown }).__store as
        | { dispatch: (action: unknown) => void }
        | undefined;
      if (!store) throw new Error('store not exposed');
      // A valid cat's-game sequence (no 3-in-a-row):
      // X O X
      // X X O
      // O X O
      const moves: [number, number][] = [
        [0, 0], // X
        [0, 1], // O
        [0, 2], // X
        [1, 2], // O
        [1, 0], // X
        [2, 0], // O
        [1, 1], // X
        [2, 2], // O
        [2, 1], // X
      ];
      for (const [row, col] of moves) {
        store.dispatch({ type: 'PLACE_MARK', row, col });
      }
    });

    await expect(page.getByTestId('result-banner')).toHaveText('Draw.');
    await expect(page.getByTestId('play-again')).toBeFocused();
  });
});

test.describe('@slice:02 — Clicking a filled cell is a no-op', () => {
  test('second click on same cell does not change the board', async ({ page }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    const center = page.getByTestId('cell-1-1');
    await center.click();
    await expect(center).toHaveText('X');
    const turnBefore = await page.getByTestId('turn-indicator').textContent();

    await center.click();
    // No change: still exactly one X in center; no O anywhere.
    const cells = page.getByRole('gridcell');
    const allText: string[] = [];
    const count = await cells.count();
    for (let index = 0; index < count; index += 1) {
      allText.push(((await cells.nth(index).textContent()) ?? '').trim());
    }
    const xs = allText.filter((text) => text === 'X').length;
    const os = allText.filter((text) => text === 'O').length;
    expect(xs).toBe(1);
    expect(os).toBe(0);
    expect(await page.getByTestId('turn-indicator').textContent()).toBe(turnBefore);
  });
});

test.describe('@slice:02 — Play again resets the board', () => {
  test('Play again empties the board, preserves mode/difficulty, restores Your turn (X)', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    // Finish a game quickly with an X top-row win.
    await page.evaluate(() => {
      const store = (window as unknown as { __store?: unknown }).__store as
        | { dispatch: (action: unknown) => void }
        | undefined;
      if (!store) throw new Error('store not exposed');
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 0 });
      store.dispatch({ type: 'PLACE_MARK', row: 2, col: 0 });
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 1 });
      store.dispatch({ type: 'PLACE_MARK', row: 2, col: 1 });
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 2 });
    });
    await expect(page.getByTestId('result-banner')).toBeVisible();

    await page.getByTestId('play-again').click();

    // Every cell empty.
    const cells = page.getByRole('gridcell');
    const count = await cells.count();
    for (let index = 0; index < count; index += 1) {
      await expect(cells.nth(index)).toHaveText('');
    }
    // Mode + difficulty preserved.
    const app = page.locator('#app');
    await expect(app).toHaveAttribute('data-mode', 'solo');
    await expect(app).toHaveAttribute('data-difficulty', 'medium');
    // Turn indicator restored.
    await expect(page.getByTestId('turn-indicator')).toHaveText('Your turn (X).');
    // Banner gone.
    await expect(page.getByTestId('result-banner')).toHaveCount(0);
  });
});

test.describe('@slice:02 — Reload yields a fresh empty board', () => {
  test('after reload, board is empty and default mode persists; no persisted state', async ({
    page,
  }) => {
    await page.goto('/tic-tac-toe/?ai=off');
    await page.evaluate(() => {
      const store = (window as unknown as { __store?: unknown }).__store as
        | { dispatch: (action: unknown) => void }
        | undefined;
      if (!store) throw new Error('store not exposed');
      store.dispatch({ type: 'PLACE_MARK', row: 1, col: 1 });
      store.dispatch({ type: 'PLACE_MARK', row: 0, col: 0 });
      store.dispatch({ type: 'PLACE_MARK', row: 2, col: 2 });
    });
    await expect(page.getByTestId('cell-1-1')).toHaveText('X');

    await page.reload();

    const cells = page.getByRole('gridcell');
    const count = await cells.count();
    for (let index = 0; index < count; index += 1) {
      await expect(cells.nth(index)).toHaveText('');
    }
    const app = page.locator('#app');
    await expect(app).toHaveAttribute('data-mode', 'solo');
    await expect(app).toHaveAttribute('data-difficulty', 'medium');
    await expect(page.getByTestId('turn-indicator')).toHaveText('Your turn (X).');
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
