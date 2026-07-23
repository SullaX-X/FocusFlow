import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../services/ThemeContext';
import { InboxItem } from '../../types';




import { encryptText, decryptText } from '../../utils/crypto';

import { useVirtualizer } from '@tanstack/react-virtual';

const Inbox = React.memo(function Inbox({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { actualTheme } = useTheme();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [text, setText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const loadItems = async () => {
    try {
      const saved = localStorage.getItem('focusmoon_inbox');
      if (saved) {
        if (saved.startsWith('ENC:')) {
          const password = localStorage.getItem('focusmoon_inbox_password');
          if (password) {
            const decrypted = await decryptText(saved, password);
            setItems(JSON.parse(decrypted));
            setIsLocked(false);
          } else {
            setIsLocked(true);
          }
        } else {
          setItems(JSON.parse(saved));
          setIsLocked(false);
        }
      }
    } catch (e) {
      console.warn('Load inbox error:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadItems();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const saveItems = async (newItems: InboxItem[]) => {
    const password = localStorage.getItem('focusmoon_inbox_password');
    let dataToSave = JSON.stringify(newItems);
    if (password) {
      dataToSave = await encryptText(dataToSave, password);
    }
    localStorage.setItem('focusmoon_inbox', dataToSave);
    setItems(newItems);
    window.dispatchEvent(new Event('focusmoon_inbox_updated'));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newItem: InboxItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      metadata: {
        date: new Date().toLocaleDateString('ru-RU')
      }
    };
    saveItems([newItem, ...items]);
    setText('');
  };

  const handleDelete = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };

  const Row = ({ index, style }: any) => {
    const item = items[index];
    return (
      <div style={style}>
        <motion.div 
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-3 p-4 rounded-2xl hover:bg-theme-bg/50 group transition-all border border-transparent hover:border-theme-border/50 h-[82px] mb-2 overflow-hidden mx-4"
        >
          <div className="w-8 h-8 rounded-lg bg-theme-bg flex items-center justify-center shrink-0 text-theme-muted group-hover:text-theme-accent transition-colors">
            <span className="material-symbols-outlined text-lg">notes</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-theme-text truncate">{item.text}</p>
            {item.metadata && (Object.keys(item.metadata).length > 0) && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 overflow-hidden h-6">
                {item.metadata.date && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                    <span className="material-symbols-outlined text-[12px]">event</span>
                    {item.metadata.date}
                  </span>
                )}
                {item.metadata.energy && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                    <span className="material-symbols-outlined text-[12px]">bolt</span>
                    {item.metadata.energy}
                  </span>
                )}
                {item.metadata.category && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                    <span className="material-symbols-outlined text-[12px]">folder</span>
                    {item.metadata.category}
                  </span>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={() => handleDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-theme-muted hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </motion.div>
      </div>
    );
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-theme-card border-l border-theme-border shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-theme-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-theme-accent">Inbox</h2>
                <p className="text-[10px] text-theme-muted uppercase font-bold tracking-widest mt-1">Хранилище ваших мыслей</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-theme-bg flex items-center justify-center text-theme-muted transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 border-b border-theme-border">
              <form onSubmit={addItem} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Запишите что-нибудь..."
                  className="w-full bg-theme-bg border-2 border-theme-border/50 text-theme-text rounded-2xl px-6 py-4 outline-none focus:border-theme-accent transition-all text-sm pr-12"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-theme-accent text-text-on-accent rounded-xl flex items-center justify-center shadow-lg shadow-theme-accent/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-hidden">
              {isLocked ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-theme-bg rounded-full flex items-center justify-center mb-4 text-theme-accent animate-pulse">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                  </div>
                  <h3 className="font-bold text-theme-text mb-2">Инбокс зашифрован</h3>
                  <p className="text-xs text-theme-muted mb-6">Введите пароль в настройках, чтобы получить доступ к своим записям.</p>
                  <button 
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new CustomEvent('set_tab', { detail: 'settings' }));
                    }}
                    className="px-6 py-3 bg-theme-accent/10 border border-theme-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-theme-accent hover:bg-theme-accent/20 transition-all"
                  >
                    Перейти в настройки
                  </button>
                </div>
              ) : items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-theme-bg rounded-full flex items-center justify-center mx-auto mb-4 text-theme-muted/30">
                       <span className="material-symbols-outlined text-4xl">inbox</span>
                    </div>
                    <p className="text-theme-muted text-sm italic">Инбокс пуст. Запишите сюда свои мысли.</p>
                  </motion.div>
                ) : (
                  <div 
                    ref={parentRef}
                    className="h-full w-full overflow-auto custom-scrollbar"
                  >
                    <div
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                        const item = items[virtualItem.index];
                        return (
                          <div
                            key={virtualItem.key}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualItem.size}px`,
                              transform: `translateY(${virtualItem.start}px)`,
                            }}
                          >
                            <Row index={virtualItem.index} style={{}} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
export default Inbox;

