/**
 * Slice 05 hot-seat mode acceptance tests.
 *
 * Source of truth: docs/feature/tic-tac-toe/distill/feature-hot-seat.feature
 * Driving port: real browser via Playwright.
 *
 * Each test() corresponds to one @slice:05 Gherkin scenario. The shared-win-
 * detector Scenario Outline expands to 4 explicit cases. Total: 13 tests.
 */
import { test, expect, type Page } from '@playwright/test';
import { seedMoves } from '../support/store-hook';

const goToApp = async (page: Page, aiOff = true): Promise<void> => {
  await page.goto(aiOff ? '/tic-tac-toe/?ai=off' : '/tic-tac-toe/');
};

const switchToHotSeat = async (page: Page): Promise<void> => {
  await page.getByRole('radio', { name: /^Mode: hot-seat$/i }).click();
};

test.describe('@slice:05 — hot-seat toggle visible from solo', () => {
  test('mode toggle exposes Solo and Hot-seat as keyboard-focusable radios, Solo checked by default', async ({
    page,
  }) => {
    await goToApp(page);
    const group = page.getByRole('radiogroup', { name: /^Mode$/i });
    await expect(group).toBeVisible();

    const solo = page.getByRole('radio', { name: /^Mode: solo$/i });
    const hotSeat = page.getByRole('radio', { name: /^Mode: hot-seat$/i });
    await expect(solo).toBeVisible();
    await expect(hotSeat).toBeVisible();
    await expect(solo).toHaveAttribute('aria-checked', 'true');
    await expect(hotSeat).toHaveAttribute('aria-checked', 'false');

    // Visual-verification gate: selected radio must be visually distinguished
    // from the unselected one (not plain stacked text).
    const selectedBg = await solo.evaluate((el) => getComputedStyle(el).backgroundColor);
    const unselectedBg = await hotSeat.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(selectedBg).not.toBe(unselectedBg);

    // Keyboard-focusable.
    await solo.focus();
    await expect(solo).toBeFocused();
  });
});

test.describe('@slice:05 — switch to hot-seat resets board and shows P1 vocabulary', () => {
  test('activating hot-seat clears the board and the turn indicator reads "P1\'s turn (X)."', async ({
    page,
  }) => {
    await goToApp(page);
    await switchToHotSeat(page);

    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'hot-seat');
    // Board is empty.
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        await expect(page.getByTestId(`cell-${row}-${col}`)).toHaveText('');
      }
    }
    await expect(page.getByTestId('turn-indicator')).toHaveText("P1's turn (X).");
  });
});

test.describe('@slice:05 — P1 places X, turn advances to P2, no AI move', () => {
  test('after P1 clicks center the turn indicator reads "P2\'s turn (O)." and center-only is filled', async ({
    page,
  }) => {
    await goToApp(page);
    await switchToHotSeat(page);
    await page.getByTestId('cell-1-1').click();

    await expect(page.getByTestId('cell-1-1')).toHaveText('X');
    await expect(page.getByTestId('turn-indicator')).toHaveText("P2's turn (O).");
    // No AI placed O anywhere.
    // Wait briefly to make sure the microtask scheduler had a chance to fire.
    await page.waitForTimeout(50);
    const oCount = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (window as any).__store.getState();
      let n = 0;
      for (const row of state.board) for (const cell of row) if (cell === 'O') n += 1;
      return n;
    });
    expect(oCount).toBe(0);
  });
});

test.describe('@slice:05 — P2 places O, turn returns to P1, no AI move', () => {
  test('P2 click places O and indicator returns to "P1\'s turn (X)."', async ({ page }) => {
    await goToApp(page);
    await switchToHotSeat(page);
    await page.getByTestId('cell-1-1').click(); // P1 X center
    await page.getByTestId('cell-0-0').click(); // P2 O top-left

    await expect(page.getByTestId('cell-0-0')).toHaveText('O');
    await expect(page.getByTestId('turn-indicator')).toHaveText("P1's turn (X).");
    await page.waitForTimeout(50);
    const oCount = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (window as any).__store.getState();
      let n = 0;
      for (const row of state.board) for (const cell of row) if (cell === 'O') n += 1;
      return n;
    });
    expect(oCount).toBe(1);
  });
});

test.describe('@slice:05 — P1 wins banner uses P1 vocabulary', () => {
  test('completing top row yields "P1 wins!" banner, Play again focused, mode toggle re-enabled', async ({
    page,
  }) => {
    await goToApp(page);
    await switchToHotSeat(page);
    await seedMoves(page, [
      [0, 0], // P1 X
      [1, 0], // P2 O
      [0, 1], // P1 X
      [1, 1], // P2 O
      [0, 2], // P1 X wins top row
    ]);
    await expect(page.getByTestId('result-banner')).toHaveText('P1 wins!');
    await expect(page.getByTestId('play-again')).toBeFocused();
    const soloRadio = page.getByRole('radio', { name: /^Mode: solo$/i });
    await expect(soloRadio).toHaveAttribute('aria-disabled', 'false');
  });
});

test.describe('@slice:05 — P2 wins banner uses P2 vocabulary', () => {
  test('P2 completing middle row yields "P2 wins!"', async ({ page }) => {
    await goToApp(page);
    await switchToHotSeat(page);
    await seedMoves(page, [
      [0, 0], // P1 X
      [1, 1], // P2 O
      [2, 2], // P1 X
      [1, 2], // P2 O
      [0, 2], // P1 X
      [1, 0], // P2 O completes middle row
    ]);
    await expect(page.getByTestId('result-banner')).toHaveText('P2 wins!');
    await expect(page.getByTestId('play-again')).toBeFocused();
  });
});

test.describe('@slice:05 — draw yields generic Draw banner', () => {
  test('hot-seat draw shows "Draw."', async ({ page }) => {
    await goToApp(page);
    await switchToHotSeat(page);
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
    await expect(page.getByTestId('play-again')).toBeFocused();
  });
});

test.describe('@slice:05 — mode toggle disabled once play started, board preserved', () => {
  test('after first mark, mode radios are aria-disabled and clicking solo is a no-op', async ({
    page,
  }) => {
    await goToApp(page);
    await switchToHotSeat(page);
    await page.getByTestId('cell-1-1').click(); // P1 X

    const soloRadio = page.getByRole('radio', { name: /^Mode: solo$/i });
    const hotSeatRadio = page.getByRole('radio', { name: /^Mode: hot-seat$/i });
    await expect(soloRadio).toHaveAttribute('aria-disabled', 'true');
    await expect(hotSeatRadio).toHaveAttribute('aria-disabled', 'true');

    // Click on disabled radio must be a no-op (board preserved).
    await soloRadio.click({ force: true });
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'hot-seat');
    await expect(page.getByTestId('cell-1-1')).toHaveText('X');
  });
});

test.describe('@slice:05 — Play again preserves hot-seat mode', () => {
  test('post-terminal Play again keeps hot-seat and returns to P1', async ({ page }) => {
    await goToApp(page);
    await switchToHotSeat(page);
    await seedMoves(page, [
      [0, 0], // P1 X
      [1, 0], // P2 O
      [0, 1], // P1 X
      [1, 1], // P2 O
      [0, 2], // P1 X wins
    ]);
    await expect(page.getByTestId('result-banner')).toHaveText('P1 wins!');
    await page.getByTestId('play-again').click();

    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'hot-seat');
    await expect(page.getByTestId('turn-indicator')).toHaveText("P1's turn (X).");
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        await expect(page.getByTestId(`cell-${row}-${col}`)).toHaveText('');
      }
    }
  });
});

test.describe('global shortcuts survive Play-again focus transitions', () => {
  // Regression: after clicking Play again, focus briefly passes through <body>
  // as the button is removed from the DOM. H and 1/2/3 are documented as
  // "global" shortcuts; previously the keydown listener was bound to #app,
  // so the shortcut silently no-op'd whenever focus left the app root. These
  // tests lock in the document-level binding.

  test('H toggles mode immediately after clicking Play again (solo → hot-seat → solo)', async ({
    page,
  }) => {
    await goToApp(page);
    await seedMoves(page, [
      [0, 0], // X
      [1, 0], // O
      [0, 1], // X
      [1, 1], // O
      [0, 2], // X wins
    ]);
    await expect(page.getByTestId('result-banner')).toHaveText('You win!');
    await page.getByTestId('play-again').click();
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'solo');

    // Press H with no explicit focus action — should toggle to hot-seat.
    await page.keyboard.press('h');
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'hot-seat');

    // And again — should toggle back.
    await page.keyboard.press('H');
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'solo');
  });

  test('digit shortcuts switch difficulty immediately after clicking Play again', async ({
    page,
  }) => {
    await goToApp(page);
    await seedMoves(page, [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ]);
    await page.getByTestId('play-again').click();
    await expect(page.locator('#app')).toHaveAttribute('data-difficulty', 'medium');

    await page.keyboard.press('3');
    await expect(page.locator('#app')).toHaveAttribute('data-difficulty', 'perfect');

    await page.keyboard.press('1');
    await expect(page.locator('#app')).toHaveAttribute('data-difficulty', 'easy');
  });
});

// Scenario Outline — 4 cases.
type Move = readonly [number, number];
interface OutlineCase {
  label: string;
  player: 1 | 2;
  banner: string;
  moves: readonly Move[];
}
const outlineCases: readonly OutlineCase[] = [
  {
    label: 'top row',
    player: 1,
    banner: 'P1 wins!',
    moves: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
  },
  {
    label: 'middle column',
    player: 2,
    banner: 'P2 wins!',
    moves: [
      [0, 0],
      [0, 1],
      [2, 0],
      [1, 1],
      [0, 2],
      [2, 1],
    ],
  },
  {
    label: 'top-left diagonal',
    player: 1,
    banner: 'P1 wins!',
    moves: [
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 2],
      [2, 2],
    ],
  },
  {
    label: 'top-right diagonal',
    player: 2,
    banner: 'P2 wins!',
    moves: [
      [0, 0],
      [0, 2],
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 0],
    ],
  },
];

for (const { label, player, banner, moves } of outlineCases) {
  test.describe(`@slice:05 — shared win detector recognises ${label}`, () => {
    test(`P${player} wins on ${label} and banner reads "${banner}"`, async ({ page }) => {
      await goToApp(page);
      await switchToHotSeat(page);
      await seedMoves(page, moves);
      await expect(page.getByTestId('result-banner')).toHaveText(banner);
    });
  });
}

test.describe('@slice:05 @a11y — keyboard-only hot-seat game reaches terminal state', () => {
  test('arrow keys + Enter complete a hot-seat game, banner + focus behaviour match solo', async ({
    page,
  }) => {
    await goToApp(page);
    await switchToHotSeat(page);

    // Plan (keyboard-only): P1 wins top row.
    //   P1 X at (0,0), P2 O at (1,0), P1 X at (0,1), P2 O at (1,1), P1 X at (0,2) — WIN.
    // Focus starts at some cell; we navigate from the center (auto-focused on mount).
    const press = async (key: string): Promise<void> => {
      await page.keyboard.press(key);
    };

    // Focus the center (1,1) then navigate. Auto-focus may already put us there,
    // but .focus() guarantees the starting point.
    await page.getByTestId('cell-1-1').focus();

    // From (1,1): P1 X at (0,0) — Up, Left, Enter.
    await press('ArrowUp');
    await press('ArrowLeft');
    await press('Enter'); // X (0,0)

    // From (0,0): P2 O at (1,0) — Down, Enter.
    await press('ArrowDown');
    await press('Enter'); // O (1,0)

    // From (1,0): P1 X at (0,1) — Up, Right, Enter.
    await press('ArrowUp');
    await press('ArrowRight');
    await press('Enter'); // X (0,1)

    // From (0,1): P2 O at (1,1) — Down, Enter.
    await press('ArrowDown');
    await press('Enter'); // O (1,1)

    // From (1,1): P1 X at (0,2) — Up, Right, Enter. Completes top row.
    await press('ArrowUp');
    await press('ArrowRight');
    await press('Enter'); // X (0,2) — P1 WINS

    await expect(page.getByTestId('result-banner')).toHaveText('P1 wins!');
    await expect(page.getByTestId('play-again')).toBeFocused();
  });
});
