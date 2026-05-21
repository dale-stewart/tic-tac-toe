/**
 * Pure theme logic — no DOM, no localStorage, no window. Split from theme.ts
 * (the DOM adapter) so vitest + Stryker can observe these decisions directly at
 * 100% mutation coverage. theme.ts is the side-effecting shell that feeds these
 * functions the current stored value / OS preference / body className.
 */

export type Theme = 'light' | 'dark' | 'retro';

export const THEMES: readonly Theme[] = ['light', 'dark', 'retro'];

export const DEFAULT_THEME: Theme = 'light';

// Body carries exactly one of these classes at a time; CSS keys every theme
// (including light) off the explicit class so there is no "absence means light"
// ambiguity for the DOM adapter or the e2e probes to reason about.
export const THEME_CLASSES: Record<Theme, string> = {
  light: 'theme-light',
  dark: 'theme-dark',
  retro: 'theme-retro',
};

export const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark' || value === 'retro';

/** Validate a raw localStorage value; anything unrecognised → null. */
export const parseStoredTheme = (raw: string | null): Theme | null => (isTheme(raw) ? raw : null);

export const classForTheme = (theme: Theme): string => THEME_CLASSES[theme];

/** Recover the active theme from a body className string; default if none match. */
export const themeFromClassName = (className: string): Theme => {
  // Split on a literal space (not a regex) so there is no Regex mutant to
  // reason about; the token check below is unaffected by the empty strings
  // that runs of whitespace would produce.
  const classes = className.split(' ');
  if (classes.includes(THEME_CLASSES.dark)) return 'dark';
  if (classes.includes(THEME_CLASSES.retro)) return 'retro';
  return 'light';
};

/**
 * First-load resolution: an explicit saved preference always wins; otherwise
 * honour the OS dark-mode signal; otherwise fall back to the default.
 */
export const resolveInitialTheme = (stored: Theme | null, prefersDark: boolean): Theme => {
  if (stored !== null) return stored;
  if (prefersDark) return 'dark';
  return DEFAULT_THEME;
};

/** Light/dark toggle: dark → light, everything else (light, retro) → dark. */
export const nextToggleTheme = (current: Theme): Theme => (current === 'dark' ? 'light' : 'dark');

const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  retro: 'Retro',
};

/** Human-facing option label for the theme selector. */
export const themeLabelText = (theme: Theme): string => THEME_LABELS[theme];
