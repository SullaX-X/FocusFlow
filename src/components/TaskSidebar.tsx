import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline, Task } from '../types';

export default function TaskSidebar({ isOpen, onClose, onSave, disciplines }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [energy, setEnergy] = useState<'high' | 'low' | undefined>();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(disciplines[0]?.id || '');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setContentUrl('');
      setEnergy(undefined);
      setSelectedDiscipline(disciplines[0]?.id || '');
    }
  }, [isOpen, disciplines]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedDiscipline) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      contentUrl,
      status: 'plan',
      energy,
      createdAt: new Date().toISOString()
    };
    onSave(selectedDiscipline, newTask);
    onClose();
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-theme-card border-l border-theme-border shadow-2xl z-[101] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-theme-border">
              <h2 className="text-xl font-bold text-theme-text">Новая задача</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-theme-border-border rounded-full transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-text-muted mb-2">Название задачи</label>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-colors"
                  placeholder="Что нужно сделать?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-muted mb-2">Дисциплина</label>
                <select
                  value={selectedDiscipline}
                  onChange={e => setSelectedDiscipline(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-colors appearance-none"
                >
                  {disciplines.map((d: Discipline) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-muted mb-2">Уровень энергии</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEnergy('high')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                      energy === 'high' ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/20 dark:border-orange-500/50 dark:text-orange-400' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-theme-bg dark:border-theme-border hover:bg-theme-border-border'
                    }`}
                  >
                    🧠 Высокая
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnergy('low')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                      energy === 'low' ? 'bg-theme-success/10 border-theme-success/30 text-theme-success dark:bg-theme-success/20 dark:border-theme-success/50' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-theme-bg dark:border-theme-border hover:bg-theme-border-border'
                    }`}
                  >
                    🔋 Низкая
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Поможет AI советовать задачи в зависимости от вашей усталости.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-muted mb-2">Ссылка на материал (опционально)</label>
                <input 
                  type="url" 
                  value={contentUrl}
                  onChange={e => setContentUrl(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-colors"
                  placeholder="Вставьте ссылку на статью или YouTube..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-muted mb-2">Заметки</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-colors resize-none"
                  placeholder="Дополнительная информация..."
                />
              </div>
            </form>
            
            <div className="p-6 border-t border-theme-border flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl text-theme-muted font-medium hover:bg-theme-border-bg transition-colors"
              >
                Отмена
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={!title || !selectedDiscipline}
                className="flex-1 py-3 px-4 rounded-xl bg-theme-accent hover:bg-theme-accent/90 text-white font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
