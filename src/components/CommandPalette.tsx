import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline, Task } from '../types';
import { useTheme } from '../ThemeContext';

export default function CommandPalette({ isOpen, onClose, disciplines }: { isOpen: boolean; onClose: () => void, disciplines: Discipline[] }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  
  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'nordic' | 'latte' | 'oled' | 'system')[] = ['light', 'dark', 'nordic', 'latte', 'oled', 'system'];
    const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(nextTheme);
  };


  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-theme-card border border-theme-border shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-theme-border">
              <span className="material-symbols-outlined text-slate-400">search</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Искать задачи, дисциплины или команды..."
                className="w-full bg-transparent text-theme-text outline-none text-lg"
              />
              <div className="bg-theme-border-bg text-theme-muted text-xs px-2 py-1 rounded font-mono">ESC</div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query && filteredTasks.length === 0 ? (
                <div className="p-4 text-center text-theme-muted">Ничего не найдено.</div>
              ) : (
                <>
                  {filteredTasks.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Задачи</div>
                      {filteredTasks.map(t => (
                        <button key={t.task.id} className="w-full text-left px-3 py-3 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl flex items-center justify-between group transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-theme-border-bg flex items-center justify-center text-slate-500">
                              <span className="material-symbols-outlined text-sm">task_alt</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-theme-text group-hover:text-blue-600 dark:group-hover:text-blue-400">{t.task.title}</div>
                              <div className="text-xs text-slate-500">{t.discipline.name}</div>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">keyboard_return</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!query && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Быстрые действия</div>
                      <button className="w-full text-left px-3 py-3 hover:bg-theme-bg-bg rounded-xl flex items-center gap-3 group transition-colors" onClick={() => {
                        onClose();
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
                      }}>
                        <div className="w-8 h-8 rounded bg-theme-border flex items-center justify-center text-slate-500">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                        <div className="text-sm font-medium text-theme-text">Создать задачу...</div>
                        <div className="ml-auto bg-theme-border text-slate-500 text-xs px-2 py-1 rounded font-mono">N</div>
                      </button>
                      <button className="w-full text-left px-3 py-3 hover:bg-theme-bg-bg rounded-xl flex items-center gap-3 group transition-colors" onClick={() => {
                        onClose();
                        cycleTheme();
                      }}>
                        <div className="w-8 h-8 rounded bg-theme-border flex items-center justify-center text-slate-500">
                          <span className="material-symbols-outlined text-sm">dark_mode</span>
                        </div>
                        <div className="text-sm font-medium text-theme-text">Переключить тему</div>
                      </button>
                    </div>
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
