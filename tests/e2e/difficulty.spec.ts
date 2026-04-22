/**
 * Slice 04 difficulty-level acceptance tests.
 *
 * Source of truth: docs/feature/tic-tac-toe/distill/feature-difficulty-levels.feature
 * Driving port: real browser via Playwright (Strategy C — real local adapters).
 *
 * Each test() corresponds to exactly one non-property @slice:04 Gherkin scenario.
 * The two @tool:vitest-property scenarios are covered by tests/property/*.test.ts.
 */
import { test, expect, type Page } from '@playwright/test';
import { seedMoves } from '../support/store-hook';

const goToApp = async (page: Page, aiOff = false): Promise<void> => {
  await page.goto(aiOff ? '/tic-tac-toe/?ai=off' : '/tic-tac-toe/');
};

test.describe('@slice:04 — difficulty control visible with medium selected by default', () => {
  test('radiogroup with three options easy / medium / perfect is visible; medium selected', async ({
    page,
  }) => {
    await goToApp(page);
    const group = page.getByRole('radiogroup', { name: /difficulty/i });
    await expect(group).toBeVisible();

    const easy = page.getByRole('radio', { name: /easy/i });
    const medium = page.getByRole('radio', { name: /medium/i });
    const perfect = page.getByRole('radio', { name: /perfect/i });
    await expect(easy).toBeVisible();
    await expect(medium).toBeVisible();
    await expect(perfect).toBeVisible();

    await expect(medium).toHaveAttribute('aria-checked', 'true');
    await expect(easy).toHaveAttribute('aria-checked', 'false');
    await expect(perfect).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('@slice:04 — keyboard switch to perfect announces "Difficulty: perfect"', () => {
  test('pressing 3 from anywhere selects perfect and announces it within 1s', async ({ page }) => {
    await goToApp(page, true);
    await page.keyboard.press('3');

    const perfect = page.getByRole('radio', { name: /perfect/i });
    await expect(perfect).toHaveAttribute('aria-checked', 'true');

    const announce = page.locator('#announce');
    await expect(announce).toHaveText(/Difficulty:\s*perfect/i, { timeout: 1000 });
  });
});

test.describe('@slice:04 — difficulty control disabled mid-game', () => {
  test('after a human X is placed, radios are aria-disabled and changing difficulty is rejected', async ({
    page,
  }) => {
    await goToApp(page, true);
    await seedMoves(page, [[1, 1]]); // X at center, game in progress

    const radios = page.getByRole('radio');
    const count = await radios.count();
    for (let index = 0; index < count; index += 1) {
      await expect(radios.nth(index)).toHaveAttribute('aria-disabled', 'true');
    }

    // Shortcut should be a no-op mid-game.
    await page.keyboard.press('3');
    await expect(page.getByRole('radio', { name: /medium/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.getByRole('radio', { name: /perfect/i })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});

test.describe('@slice:04 — difficulty control re-enabled at terminal state', () => {
  test('after a terminal win the radios are no longer aria-disabled', async ({ page }) => {
    await goToApp(page, true);
    await seedMoves(page, [
      [0, 0], // X
      [2, 0], // O
      [0, 1], // X
      [2, 1], // O
      [0, 2], // X wins top row
    ]);
    await expect(page.getByTestId('result-banner')).toBeVisible();
    const radios = page.getByRole('radio');
    const count = await radios.count();
    for (let index = 0; index < count; index += 1) {
      await expect(radios.nth(index)).toHaveAttribute('aria-disabled', 'false');
    }
  });
});

test.describe('@slice:04 — medium AI blocks an immediate three-in-a-row threat', () => {
  test('with X at [0,0] and [0,1], medium O plays [0,2] to block', async ({ page }) => {
    await goToApp(page, true);
    // Seed board state: X at two top cells, O at non-threatening (1,0),
    // then X threatens top row; medium must block at (0,2).
    await seedMoves(page, [
      [0, 0], // X
      [1, 0], // O (non-threatening)
      [0, 1], // X — now threatens top row
    ]);
    // Now turn is O. Enable AI and trigger a placement via the ai=off override?
    // Simpler: drive medium directly via exposed strategy. Use page.evaluate.
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const state = w.__store.getState();
      const [row, col] = w.__strategies.medium(state.board, 'O');
      w.__store.dispatch({ type: 'PLACE_MARK', row, col });
    });
    await expect(page.getByTestId('cell-0-2')).toHaveText('O');
  });
});

test.describe('@slice:04 — medium AI completes its own winning line', () => {
  test('with O at [0,0] and [0,1], medium O plays [0,2] to win', async ({ page }) => {
    await goToApp(page, true);
    // Build: O has two in a row. Need legal alternating board — force via structure.
    // X moves first; construct: X_1,0  O_0,0  X_2,0  O_0,1 — X threatens col 0, but
    // more relevant: it is O's turn; O has [0,0] and [0,1]; playing [0,2] wins
    // (also blocks X's col-0). Win > block tiebreak covered by this case.
    await seedMoves(page, [
      [1, 0], // X
      [0, 0], // O
      [2, 1], // X (non-threatening)
      [0, 1], // O — now has top row pair
      [2, 2], // X
    ]);
    // It is O's turn. Medium must take the win at (0,2).
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const state = w.__store.getState();
      const [row, col] = w.__strategies.medium(state.board, 'O');
      w.__store.dispatch({ type: 'PLACE_MARK', row, col });
    });
    await expect(page.getByTestId('cell-0-2')).toHaveText('O');
    await expect(page.getByTestId('result-banner')).toHaveText('AI wins.');
  });
});

test.describe('@slice:04 — selected difficulty persists across Play again', () => {
  test('selecting perfect then Play again keeps perfect selected and applies to new game', async ({
    page,
  }) => {
    await goToApp(page, true);
    await page.keyboard.press('3'); // select perfect
    await expect(page.getByRole('radio', { name: /perfect/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // Drive to terminal.
    await seedMoves(page, [
      [0, 0],
      [2, 0],
      [0, 1],
      [2, 1],
      [0, 2],
    ]);
    await expect(page.getByTestId('play-again')).toBeFocused();
    await page.getByTestId('play-again').click();

    // New game, perfect still selected.
    await expect(page.getByRole('radio', { name: /perfect/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.locator('#app')).toHaveAttribute('data-difficulty', 'perfect');
  });
});

test.describe('@slice:04 — easy AI plays into empty cells only', () => {
  test('over 20 human plays the AI only ever places O on cells that were empty', async ({
    page,
  }) => {
    await goToApp(page);
    // Switch to easy via the keyboard shortcut.
    await page.keyboard.press('1');
    await expect(page.getByRole('radio', { name: /easy/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    let humanPlaysCompleted = 0;
    while (humanPlaysCompleted < 20) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshot = await page.evaluate(() => (window as any).__store.getState());
      if (snapshot.result.status !== 'in_progress') {
        // Terminal — reset and keep playing.
        await page.getByTestId('play-again').click();
        continue;
      }
      if (snapshot.turn !== 'X') {
        // AI turn — let the microtask run, then re-check.
        await page.waitForTimeout(30);
        continue;
      }
      // Find the first empty cell and click it.
      let target: [number, number] | null = null;
      for (let row = 0; row < 3 && target === null; row += 1) {
        for (let col = 0; col < 3 && target === null; col += 1) {
          if (snapshot.board[row][col] === null) target = [row, col];
        }
      }
      if (target === null) break; // board full without terminal (shouldn't happen)
      // `preSnapshot` is the state right before we click — x at target must be null.
      expect(snapshot.board[target[0]][target[1]]).toBeNull();
      await page.getByTestId(`cell-${target[0]}-${target[1]}`).click();
      await page.waitForTimeout(30);
      // Post-click state: X is now at target. If AI has moved, find the new O
      // and assert it landed in a cell that was null in `snapshot` (empty pre-click).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const after = await page.evaluate(() => (window as any).__store.getState());
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          // NEW O since pre-click snapshot: pre-click cell must have been null.
          if (
            after.board[row][col] === 'O' &&
            snapshot.board[row][col] !== 'O' &&
            snapshot.board[row][col] !== null
          ) {
            throw new Error(`AI placed O on non-empty cell [${row},${col}]`);
          }
        }
      }
      humanPlaysCompleted += 1;
    }
    expect(humanPlaysCompleted).toBe(20);
  });
});
