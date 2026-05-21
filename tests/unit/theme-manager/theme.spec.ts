import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getCurrentTheme,
  setTheme,
  initTheme,
  toggleTheme,
} from '../../../src/theme-manager/theme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia for OS preference testing
const matchMediaMock = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock,
});

// Helper to reset mocks before each test
afterEach(() => {
  document.body.className = '';
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
});

describe('Theme Manager', () => {
  describe('getCurrentTheme', () => {
    it('should return light theme when no theme class is present', () => {
      expect(getCurrentTheme()).toBe('light');
    });

    it('should return dark theme when theme-dark class is present', () => {
      document.body.classList.add('theme-dark');
      expect(getCurrentTheme()).toBe('dark');
    });

    it('should return retro theme when theme-retro class is present', () => {
      document.body.classList.add('theme-retro');
      expect(getCurrentTheme()).toBe('retro');
    });
  });

  describe('setTheme', () => {
    it('should set light theme (remove all theme classes)', () => {
      setTheme('light');
      expect(document.body.classList.contains('theme-dark')).toBe(false);
      expect(document.body.classList.contains('theme-retro')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('preferred-theme', 'light');
    });

    it('should set dark theme (add theme-dark class)', () => {
      setTheme('dark');
      expect(document.body.classList.contains('theme-dark')).toBe(true);
      expect(document.body.classList.contains('theme-retro')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('preferred-theme', 'dark');
    });

    it('should set retro theme (add theme-retro class)', () => {
      setTheme('retro');
      expect(document.body.classList.contains('theme-retro')).toBe(true);
      expect(document.body.classList.contains('theme-dark')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('preferred-theme', 'retro');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      toggleTheme();
      expect(document.body.classList.contains('theme-dark')).toBe(true);
    });

    it('should toggle from dark to light', () => {
      document.body.classList.add('theme-dark');
      toggleTheme();
      expect(document.body.classList.contains('theme-dark')).toBe(false);
    });
  });

  describe('initTheme', () => {
    it('should initialize with light theme by default', () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({ matches: false });

      initTheme();

      expect(document.body.classList.contains('theme-dark')).toBe(false);
      expect(document.body.classList.contains('theme-retro')).toBe(false);
    });

    it('should initialize with saved theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      initTheme();

      expect(document.body.classList.contains('theme-dark')).toBe(true);
    });

    it('should initialize with light theme even when storage fails', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      initTheme();

      expect(document.body.classList.contains('theme-dark')).toBe(false);
      expect(document.body.classList.contains('theme-retro')).toBe(false);
    });

    it('should respect OS dark mode preference when no saved theme', () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({ matches: true });

      initTheme();

      expect(document.body.classList.contains('theme-dark')).toBe(true);
    });
  });
});
