import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InboxItem } from '../types';

export default function Inbox({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [items, setItems] = useState<InboxItem[]>(() => {
    try {
      const saved = localStorage.getItem('focusflow_inbox');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('focusflow_inbox');
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('focusflow_inbox_updated', handleUpdate);
    return () => window.removeEventListener('focusflow_inbox_updated', handleUpdate);
  }, []);

  useEffect(() => {
    localStorage.setItem('focusflow_inbox', JSON.stringify(items));
  }, [items]);

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Parse NLP syntax: @date #energy !category
    let cleanText = text;
    const metadata: InboxItem['metadata'] = {};

    const dateMatch = text.match(/@(\S+)/);
    if (dateMatch) {
      metadata.date = dateMatch[1].replace(/_/g, ' ');
      cleanText = cleanText.replace(dateMatch[0], '');
    }

    const energyMatch = text.match(/#(\S+)/);
    if (energyMatch) {
      metadata.energy = energyMatch[1].replace(/_/g, ' ');
      cleanText = cleanText.replace(energyMatch[0], '');
    }

    const categoryMatch = text.match(/!(\S+)/);
    if (categoryMatch) {
      metadata.category = categoryMatch[1].replace(/_/g, ' ');
      cleanText = cleanText.replace(categoryMatch[0], '');
    }

    const newItem: InboxItem = {
      id: crypto.randomUUID(),
      text: cleanText.trim() || text.trim(), // fallback if empty after strip
      createdAt: new Date().toISOString(),
      metadata
    };
    setItems([newItem, ...items]);
    setText('');
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg bg-theme-card border border-theme-border shadow-2xl rounded-2xl p-6 z-50 overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-theme-accent/20 dark:bg-theme-accent/100/10 flex items-center justify-center text-theme-accent ">
                <span className="material-symbols-outlined">inbox</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-text">Быстрый Инбокс</h2>
                <p className="text-sm text-theme-muted">Поддержка тегов: @дата #энергия !проект</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="mb-6 relative">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Что у вас на уме? (напр. Отчет @завтра #важно !работа)"
                className="w-full bg-theme-bg border border-theme-border text-theme-text rounded-xl px-4 py-3 pr-12 outline-none focus:border-theme-accent transition-colors"
              />
              <button 
                type="submit"
                disabled={!text.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-theme-accent disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-8 text-theme-muted text-sm">
                  Инбокс пуст. Запишите сюда свои мысли.
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-theme-bg-bg group transition-colors">
                    <span className="material-symbols-outlined text-slate-400 mt-0.5 text-sm">notes</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-theme-text break-words">{item.text}</p>
                      {item.metadata && (Object.keys(item.metadata).length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.metadata.date && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                              <span className="material-symbols-outlined text-[10px]">event</span>
                              {item.metadata.date}
                            </span>
                          )}
                          {item.metadata.energy && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                              <span className="material-symbols-outlined text-[10px]">bolt</span>
                              {item.metadata.energy}
                            </span>
                          )}
                          {item.metadata.category && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                              <span className="material-symbols-outlined text-[10px]">folder</span>
                              {item.metadata.category}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
