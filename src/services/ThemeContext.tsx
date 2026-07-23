import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system' | 'nordic' | 'latte' | 'oled' | 'liquid-glass' | 'iman_love' | 'iman_love_light' | 'dimoon' | 'dimoon-blue' | 'tiffany' | 'matcha-zen' | 'cyber-pulse' | 'mono-dark' | 'mono-light';

export interface ThemeOption {
  id: Theme;
  name: string;
  colors: string[]; // [bg, panel, accent]
  desc: string;
  dustRequired?: number;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'system', name: 'Системная', colors: ['#64748B', '#94A3B8', '#CBD5E1'], desc: 'Автоматически' },
  { id: 'light', name: 'Светлая', colors: ['#F8FAFC', '#FFFFFF', '#2563EB'], desc: 'Классическая' },
  { id: 'dark', name: 'Темная', colors: ['#0F172A', '#1E293B', '#2563EB'], desc: 'Комфортная' },
  { id: 'nordic', name: 'Nordic', colors: ['#2E3440', '#3B4252', '#88C0D0'], desc: 'Арктическая' },
  { id: 'latte', name: 'Latte', colors: ['#F5F1EA', '#FFFFFF', '#BC6C25'], desc: 'Кофейная' },
  { id: 'oled', name: 'OLED', colors: ['#000000', '#0A0A0A', '#39FF14'], desc: 'Максимальный черный' },
  { id: 'liquid-glass', name: 'Liquid Glass', colors: ['#0F172A', '#1E293B', '#60A5FA'], desc: 'Эстетика стекла', dustRequired: 100 },
  { id: 'iman_love', name: 'Iman Love', colors: ['#1E0716', '#2D0A21', '#EC4899'], desc: 'Нежный розовый', dustRequired: 300 },
  { id: 'iman_love_light', name: 'Iman Love Light', colors: ['#FFF1F2', '#FFFFFF', '#DB2777'], desc: 'Светлая роза', dustRequired: 500 },
  { id: 'dimoon', name: 'Di Moon', colors: ['#050714', '#0B0E20', '#FDE047'], desc: 'Космический синий', dustRequired: 1000 },
  { id: 'dimoon-blue', name: 'Di Moon Blue', colors: ['#020617', '#0F172A', '#38BDF8'], desc: 'Звездное небо', dustRequired: 1500 },
  { id: 'tiffany', name: 'Tiffany', colors: ['#0ABAB5', '#FFFFFF', '#007573'], desc: 'Luxury Teal', dustRequired: 3000 },
  { id: 'matcha-zen', name: 'Matcha Zen', colors: ['#E0E5D1', '#FFFFFF', '#4F6F52'], desc: 'Earthy Light', dustRequired: 5000 },
  { id: 'cyber-pulse', name: 'Cyber Pulse', colors: ['#28283e', '#00ffcc', '#ff2d78'], desc: 'The Masterpiece', dustRequired: 10000 },
  { id: 'mono-dark', name: 'Mono Dark', colors: ['#000000', '#111111', '#FFFFFF'], desc: 'Pure Black', dustRequired: 15000 },
  { id: 'mono-light', name: 'Mono Light', colors: ['#FFFFFF', '#F5F5F5', '#000000'], desc: 'Pure White', dustRequired: 20000 }
];

export const THEME_NAMES: Record<Theme, string> = THEME_OPTIONS.reduce((acc, curr) => {
  acc[curr.id] = curr.name;
  return acc;
}, {} as Record<Theme, string>);

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  previewTheme: Theme | null;
  setPreviewTheme: (t: Theme | null) => void;
  actualTheme: string;
  showBackgroundEffects: boolean;
  setShowBackgroundEffects: (v: boolean) => void;
  themes: ThemeOption[];
  performanceMode: boolean;
  setPerformanceMode: (v: boolean) => void;
  // New settings
  powerSaving: boolean;
  setPowerSaving: (v: boolean) => void;
  simplifiedConstellations: boolean;
  setSimplifiedConstellations: (v: boolean) => void;
  staticElements: boolean;
  setStaticElements: (v: boolean) => void;
  tabTimer: boolean;
  setTabTimer: (v: boolean) => void;
  simplifiedUI: boolean;
  setSimplifiedUI: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [actualTheme, setActualTheme] = useState<string>('dark');
  const [showBackgroundEffects, setShowBackgroundEffects] = useState<boolean>(true);
  const [performanceMode, setPerformanceMode] = useState<boolean>(() => localStorage.getItem('focusmoon_performance_mode') === 'true');
  
  const [powerSaving, setPowerSaving] = useState(() => localStorage.getItem('focusmoon_ps_saving') === 'true');
  const [simplifiedConstellations, setSimplifiedConstellations] = useState(() => localStorage.getItem('focusmoon_ps_const') === 'true');
  const [staticElements, setStaticElements] = useState(() => localStorage.getItem('focusmoon_ps_static') === 'true');
  const [tabTimer, setTabTimer] = useState(() => localStorage.getItem('focusmoon_ps_tab') === 'true');
  const [simplifiedUI, setSimplifiedUI] = useState(() => localStorage.getItem('focusmoon_ps_ui') === 'true');

  const ALL_THEMES: Theme[] = ['light', 'dark', 'system', 'nordic', 'latte', 'oled', 'liquid-glass', 'iman_love', 'iman_love_light', 'dimoon', 'dimoon-blue', 'tiffany', 'matcha-zen', 'cyber-pulse', 'mono-dark', 'mono-light'];
  const DARK_THEMES: Theme[] = ['dark', 'nordic', 'oled', 'liquid-glass', 'iman_love', 'dimoon', 'dimoon-blue', 'cyber-pulse', 'mono-dark'];

  useEffect(() => {
    const saved = localStorage.getItem('focusmoon_theme') as Theme;
    if (ALL_THEMES.includes(saved)) {
      setThemeState(saved);
    }
    const savedEffects = localStorage.getItem('focusmoon_bg_effects');
    if (savedEffects !== null) {
      setShowBackgroundEffects(savedEffects === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('focusmoon_bg_effects', showBackgroundEffects.toString());
  }, [showBackgroundEffects]);

  useEffect(() => {
    localStorage.setItem('focusmoon_performance_mode', performanceMode.toString());
    if (performanceMode) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
  }, [performanceMode]);

  useEffect(() => {
    localStorage.setItem('focusmoon_ps_saving', powerSaving.toString());
    localStorage.setItem('focusmoon_ps_const', simplifiedConstellations.toString());
    localStorage.setItem('focusmoon_ps_static', staticElements.toString());
    localStorage.setItem('focusmoon_ps_tab', tabTimer.toString());
    localStorage.setItem('focusmoon_ps_ui', simplifiedUI.toString());
  }, [powerSaving, simplifiedConstellations, staticElements, tabTimer, simplifiedUI]);

  useEffect(() => {
    localStorage.setItem('focusmoon_theme', theme);
    const activeTheme = previewTheme || theme;
    document.documentElement.classList.remove(...ALL_THEMES);
    
    // Performance class toggle
    if (!showBackgroundEffects || performanceMode) {
      document.documentElement.classList.add('no-animations', 'performance-mode');
    } else {
      document.documentElement.classList.remove('no-animations', 'performance-mode');
    }

    if (simplifiedUI) {
      document.documentElement.classList.add('simplified-ui');
    } else {
      document.documentElement.classList.remove('simplified-ui');
    }

    let resolvedTheme = activeTheme;
    let isDark = false;
    
    if (activeTheme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      isDark = resolvedTheme === 'dark';
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const listener = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'light' : 'dark';
        if (previewTheme) return; // Don't react to system if previewing
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
      isDark = DARK_THEMES.includes(activeTheme);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
      document.documentElement.classList.add(activeTheme);
      setActualTheme(activeTheme);
    }
  }, [theme, previewTheme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    setPreviewTheme(null); // Clear preview when setting final theme
  };
  const themes = THEME_OPTIONS;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      previewTheme,
      setPreviewTheme,
      actualTheme, 
      showBackgroundEffects, 
      setShowBackgroundEffects, 
      themes,
      performanceMode,
      setPerformanceMode,
      powerSaving,
      setPowerSaving,
      simplifiedConstellations,
      setSimplifiedConstellations,
      staticElements,
      setStaticElements,
      tabTimer,
      setTabTimer,
      simplifiedUI,
      setSimplifiedUI
    }}>
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

