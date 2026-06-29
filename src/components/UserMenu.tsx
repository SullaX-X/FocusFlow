import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-[60]" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-theme-card border border-theme-border flex items-center justify-center text-theme-text shadow-sm hover:ring-2 ring-blue-500 transition-all"
      >
        <span className="material-symbols-outlined">person</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-theme-card border border-theme-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right backdrop-blur-xl">
          <div className="p-4 border-b border-theme-border">
            <p className="font-semibold text-theme-text">Гость</p>
            <p className="text-xs text-theme-muted">В сети ☁️</p>
          </div>
          
          <div className="p-2 border-b border-theme-border">
            <p className="px-2 py-1 text-xs font-semibold text-theme-muted uppercase tracking-wider">Тема оформления</p>
            <div className="space-y-1 mt-1">
              {[
                { id: 'light', icon: 'light_mode', label: 'Светлая' },
                { id: 'dark', icon: 'dark_mode', label: 'Тёмная' },
                { id: 'system', icon: 'desktop_windows', label: 'Системная' },
                { id: 'nordic', icon: 'ac_unit', label: 'Nordic Night' },
                { id: 'latte', icon: 'coffee', label: 'Latte / Paper' },
                { id: 'oled', icon: 'contrast', label: 'OLED Cyber' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id as any); setIsOpen(false); }}
                  className={`w-full text-left px-2 py-2 rounded-xl text-sm flex items-center gap-3 transition-colors ${theme === t.id ? 'bg-theme-accent/15 text-theme-accent' : 'text-theme-text hover:bg-theme-bg'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2 space-y-1">
            <button className="w-full text-left px-2 py-2 rounded-xl text-sm flex items-center gap-3 text-theme-text hover:bg-theme-bg transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Экспорт данных
            </button>
            <button className="w-full text-left px-2 py-2 rounded-xl text-sm flex items-center gap-3 text-theme-text hover:bg-theme-bg transition-colors">
              <span className="material-symbols-outlined text-[18px]">bug_report</span>
              Сообщить о баге
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
