/**
 * Theme DOM adapter — the side-effecting shell around theme-pure.ts.
 *
 * All decisions (validation, class mapping, initial resolution, toggle) live in
 * theme-pure and are vitest/Stryker-covered. This file only touches the world:
 * the body className, localStorage, and the OS colour-scheme media query. It is
 * excluded from coverage + mutation (see vitest.config.ts / stryker.config.json)
 * and exercised end-to-end via Playwright instead.
 */
import {
  classForTheme,
  DEFAULT_THEME,
  nextToggleTheme,
  parseStoredTheme,
  resolveInitialTheme,
  THEME_CLASSES,
  themeFromClassName,
  type Theme,
} from './theme-pure';

const STORAGE_KEY = 'preferred-theme';

/** Read the active theme back from the body's class list. */
export const getCurrentTheme = (): Theme => themeFromClassName(document.body.className);

/** Apply a theme to the body: exactly one theme class is present afterwards. */
const applyTheme = (theme: Theme): void => {
  const body = document.body;
  body.classList.remove(THEME_CLASSES.light, THEME_CLASSES.dark, THEME_CLASSES.retro);
  body.classList.add(classForTheme(theme));
};

const persistTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }
};

const readStoredTheme = (): Theme | null => {
  try {
    return parseStoredTheme(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    console.warn('Failed to read theme preference:', e);
    return null;
  }
};

const prefersDark = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Apply and persist a theme. The single entry point for user-driven changes. */
export const setTheme = (theme: Theme): void => {
  applyTheme(theme);
  persistTheme(theme);
};

/**
 * First-paint initialisation. Resolves saved preference → OS preference →
 * default, then applies it. Does NOT persist: visiting the site shouldn't lock
 * in a preference the user never chose.
 */
export const initTheme = (): void => {
  applyTheme(resolveInitialTheme(readStoredTheme(), prefersDark()));
};

/** Light/dark toggle convenience used by the (optional) toggle affordance. */
export const toggleTheme = (): void => {
  setTheme(nextToggleTheme(getCurrentTheme()));
};

export { DEFAULT_THEME, type Theme };
