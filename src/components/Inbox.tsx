import { useState, useEffect, useRef } from 'react';
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
    const newItem: InboxItem = {
      id: crypto.randomUUID(),
      text: text.trim(),
      createdAt: new Date().toISOString()
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
            className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#30343D] shadow-2xl rounded-2xl p-6 z-50 overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined">inbox</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#F5F5F5]">Быстрый Инбокс</h2>
                <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Brain Dump (Разгрузка мозга)</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="mb-6 relative">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Что у вас на уме?"
                className="w-full bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-[#30343D] text-slate-900 dark:text-[#F5F5F5] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!text.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-[#94A3B8] text-sm">
                  Инбокс пуст. Запишите сюда свои мысли.
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0F1115] group transition-colors">
                    <span className="material-symbols-outlined text-slate-400 mt-0.5 text-sm">notes</span>
                    <p className="flex-1 text-sm text-slate-700 dark:text-[#F5F5F5]">{item.text}</p>
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
