import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system' | 'nordic' | 'latte' | 'oled';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  actualTheme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<string>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('focusflow_theme') as Theme;
    if (['light', 'dark', 'system', 'nordic', 'latte', 'oled'].includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('focusflow_theme', theme);
    document.documentElement.classList.remove('light', 'dark', 'nordic', 'latte', 'oled');
    
    let resolvedTheme = theme;
    let isDark = false;
    
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      isDark = resolvedTheme === 'dark';
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const listener = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'light' : 'dark';
        document.documentElement.classList.remove('light', 'dark', 'nordic', 'latte', 'oled');
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
      isDark = ['dark', 'nordic', 'oled'].includes(theme);
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
