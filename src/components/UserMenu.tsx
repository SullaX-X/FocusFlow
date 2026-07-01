import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

export default function UserMenu({ className = "absolute top-4 right-4 z-[60]" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const { theme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowThemes(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    { id: 'light', label: 'Светлая', icon: 'light_mode' },
    { id: 'dark', label: 'Тёмная', icon: 'dark_mode' },
    { id: 'system', label: 'Системная', icon: 'desktop_windows' },
    { id: 'nordic', label: 'Nordic', icon: 'ac_unit' },
    { id: 'latte', label: 'Latte', icon: 'local_cafe' },
    { id: 'oled', label: 'OLED Black', icon: 'contrast' },
    { id: 'liquid-glass', label: 'Liquid Glass', icon: 'water_drop' },
    { id: 'iman_love', label: 'Iman love', icon: 'favorite' },
    { id: 'dimoon', label: 'Di Moon', icon: 'dark_mode' },
    { id: 'dimoon-blue', label: 'Di Moon Blue', icon: 'star' },
  ];

  return (
    <div className={className} ref={menuRef}>
      <button 
        onClick={() => { setIsOpen(!isOpen); setShowThemes(false); }}
        className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-theme-text shadow-sm hover:ring-2 ring-theme-accent transition-all"
      >
        <span className="material-symbols-outlined">person</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 glass-panel rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 border-b border-theme-border">
            <p className="font-semibold text-theme-text">Гость</p>
            <p className="text-xs text-theme-muted">В сети ☁️</p>
          </div>

          <div className="p-2 space-y-1">
            <button 
              onClick={() => setShowThemes(!showThemes)}
              className="w-full text-left px-2 py-2 rounded-xl text-sm flex items-center justify-between text-theme-text hover:bg-theme-bg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">palette</span>
                Тема оформления
              </div>
              <span className="material-symbols-outlined text-[18px]">{showThemes ? 'expand_less' : 'expand_more'}</span>
            </button>
            
            {showThemes && (
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-theme-border ml-2 mb-2">
                {themeOptions.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id as any); setIsOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-3 transition-colors ${theme === t.id ? 'bg-theme-accent/15 text-theme-accent font-semibold' : 'text-theme-text hover:bg-theme-bg'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <button className="w-full text-left px-2 py-2 rounded-xl text-sm flex items-center gap-3 text-theme-text hover:bg-theme-bg transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Экспорт данных
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
