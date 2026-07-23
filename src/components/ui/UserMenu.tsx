import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../services/ThemeContext';
import { AccessManager } from '../../services/AccessManager';
import { auth } from '../../services/firebase';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function UserMenu({ className = "relative z-[60]", stats }: { className?: string, stats?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { theme, setTheme, themes, setPreviewTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = currentUser?.displayName || stats?.userName || 'Гость';

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(prev => {
          if (prev) {
             setShowThemes(false);
             setPreviewTheme(null);
             return false;
          }
          return prev;
        });
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setPreviewTheme]);

  const getThemeIcon = (id: string) => {
    switch (id) {
      case 'light': return 'light_mode';
      case 'dark': return 'dark_mode';
      case 'system': return 'desktop_windows';
      case 'nordic': return 'ac_unit';
      case 'latte': return 'local_cafe';
      case 'oled': return 'contrast';
      case 'liquid-glass': return 'water_drop';
      case 'iman_love': return 'favorite';
      case 'iman_love_light': return 'favorite';
      case 'dimoon': return 'dark_mode';
      case 'dimoon-blue': return 'star';
      case 'tiffany': return 'diamond';
      case 'ivory-snow': return 'cloud';
      case 'nordic-light': return 'ac_unit';
      case 'eclipse-space': return 'brightness_3';
      case 'obsidian-matte': return 'layers';
      default: return 'palette';
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={className} ref={menuRef}>
      <button 
        onClick={() => { setIsOpen(!isOpen); setShowThemes(false); }}
        className={`w-10 h-10 rounded-full glass-panel flex items-center justify-center text-theme-text shadow-sm hover:ring-2 ring-theme-accent transition-all ${currentUser ? 'border border-theme-accent/30' : ''}`}
      >
        {currentUser?.photoURL ? (
          <img src={currentUser.photoURL} alt="User" className="w-full h-full rounded-full" />
        ) : (
          <span className="material-symbols-outlined">person</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 glass-panel rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 border-b border-theme-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-theme-text truncate max-w-[140px]">{userName}</p>
                <p className="text-xs text-theme-muted">{currentUser ? 'Cloud Sync active' : 'Local Mode ☁️'}</p>
              </div>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('set_tab', { detail: 'profile' }));
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-lg bg-theme-accent/10 text-theme-accent flex items-center justify-center hover:bg-theme-accent/20 transition-colors"
                title="Перейти в профиль"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </button>
            </div>
          </div>

          <div className="p-2 space-y-1">
            {!currentUser ? (
              <button 
                onClick={handleLogin}
                className="w-full text-left px-2 py-2 rounded-xl text-sm flex items-center gap-3 text-theme-accent hover:bg-theme-accent/10 transition-colors font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Войти (Sync Cloud)
              </button>
            ) : (
              <button 
                onClick={handleLogout}
                className="w-full text-left px-2 py-2 rounded-xl text-sm flex items-center gap-3 text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Выйти
              </button>
            )}
            
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('set_tab', { detail: 'profile' }));
                setIsOpen(false);
              }}
              className="w-full text-left px-2 py-2 rounded-xl text-sm flex items-center gap-3 text-theme-text hover:bg-theme-bg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Профиль
            </button>
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
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-theme-border ml-2 mb-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {themes.map(t => {
                  const isLocked = t.dustRequired && !(stats?.unlockedThemes || []).includes(t.id) && !AccessManager.isPremium();
                  return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isLocked) {
                        alert(`Требуется ${t.dustRequired} ✨ звездной пыльцы. Разблокируйте в профиле!`);
                        return;
                      }
                      setTheme(t.id); setIsOpen(false); 
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-3 transition-colors ${isLocked ? 'opacity-50 grayscale cursor-not-allowed text-theme-muted' : (theme === t.id ? 'bg-theme-accent/15 text-theme-accent font-semibold' : 'text-theme-text hover:bg-theme-bg')}`}
                  >
                    <div className="w-4 h-4 shrink-0">
                      {isLocked ? (
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                      ) : (
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                          <path d="M 50 50 L 50 2 A 48 48 0 0 0 50 98 Z" fill={t.colors[0]} />
                          <path d="M 50 50 L 50 2 A 48 48 0 0 1 98 50 Z" fill={t.colors[1]} />
                          <path d="M 50 50 L 98 50 A 48 48 0 0 1 50 98 Z" fill={t.colors[2]} />
                          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1">{t.name}</span>
                    {t.dustRequired && isLocked && (
                      <span className="text-[9px] font-bold opacity-60 shrink-0">{t.dustRequired} ✨</span>
                    )}
                  </button>
                )
                })}
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
