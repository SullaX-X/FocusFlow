import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline, Task } from '../types';
import { useTheme } from '../ThemeContext';

export const THEMES: ('light' | 'dark' | 'nordic' | 'latte' | 'oled' | 'liquid-glass' | 'iman_love' | 'dimoon' | 'dimoon-blue' | 'system')[] = ['light', 'dark', 'nordic', 'latte', 'oled', 'liquid-glass', 'iman_love', 'dimoon', 'dimoon-blue', 'system'];

export default function CommandPalette({ isOpen, onClose, disciplines, onQuickFocus, initialMode = 'root' }: { isOpen: boolean; onClose: () => void, disciplines: Discipline[], onQuickFocus: () => void, initialMode?: 'root' | 'themes' }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'root' | 'themes'>(initialMode);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { theme, setTheme } = useTheme();
  const [originalTheme, setOriginalTheme] = useState(theme);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setMode(initialMode);
      setQuery('');
      setSelectedIndex(0);
      setOriginalTheme(theme);
    }
  }, [isOpen, initialMode]);

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

  const filteredTasks = allTasks.filter(t => 
    t.task.title.toLowerCase().includes(query.toLowerCase()) || 
    t.discipline.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredThemes = THEMES.filter(t => t.toLowerCase().includes(query.toLowerCase()));

  const quickActions = [
    { id: 'action-new', icon: 'add', label: 'Создать задачу...', shortcut: 'N', action: () => { onClose(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' })); } },
    { id: 'action-inbox', icon: 'inbox', label: 'Открыть Inbox', shortcut: 'I', action: () => { onClose(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' })); } },
    { id: 'action-focus', icon: 'timer', label: 'Быстрый фокус (Свободная сессия)', shortcut: 'F', action: () => { onClose(); onQuickFocus(); }, isAccent: true },
    { id: 'action-theme', icon: 'palette', label: 'Выбрать тему...', shortcut: 'T', action: () => { setOriginalTheme(theme); setMode('themes'); setQuery(''); inputRef.current?.focus(); } },
  ];

  const currentItems = mode === 'themes' 
    ? filteredThemes 
    : (query ? filteredTasks : quickActions);

  // Preview theme on keyboard nav
  useEffect(() => {
    if (mode === 'themes' && currentItems.length > 0) {
      const activeTheme = currentItems[selectedIndex] as any;
      if (activeTheme) {
        setTheme(activeTheme);
      }
    }
  }, [selectedIndex, mode, currentItems, setTheme]);

  // Scroll into view
  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'themes') {
          setTheme(originalTheme);
          setMode('root');
          setQuery('');
        } else {
          onClose();
        }
      } else if (e.key === 'Backspace' && query === '' && mode === 'themes') {
        setTheme(originalTheme);
        setMode('root');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % currentItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + currentItems.length) % currentItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = currentItems[selectedIndex];
        if (!selected) return;

        if (mode === 'themes') {
          setTheme(selected as any);
          onClose();
        } else if (query) {
          onClose(); // currently tasks just close the modal
        } else {
          (selected as any).action();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, mode, originalTheme, query, setTheme, currentItems, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (mode === 'themes') setTheme(originalTheme);
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
            <div className="flex items-center gap-3 px-4 py-4 border-b border-theme-border">
              {mode === 'root' ? (
                <span className="material-symbols-outlined text-slate-400">search</span>
              ) : (
                <button 
                  onClick={() => {
                    setTheme(originalTheme);
                    setMode('root');
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="material-symbols-outlined text-slate-400 hover:text-theme-text transition-colors"
                >
                  arrow_back
                </button>
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={mode === 'root' ? "Искать задачи, дисциплины или команды..." : "Поиск темы..."}
                className="w-full bg-transparent text-theme-text outline-none text-lg"
              />
              <div className="bg-theme-border-bg text-theme-muted text-xs px-2 py-1 rounded font-mono">ESC</div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {mode === 'themes' ? (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Доступные темы</div>
                  {filteredThemes.length === 0 ? (
                    <div className="p-4 text-center text-theme-muted">Ничего не найдено.</div>
                  ) : (
                    filteredThemes.map((t, index) => {
                      const isSelected = selectedIndex === index;
                      return (
                        <button 
                          key={t}
                          ref={el => itemRefs.current[index] = el}
                          onMouseEnter={() => { setSelectedIndex(index); setTheme(t); }}
                          onClick={() => {
                            setTheme(t);
                            onClose();
                          }}
                          className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between group transition-colors ${isSelected ? 'bg-theme-accent/10' : 'hover:bg-theme-accent/5'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded ${theme === t ? 'bg-theme-accent text-white' : 'bg-theme-border text-slate-500'} flex items-center justify-center`}>
                              <span className="material-symbols-outlined text-sm">{theme === t ? 'check' : 'palette'}</span>
                            </div>
                            <div className={`text-sm font-medium ${theme === t ? 'text-theme-accent' : 'text-theme-text'}`}>
                              {t}
                            </div>
                          </div>
                          <span className={`material-symbols-outlined text-slate-300 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>keyboard_return</span>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                <>
                  {query && filteredTasks.length === 0 ? (
                    <div className="p-4 text-center text-theme-muted">Ничего не найдено.</div>
                  ) : (
                    <>
                      {filteredTasks.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Задачи</div>
                          {filteredTasks.map((t, index) => {
                            const isSelected = selectedIndex === index;
                            return (
                              <button 
                                key={t.task.id} 
                                ref={el => itemRefs.current[index] = el}
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={() => onClose()}
                                className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between group transition-colors ${isSelected ? 'bg-theme-accent/10 dark:bg-theme-accent/100/10' : 'hover:bg-theme-accent/5'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-theme-border-bg flex items-center justify-center text-slate-500">
                                    <span className="material-symbols-outlined text-sm">task_alt</span>
                                  </div>
                                  <div>
                                    <div className={`text-sm font-medium ${isSelected ? 'text-theme-accent' : 'text-theme-text'}`}>{t.task.title}</div>
                                    <div className="text-xs text-slate-500">{t.discipline.name}</div>
                                  </div>
                                </div>
                                <span className={`material-symbols-outlined text-slate-300 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>keyboard_return</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      
                      {!query && (
                        <div>
                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Быстрые действия</div>
                          {quickActions.map((action, index) => {
                            const isSelected = selectedIndex === index;
                            return (
                              <button 
                                key={action.id}
                                ref={el => itemRefs.current[index] = el}
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={action.action}
                                className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 group transition-colors ${isSelected ? 'bg-theme-bg-bg' : 'hover:bg-theme-bg'}`}
                              >
                                <div className={`w-8 h-8 rounded flex items-center justify-center ${action.isAccent ? 'bg-theme-accent/20 text-theme-accent' : 'bg-theme-border text-slate-500'}`}>
                                  <span className="material-symbols-outlined text-sm">{action.icon}</span>
                                </div>
                                <div className="text-sm font-medium text-theme-text">{action.label}</div>
                                {action.shortcut && (
                                  <div className="ml-auto bg-theme-border text-slate-500 text-xs px-2 py-1 rounded font-mono">{action.shortcut}</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
