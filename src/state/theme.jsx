/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ─── Theme definitions ────────────────────────────────────────────────────────
export const THEMES = {
  warm: {
    id: 'warm',
    label: 'Warm Enterprise AI',
    description: 'Ivory backgrounds · caramel accents · premium light',
    swatch: ['#F8F6F1', '#C68A52', '#2B2B2B'],
  },
  obsidian: {
    id: 'obsidian',
    label: 'Obsidian Dark',
    description: 'Deep obsidian · crimson accents · glassmorphism',
    swatch: ['#0b0b0f', '#dc2626', '#f5f5f5'],
  },
  'pro-dark': {
    id: 'pro-dark',
    label: 'Professional Dark',
    description: 'Charcoal surfaces · warm caramel highlights · refined',
    swatch: ['#1C1A18', '#C68A52', '#EDEBE8'],
  },
};

const DEFAULT_THEME = 'warm';
const STORAGE_KEY = 'aegis-theme';

const ThemeContext = createContext(null);

function applyTheme(id) {
  const safe = THEMES[id] ? id : DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', safe);
  return safe;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return applyTheme(stored ?? DEFAULT_THEME);
  });

  // Listen for cross-tab changes
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const next = applyTheme(e.newValue);
        setThemeState(next);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((id) => {
    const next = applyTheme(id);
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const api = useMemo(() => ({
    theme,
    setTheme,
    themes: THEMES,
    themeList: Object.values(THEMES),
    isDark: theme !== 'warm',
    isWarm: theme === 'warm',
  }), [theme, setTheme]);

  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
