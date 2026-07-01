import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system' | 'nordic' | 'latte' | 'oled' | 'liquid-glass' | 'iman_love' | 'dimoon' | 'dimoon-blue';

export const THEME_NAMES: Record<Theme, string> = {
  'light': 'Светлая',
  'dark': 'Темная',
  'system': 'Системная',
  'nordic': 'Nordic',
  'latte': 'Latte',
  'oled': 'OLED',
  'liquid-glass': 'Liquid Glass',
  'iman_love': 'Iman Love',
  'dimoon': 'Di Moon',
  'dimoon-blue': 'Di Moon Blue'
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  actualTheme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<string>('dark');

  const ALL_THEMES = ['light', 'dark', 'system', 'nordic', 'latte', 'oled', 'liquid-glass', 'iman_love', 'dimoon', 'dimoon-blue'];
  const DARK_THEMES = ['dark', 'nordic', 'oled', 'liquid-glass', 'dimoon', 'dimoon-blue'];

  useEffect(() => {
    const saved = localStorage.getItem('focusflow_theme') as Theme;
    if (ALL_THEMES.includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('focusflow_theme', theme);
    document.documentElement.classList.remove('light', 'dark', 'nordic', 'latte', 'oled', 'liquid-glass', 'iman_love', 'dimoon', 'dimoon-blue');
    
    let resolvedTheme = theme;
    let isDark = false;
    
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      isDark = resolvedTheme === 'dark';
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const listener = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'light' : 'dark';
        document.documentElement.classList.remove(...ALL_THEMES);
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.add('light');
        setActualTheme(newTheme);
      };
      mediaQuery.addEventListener('change', listener);
      if (isDark) document.documentElement.classList.add('dark');
      document.documentElement.classList.add(resolvedTheme);
      setActualTheme(resolvedTheme);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      isDark = DARK_THEMES.includes(theme);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
      document.documentElement.classList.add(theme);
      setActualTheme(theme);
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

