/**
 * Pure keyboard-input helpers.
 *
 * Kept separate from keyboard.ts (which touches the DOM) so vitest can cover
 * the intent mapping and focus arithmetic without a jsdom environment.
 */

export type Direction = 'left' | 'right' | 'up' | 'down';

export type KeyIntent =
  | { readonly kind: 'move'; readonly direction: Direction }
  | { readonly kind: 'activate' };

/**
 * Map a KeyboardEvent.key (or .code for Space) to a KeyIntent. Returns null
 * when the key is not part of the grid's keyboard protocol.
 */
export const keyToIntent = (key: string): KeyIntent | null => {
  switch (key) {
    case 'ArrowLeft':
      return { kind: 'move', direction: 'left' };
    case 'ArrowRight':
      return { kind: 'move', direction: 'right' };
    case 'ArrowUp':
      return { kind: 'move', direction: 'up' };
    case 'ArrowDown':
      return { kind: 'move', direction: 'down' };
    case 'Enter':
    case ' ':
    case 'Space':
      return { kind: 'activate' };
    default:
      return null;
  }
};

const clamp = (value: number): number => (value < 0 ? 0 : value > 2 ? 2 : value);

/**
 * Compute the next focused cell coordinate for a given direction.
 * Non-wrapping: edge moves return the same coordinate.
 */
export const nextFocusFor = (
  from: readonly [number, number],
  direction: Direction,
): readonly [number, number] => {
  const [row, col] = from;
  switch (direction) {
    case 'left':
      return [row, clamp(col - 1)];
    case 'right':
      return [row, clamp(col + 1)];
    case 'up':
      return [clamp(row - 1), col];
    case 'down':
      return [clamp(row + 1), col];
  }
};
