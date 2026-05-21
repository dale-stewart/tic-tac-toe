import { describe, expect, it } from 'vitest';
import {
  classForTheme,
  DEFAULT_THEME,
  isTheme,
  nextToggleTheme,
  parseStoredTheme,
  themeLabelText,
  resolveInitialTheme,
  THEME_CLASSES,
  THEMES,
  themeFromClassName,
  type Theme,
} from '../../../src/theme-manager/theme-pure';

describe('theme-pure', () => {
  describe('isTheme', () => {
    it.each<[unknown, boolean]>([
      ['light', true],
      ['dark', true],
      ['retro', true],
      ['Light', false],
      ['', false],
      [null, false],
      [undefined, false],
      [42, false],
    ])('isTheme(%p) === %p', (value, expected) => {
      expect(isTheme(value)).toBe(expected);
    });
  });

  describe('parseStoredTheme', () => {
    it.each<Theme>(['light', 'dark', 'retro'])('keeps valid %s', (theme) => {
      expect(parseStoredTheme(theme)).toBe(theme);
    });

    it.each([[null], ['sepia'], ['']])('rejects %p as null', (raw) => {
      expect(parseStoredTheme(raw as string | null)).toBeNull();
    });
  });

  describe('THEMES', () => {
    it('lists every theme in light→dark→retro order', () => {
      expect(THEMES).toEqual(['light', 'dark', 'retro']);
    });
  });

  describe('classForTheme', () => {
    // Assert the literal class strings (not THEME_CLASSES[theme], which would
    // tautologically pass if the map values were mutated).
    it.each<[Theme, string]>([
      ['light', 'theme-light'],
      ['dark', 'theme-dark'],
      ['retro', 'theme-retro'],
    ])('maps %s to %p', (theme, className) => {
      expect(classForTheme(theme)).toBe(className);
      expect(THEME_CLASSES[theme]).toBe(className);
    });

    it('distinguishes every theme with a unique class', () => {
      const classes = THEMES.map(classForTheme);
      expect(new Set(classes).size).toBe(THEMES.length);
    });
  });

  describe('themeFromClassName', () => {
    it.each<[string, Theme]>([
      ['theme-dark', 'dark'],
      ['theme-retro', 'retro'],
      ['theme-light', 'light'],
      ['', 'light'],
      ['some-other-class', 'light'],
      ['game theme-dark active', 'dark'],
      ['theme-retro extra', 'retro'],
    ])('themeFromClassName(%p) === %p', (className, expected) => {
      expect(themeFromClassName(className)).toBe(expected);
    });

    it('does not match a class that merely contains a theme token as a substring', () => {
      expect(themeFromClassName('not-theme-dark-really')).toBe('light');
    });

    it('prefers dark over retro when both somehow present', () => {
      expect(themeFromClassName('theme-retro theme-dark')).toBe('dark');
    });
  });

  describe('resolveInitialTheme', () => {
    it.each<Theme>(['light', 'dark', 'retro'])('stored %s wins over OS preference', (stored) => {
      expect(resolveInitialTheme(stored, true)).toBe(stored);
      expect(resolveInitialTheme(stored, false)).toBe(stored);
    });

    it('falls back to dark when no stored theme and OS prefers dark', () => {
      expect(resolveInitialTheme(null, true)).toBe('dark');
    });

    it('falls back to default when no stored theme and OS does not prefer dark', () => {
      expect(resolveInitialTheme(null, false)).toBe(DEFAULT_THEME);
      expect(resolveInitialTheme(null, false)).toBe('light');
    });
  });

  describe('themeLabelText', () => {
    it.each<[Theme, string]>([
      ['light', 'Light'],
      ['dark', 'Dark'],
      ['retro', 'Retro'],
    ])('themeLabelText(%s) === %p', (theme, label) => {
      expect(themeLabelText(theme)).toBe(label);
    });

    it('gives every theme a distinct label', () => {
      expect(new Set(THEMES.map(themeLabelText)).size).toBe(THEMES.length);
    });
  });

  describe('nextToggleTheme', () => {
    it.each<[Theme, Theme]>([
      ['light', 'dark'],
      ['dark', 'light'],
      ['retro', 'dark'],
    ])('nextToggleTheme(%s) === %s', (current, expected) => {
      expect(nextToggleTheme(current)).toBe(expected);
    });
  });
});
