/**
 * Theme manager - handles theme switching and persistence
 * Provides functionality to switch between different themes and save preference
 * to localStorage.
 */

// Define available themes
export type Theme = 'light' | 'dark' | 'retro';

// Theme configuration
const themes: Record<Theme, string> = {
  light: 'theme-light',
  dark: 'theme-dark',
  retro: 'theme-retro',
};

// Default theme
const DEFAULT_THEME: Theme = 'light';

/**
 * Get the current theme from document body class
 * @returns The current theme
 */
export const getCurrentTheme = (): Theme => {
  const body = document.body;

  if (body.classList.contains('theme-dark')) {
    return 'dark';
  } else if (body.classList.contains('theme-retro')) {
    return 'retro';
  }

  return 'light';
};

/**
 * Set the theme by adding/removing classes from body
 * @param theme The theme to set
 */
export const setTheme = (theme: Theme): void => {
  const body = document.body;

  // Remove all theme classes
  body.classList.remove('theme-dark', 'theme-retro');

  // Add the new theme class if not light (default)
  if (theme !== 'light') {
    body.classList.add(themes[theme]);
  }

  // Save to localStorage
  try {
    localStorage.setItem('preferred-theme', theme);
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }
};

/**
 * Initialize theme on page load
 * Sets theme based on localStorage preference or OS preference
 */
export const initTheme = (): void => {
  // Check localStorage first
  let savedTheme: Theme | null = null;
  try {
    const stored = localStorage.getItem('preferred-theme');
    if (stored && (stored === 'light' || stored === 'dark' || stored === 'retro')) {
      savedTheme = stored as Theme;
    }
  } catch (e) {
    console.warn('Failed to read theme preference:', e);
  }

  // If no saved theme, check for OS dark mode preference
  if (
    !savedTheme &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    savedTheme = 'dark';
  }

  // Set the theme (will use default if no preference found)
  setTheme(savedTheme || DEFAULT_THEME);
};

/**
 * Toggle between light and dark themes
 */
export const toggleTheme = (): void => {
  const current = getCurrentTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
};
