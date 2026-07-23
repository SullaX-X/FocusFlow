import React from "react";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline, Task } from '../../types';
import { useTheme } from '../../services/ThemeContext';
import { AccessManager } from '../../services/AccessManager';

export default function CommandPalette({ isOpen, onClose, disciplines, onQuickFocus, initialMode = 'root', stats = {} }: { isOpen: boolean; onClose: () => void, disciplines: Discipline[], onQuickFocus: () => void, initialMode?: 'root' | 'themes', stats?: any }) {
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [mode, setMode] = useState<'root' | 'themes'>(initialMode);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { theme, setTheme, themes, previewTheme, setPreviewTheme } = useTheme();
  const [originalTheme, setOriginalTheme] = useState(theme);
  
  const [favoriteThemes, setFavoriteThemes] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorite_themes');
    return saved ? JSON.parse(saved) : [];
  });

  const quickActions = [
    { id: 'action-new', icon: 'add', label: 'Создать задачу...', shortcut: 'N', alias: 'new', action: () => { onClose(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' })); } },
    { id: 'action-inbox', icon: 'inbox', label: 'Открыть Inbox', shortcut: 'I', alias: 'inbox', action: () => { onClose(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' })); } },
    { id: 'action-focus', icon: 'timer', label: 'Быстрый фокус (Свободная сессия)', shortcut: 'F', alias: 'focus', action: () => { onClose(); onQuickFocus(); }, isAccent: true },
    { id: 'action-theme', icon: 'palette', label: 'Выбрать тему...', shortcut: 'T', alias: 'theme', action: () => { setMode('themes'); setQuery(''); } },
  ];

  const toggleFavoriteTheme = (e: React.MouseEvent, t: string) => {
    e.stopPropagation();
    setFavoriteThemes(prev => {
      const newFavs = prev.includes(t) ? prev.filter(f => f !== t) : [...prev, t];
      localStorage.setItem('favorite_themes', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setMode(initialMode);
      setQuery('');
      setSuggestion('');
      setSelectedIndex(0);
      setOriginalTheme(theme);
    } else {
      setPreviewTheme(null);
    }
  }, [isOpen, initialMode]);

  // Autocomplete logic
  useEffect(() => {
    if (!query || mode !== 'root') {
      setSuggestion('');
      return;
    }

    const lowerQuery = query.toLowerCase();
    const match = quickActions.find(a => 
      a.alias.startsWith(lowerQuery) || 
      a.label.toLowerCase().startsWith(lowerQuery)
    );

    if (match) {
      const text = match.alias.startsWith(lowerQuery) ? match.alias : match.label;
      setSuggestion(text.slice(query.length));
    } else {
      setSuggestion('');
    }
  }, [query, mode]);

  // Reset selected index when query or mode changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, mode]);

  // Search logic
  const allTasks: {task: Task, discipline: Discipline}[] = [];
  disciplines.forEach(d => {
    if (d.themes) {
      d.themes.forEach(t => {
        t.tasks.forEach(task => allTasks.push({ task, discipline: d }));
      });
    }
  });

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === q.toLowerCase() 
            ? <span key={i} className="text-theme-accent font-bold underline decoration-2 underline-offset-2">{part}</span> 
            : part
        )}
      </span>
    );
  };

  const filteredTasks = query ? allTasks
    .filter(t => 
      t.task.title.toLowerCase().includes(query.toLowerCase()) || 
      t.discipline.name.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      const aPrefix = a.task.title.toLowerCase().startsWith(query.toLowerCase());
      const bPrefix = b.task.title.toLowerCase().startsWith(query.toLowerCase());
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;
      return 0;
    })
    .slice(0, 5) : [];

  const sortedThemes = [...themes].sort((a, b) => {
    const aFav = favoriteThemes.includes(a.id);
    const bFav = favoriteThemes.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const filteredThemes = sortedThemes.filter(t => t.id.toLowerCase().includes(query.toLowerCase()) || t.name.toLowerCase().includes(query.toLowerCase()));

  const filteredActions = quickActions
    .filter(a => 
      a.label.toLowerCase().includes(query.toLowerCase()) || 
      a.alias.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      const aPrefix = a.alias.toLowerCase().startsWith(query.toLowerCase()) || a.label.toLowerCase().startsWith(query.toLowerCase());
      const bPrefix = b.alias.toLowerCase().startsWith(query.toLowerCase()) || b.label.toLowerCase().startsWith(query.toLowerCase());
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;
      return 0;
    });

  const currentItems = mode === 'themes' 
    ? filteredThemes 
    : [...filteredTasks, ...filteredActions];

  const activeItem = currentItems[selectedIndex];

  const activeItemId = activeItem && typeof activeItem === 'object' && 'id' in activeItem ? activeItem.id : null;

  // Preview theme on keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'themes' && activeItemId) {
      setPreviewTheme(activeItemId as any);
    }
    return () => {
      if (mode === 'themes' && isOpen) {
         // Only cleanup if we are still open and in themes mode, 
         // though actually we shouldn't indiscriminately clear it unless we are switching away.
         // We'll leave it simple.
      }
    };
  }, [mode, activeItemId, setPreviewTheme, isOpen]);

  // Scroll into view
  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (mode === 'themes') {
        setPreviewTheme(null);
        setMode('root');
        setQuery('');
      } else {
        onClose();
      }
    } else if (e.key === 'Backspace' && query === '' && mode === 'themes') {
      setPreviewTheme(null);
      setMode('root');
    } else if (e.key === 'Tab') {
      if (suggestion) {
        e.preventDefault();
        setQuery(query + suggestion);
        setSuggestion('');
      }
    } else if (e.key === 'ArrowRight' && suggestion && inputRef.current?.selectionStart === query.length) {
      e.preventDefault();
      setQuery(query + suggestion);
      setSuggestion('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentItems.length > 0) {
        setSelectedIndex(prev => (prev + 1) % currentItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentItems.length > 0) {
        setSelectedIndex(prev => (prev - 1 + currentItems.length) % currentItems.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = currentItems[selectedIndex];
      if (!selected) return;

      if (mode === 'themes') {
        const t = selected as any;
        const isLocked = t.dustRequired && !(stats?.unlockedThemes || []).includes(t.id) && !AccessManager.isPremium();
        if (isLocked) {
          alert(`Требуется ${t.dustRequired} ✨ звездной пыльцы. Разблокируйте в профиле!`);
          return;
        }
        setTheme(t.id);
        onClose();
      } else if (typeof selected === 'object' && selected !== null && 'action' in selected) {
        (selected as any).action();
      } else if (query) {
        onClose(); // currently tasks just close the modal
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setPreviewTheme(null);
              onClose();
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[15vh] md:top-1/4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl bg-theme-card border border-theme-border shadow-2xl rounded-2xl z-[100] overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-theme-border relative">
              {mode === 'root' ? (
                <span className="material-symbols-outlined text-theme-muted">search</span>
              ) : (
                <button 
                  onClick={() => {
                    setPreviewTheme(null);
                    setMode('root');
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="material-symbols-outlined text-theme-muted hover:text-theme-text transition-colors"
                >
                  arrow_back
                </button>
              )}
              <div className="flex-1 relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={mode === 'root' ? "Искать задачи, дисциплины или команды..." : "Поиск темы..."}
                  className="w-full bg-transparent text-theme-text outline-none text-lg z-10"
                />
                {suggestion && (
                  <div className="absolute left-0 top-0 text-lg pointer-events-none opacity-30 select-none">
                    <span className="invisible">{query}</span>
                    <span>{suggestion}</span>
                  </div>
                )}
              </div>
              <div className="bg-theme-border-bg text-theme-muted text-xs px-2 py-1 rounded font-mono">ESC</div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {mode === 'themes' ? (
                  <motion.div 
                    key="themes"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="px-3 py-2 text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em]">Доступные темы</div>
                    {filteredThemes.length === 0 ? (
                      <div className="p-8 text-center text-theme-muted italic">Ничего не найдено.</div>
                    ) : (
                      filteredThemes.map((t, index) => {
                        const isSelected = selectedIndex === index;
                        const isFavorite = favoriteThemes.includes(t.id);
                        const isLocked = t.dustRequired && !(stats?.unlockedThemes || []).includes(t.id) && !AccessManager.isPremium();
                        const isActive = (previewTheme || theme) === t.id;
                        
                        const colors = {
                          bg: t.colors[0],
                          card: t.colors[1],
                          accent: t.colors[2]
                        };
                        return (
                          <motion.button 
                            layout
                            key={t.id}
                            ref={el => { itemRefs.current[index] = el; }}
                            onMouseEnter={() => { setSelectedIndex(index); setPreviewTheme(t.id); }}
                            onClick={() => {
                              if (isLocked) {
                                alert(`Требуется ${t.dustRequired} ✨ звездной пыльцы. Разблокируйте в профиле!`);
                                return;
                              }
                              setTheme(t.id);
                              onClose();
                            }}
                            className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between group transition-all relative ${isSelected ? 'bg-theme-accent/10' : 'hover:bg-theme-bg/50'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl ${isActive ? 'bg-theme-accent text-text-on-accent shadow-lg shadow-theme-accent/20' : 'bg-theme-bg text-theme-muted'} flex items-center justify-center transition-all relative`}>
                                <span className="material-symbols-outlined text-[20px]">{isActive ? 'check' : 'palette'}</span>
                                {isLocked && !isSelected && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-theme-card border border-theme-border rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[10px] text-theme-muted">lock</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className={`text-sm font-bold tracking-tight ${isActive ? 'text-theme-accent' : 'text-theme-text'}`}>
                                  {highlightMatch(t.name, query)}
                                </div>
                                {isLocked && (
                                  <div className="text-[9px] font-black uppercase text-theme-muted opacity-60">Locked • {t.dustRequired} ✨</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-5">
                              <div className={`flex items-center gap-1.5 bg-theme-bg px-2.5 py-1.5 rounded-full border border-theme-border/50 shadow-inner transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.bg }}></div>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.card }}></div>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.accent }}></div>
                              </div>
  
                              <div 
                                onClick={(e) => toggleFavoriteTheme(e, t.id)}
                                className={`material-symbols-outlined text-[20px] hover:scale-125 active:scale-90 transition-all ${isFavorite ? 'text-yellow-400 fill-1' : `text-theme-muted/30 hover:text-yellow-400 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}`}
                                style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                {isFavorite ? 'star' : 'star_border'}
                              </div>
                              <span className={`material-symbols-outlined text-theme-accent transition-all ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>keyboard_return</span>
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="root"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {query && filteredTasks.length === 0 && filteredActions.length === 0 ? (
                      <div className="p-12 text-center text-theme-muted italic">Ничего не найдено. Попробуйте другой запрос.</div>
                    ) : (
                      <>
                        {filteredTasks.length > 0 && (
                          <div className="mb-4">
                            <div className="px-3 py-2 text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] mb-1">Задачи</div>
                            {filteredTasks.map((t, index) => {
                              const isSelected = selectedIndex === index;
                              return (
                                <motion.button 
                                  layout
                                  key={t.task.id} 
                                  ref={el => { itemRefs.current[index] = el; }}
                                  onMouseEnter={() => setSelectedIndex(index)}
                                  onClick={() => onClose()}
                                  className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between group transition-all ${isSelected ? 'bg-theme-accent/10 ring-1 ring-theme-accent/20' : 'hover:bg-theme-bg/50'}`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-theme-bg flex items-center justify-center text-theme-muted group-hover:text-theme-accent transition-colors">
                                      <span className="material-symbols-outlined text-[20px]">task_alt</span>
                                    </div>
                                    <div>
                                      <div className={`text-sm font-bold tracking-tight ${isSelected ? 'text-theme-accent' : 'text-theme-text'}`}>{highlightMatch(t.task.title, query)}</div>
                                      <div className="text-[11px] font-bold text-theme-muted uppercase tracking-wider opacity-60">{highlightMatch(t.discipline.name, query)}</div>
                                    </div>
                                  </div>
                                  <span className={`material-symbols-outlined text-theme-accent transition-all ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>keyboard_return</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                        
                        {filteredActions.length > 0 && (
                          <div>
                            <div className="px-3 py-2 text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] mb-1">Быстрые действия</div>
                            {filteredActions.map((action, actionIndex) => {
                              const index = filteredTasks.length + actionIndex;
                              const isSelected = selectedIndex === index;
                              return (
                                <motion.button 
                                  layout
                                  key={action.id}
                                  ref={el => { itemRefs.current[index] = el; }}
                                  onMouseEnter={() => setSelectedIndex(index)}
                                  onClick={action.action}
                                  className={`w-full text-left px-4 py-4 rounded-2xl flex items-center gap-4 group transition-all ${isSelected ? 'bg-theme-accent shadow-[0_10px_25px_-10px_var(--theme-accent)] scale-[1.01] z-10' : 'hover:bg-theme-bg/50'}`}
                                >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-text-on-accent text-theme-accent' : (action.isAccent ? 'bg-theme-accent/20 text-theme-accent' : 'bg-theme-bg text-theme-muted')}`}>
                                    <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                                  </div>
                                  <div className={`text-sm font-bold tracking-tight transition-colors ${isSelected ? 'text-text-on-accent' : 'text-theme-text'}`}>{highlightMatch(action.label, query)}</div>
                                  {action.shortcut && (
                                    <div className={`ml-auto text-[10px] px-2 py-1 rounded-lg font-bold transition-colors ${isSelected ? 'bg-text-on-accent/20 text-text-on-accent' : 'bg-theme-bg text-theme-muted border border-theme-border/50'}`}>{action.shortcut}</div>
                                  )}
                                  <span className={`material-symbols-outlined text-text-on-accent transition-all ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>keyboard_return</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

