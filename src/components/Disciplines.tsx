import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2 } from 'lucide-react';
import { Discipline, Task } from '../types';
import { getPast7Days, formatDate, calculateStreak } from '../utils';
import ConfirmModal from './ConfirmModal';

export default function Disciplines({ disciplines, toggleDay, addDiscipline, deleteDiscipline, updateTask, startFocus }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<{disciplineId: string, themeId: string, task: Task} | null>(null);
  const past7Days = getPast7Days();

  const confirmDelete = (id: string) => {
    deleteDiscipline(id);
    setDeleteConfirmId(null);
  };

  const handleUpdateTask = (disciplineId: string, themeId: string, taskId: string, updates: Partial<Task>) => {
    updateTask(disciplineId, themeId, taskId, updates);
    if (selectedTask && selectedTask.task.id === taskId) {
      setSelectedTask({ ...selectedTask, task: { ...selectedTask.task, ...updates } });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pt-4 md:pt-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">Дисциплины</h2>
          <p className="text-theme-muted text-sm md:text-base">Отслеживайте свои ежедневные обязательства и создавайте темп.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#494bd6] dark:hover:bg-[#c0c1ff] dark:hover:text-[#1000a9] px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 dark:shadow-[#494bd6]/20 whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Добавить дисциплину
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {disciplines.map((d: Discipline) => (
            <motion.div 
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-theme-card border border-theme-border rounded-2xl p-4 md:p-5 hover:border-slate-300 dark:hover:border-[#464554] transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-opacity-20 shrink-0" style={{ backgroundColor: `${d.color}20`, color: d.color, border: `1px solid ${d.color}40` }}>
                    <span className="material-symbols-outlined text-xl md:text-2xl">{d.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-theme-text truncate max-w-[150px] sm:max-w-[300px]">{d.name}</h3>
                    <p className="text-theme-muted text-xs md:text-sm mt-1 truncate max-w-[150px] sm:max-w-[300px]">{d.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <div className="flex items-center gap-1 md:gap-1.5 bg-green-50 dark:bg-theme-border px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-green-100 dark:border-theme-border">
                    <span className="material-symbols-outlined text-green-500 dark:text-[#4de082] text-sm md:text-base" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                    <span className="text-green-600 dark:text-[#4de082] font-bold text-xs md:text-sm">{calculateStreak(d.history)}</span>
                  </div>
                  <button onClick={() => setDeleteConfirmId(d.id)} className="text-slate-400 hover:text-red-500 dark:text-theme-muted dark:hover:text-[#ffb4ab] transition-colors p-1 md:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-[#93000a]/20">
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-1 md:gap-2 justify-between">
                {past7Days.map((date, i) => {
                  const isDone = !!d.history[date];
                  const [y, m, dDay] = date.split('-');
                  const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(dDay));
                  const dayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dObj.getDay()];
                  const isToday = date === formatDate(new Date());
                  const isPast = date < formatDate(new Date());

                  return (
                    <div key={date} className="flex flex-col items-center gap-1.5 md:gap-2 flex-1">
                      <span className={`text-[10px] md:text-xs font-medium ${isToday ? 'text-blue-600 dark:text-[#c0c1ff]' : 'text-theme-muted'}`}>{dayName}</span>
                      <button
                        onClick={() => toggleDay(d.id, date)}
                        className={`w-full aspect-square rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                          isDone 
                            ? 'bg-green-500 border-green-500 dark:bg-[#00b55d] dark:border-[#00b55d] shadow-[0_0_12px_rgba(34,197,94,0.3)] dark:shadow-[0_0_12px_rgba(0,181,93,0.3)]' 
                            : isToday 
                              ? 'bg-blue-50 border-blue-300 dark:bg-theme-border dark:border-[#494bd6]/50'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-theme-bg dark:border-theme-border dark:hover:border-[#464554]'
                        }`}
                      >
                        {isDone && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <span className="material-symbols-outlined text-white dark:text-[#003919] font-bold text-sm md:text-lg">check</span>
                          </motion.div>
                        )}
                        {!isDone && isPast && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <span className="material-symbols-outlined text-slate-400/70 dark:text-theme-muted/50 font-bold text-sm md:text-lg">close</span>
                          </motion.div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Tasks List */}
              {d.themes && d.themes.length > 0 && (
                <div className="mt-6 pt-4 border-t border-theme-border space-y-4">
                  {d.themes.map(t => (
                    <div key={t.id}>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.name}</h4>
                      <div className="space-y-2">
                        {t.tasks.map(task => (
                          <div 
                            key={task.id} 
                            tabIndex={0}
                            onClick={() => setSelectedTask({ disciplineId: d.id, themeId: t.id, task })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setSelectedTask({ disciplineId: d.id, themeId: t.id, task });
                              } else if (e.key === ' ') {
                                e.preventDefault();
                                handleUpdateTask(d.id, t.id, task.id, { status: task.status === 'done' ? 'plan' : 'done' });
                              } else if (e.key.toLowerCase() === 'f') {
                                if (startFocus) startFocus(task);
                              } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                                e.preventDefault();
                                const items = Array.from(document.querySelectorAll('.task-item')) as HTMLElement[];
                                const index = items.indexOf(e.currentTarget);
                                if (e.key === 'ArrowDown' && index < items.length - 1) {
                                  items[index + 1].focus();
                                } else if (e.key === 'ArrowUp' && index > 0) {
                                  items[index - 1].focus();
                                }
                              }
                            }}
                            className="task-item group flex items-center gap-3 bg-theme-bg p-3 rounded-xl border border-theme-border cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-blue-900/20 transition-colors"
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white ${task.status === 'done' ? 'bg-blue-500 border-blue-500 text-white' : 'border-theme-border bg-theme-card'}`}>
                              {task.status === 'done' ? (
                                <span className="material-symbols-outlined text-[14px]">check</span>
                              ) : (
                                <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100">play_arrow</span>
                              )}
                            </div>
                            <span className={`text-sm flex-1 ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-theme-text'}`}>
                              {task.title}
                            </span>
                            {task.contentUrl && <span className="material-symbols-outlined text-slate-400 text-sm">link</span>}
                            {task.energy === 'high' && <span className="text-[10px] bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-2 py-0.5 rounded">🧠 High</span>}
                            {task.energy === 'low' && <span className="text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded">🔋 Low</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {disciplines.length === 0 && (
          <div className="text-center py-20 bg-theme-card rounded-2xl border border-dashed border-theme-border">
            <p className="text-theme-muted">Дисциплины еще не добавлены. Создайте новую, чтобы начать отслеживание!</p>
          </div>
        )}
      </div>

      {isAdding && <AddDisciplineModal onClose={() => setIsAdding(false)} onAdd={addDiscipline} />}
      {deleteConfirmId && (
        <ConfirmModal 
          title="Удаление дисциплины" 
          message="Вы уверены, что хотите удалить эту дисциплину? Это действие нельзя отменить." 
          onConfirm={() => confirmDelete(deleteConfirmId)} 
          onCancel={() => setDeleteConfirmId(null)} 
        />
      )}
      
      <AnimatePresence>
        {selectedTask && (
          <TaskSidePanel 
            task={selectedTask.task} 
            disciplineId={selectedTask.disciplineId}
            themeId={selectedTask.themeId}
            onClose={() => setSelectedTask(null)}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskSidePanel({ task, disciplineId, themeId, onClose, onUpdateTask }: any) {
  const [url, setUrl] = useState(task.contentUrl || '');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!url) return;
    setIsSummarizing(true);
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (data.success) {
        onUpdateTask(disciplineId, themeId, task.id, { contentUrl: url, summary: data.summary });
      } else {
        alert('Ошибка суммаризации: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Сетевая ошибка при суммаризации');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleUrlChange = (e: any) => {
    setUrl(e.target.value);
    onUpdateTask(disciplineId, themeId, task.id, { contentUrl: e.target.value });
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]" onClick={onClose} />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-theme-card border-l border-theme-border shadow-2xl z-[110] flex flex-col"
      >
        <div className="p-6 border-b border-theme-border flex justify-between items-start">
          <h3 className="text-xl font-bold text-theme-text">{task.title}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-theme-text rounded-full hover:bg-theme-border-border">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {task.description && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Описание</h4>
              <p className="text-theme-muted text-sm">{task.description}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ссылка на материалы</h4>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={url}
                onChange={handleUrlChange}
                placeholder="https://youtube.com/... или статья"
                className="w-full bg-slate-50 border-slate-200 text-slate-900 dark:bg-theme-bg border dark:border-theme-border rounded-xl px-4 py-3 dark:text-theme-text outline-none focus:border-blue-500 transition-colors text-sm"
              />
              <button 
                onClick={handleSummarize}
                disabled={!url || isSummarizing}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-all relative group overflow-hidden disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] transition-opacity"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isSummarizing ? (
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  )}
                  ✨ Сжать в конспект
                </span>
              </button>
            </div>
          </div>

          {isSummarizing && (
            <div className="space-y-3 animate-pulse mb-6">
              <div className="h-4 bg-theme-border-border rounded w-3/4"></div>
              <div className="h-4 bg-theme-border-border rounded w-full"></div>
              <div className="h-4 bg-theme-border-border rounded w-5/6"></div>
              <div className="h-4 bg-theme-border-border rounded w-2/3"></div>
            </div>
          )}

          {task.summary && !isSummarizing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-purple-500">auto_awesome</span>
                  Конспект (Smart Summary)
                </h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(task.summary || '');
                    // Could add a toast here, but simple visual feedback is enough for now
                  }}
                  className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                  title="Скопировать Markdown"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>
              <div className="bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10 p-4 rounded-xl">
                <p className="text-sm text-theme-text-300 whitespace-pre-wrap">{task.summary}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function AddDisciplineModal({ onClose, onAdd }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('menu_book');
  const [color, setColor] = useState('#494bd6');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const icons = ['menu_book', 'fitness_center', 'psychology', 'self_improvement', 'laptop_mac', 'payments', 'edit'];
  const colors = ['#494bd6', '#4de082', '#ffb783', '#ec4899', '#8b5cf6', '#eab308'];

  const handleGenerate = async () => {
    if (!name) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: name,
          level: 'Средний',
          time: '30 минут'
        })
      });
      const resData = await response.json();
      if (resData.success) {
        const generatedThemes = resData.data.themes?.map((t: any, idx: number) => ({
          id: `t${idx}`,
          name: t.name,
          tasks: (t.tasks || []).map((task: any, tIdx: number) => ({
            id: `t${idx}_${tIdx}`,
            title: task.title,
            description: task.description,
            status: 'plan',
            energy: task.energy,
            createdAt: new Date().toISOString()
          }))
        })) || [];

        onAdd({
          id: Math.random().toString(36).substr(2, 9),
          name,
          description: description || `AI Сгенерированный курс: ${name}`,
          icon,
          color,
          history: {},
          createdAt: new Date().toISOString(),
          themes: generatedThemes
        });
        onClose();
      } else {
        alert('Ошибка генерации: ' + resData.error);
      }
    } catch (e) {
      console.error(e);
      alert('Сетевая ошибка при генерации плана');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!name) return;
    setShowConfirm(true);
  };

  const confirmAdd = () => {
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      icon,
      color,
      history: {},
      createdAt: new Date().toISOString(),
      themes: []
    });
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {showConfirm && (
        <ConfirmModal 
          title="Добавление дисциплины" 
          message="Вы уверены, что хотите добавить эту дисциплину?" 
          onConfirm={confirmAdd} 
          onCancel={() => setShowConfirm(false)} 
        />
      )}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-theme-card border border-theme-border rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-theme-text">Новая дисциплина</h2>
        </div>
        
        {isGenerating ? (
          <div className="py-8 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
               <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="material-symbols-outlined text-3xl text-blue-500 animate-pulse">auto_awesome</span>
               </div>
            </div>
            <div>
               <h3 className="text-lg font-semibold text-theme-text mb-2">Gemini анализирует тему</h3>
               <p className="text-sm text-theme-muted">и составляет расписание...</p>
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-10 bg-theme-border-800/50 rounded-xl w-full animate-pulse"></div>
              <div className="h-10 bg-theme-border-800/50 rounded-xl w-5/6 mx-auto animate-pulse"></div>
              <div className="h-10 bg-theme-border-800/50 rounded-xl w-4/5 mx-auto animate-pulse"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-theme-text-muted mb-2">Название</label>
              <input 
                autoFocus
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border-slate-200 text-slate-900 dark:bg-theme-bg border dark:border-theme-border rounded-xl px-4 py-3 dark:text-theme-text outline-none focus:border-blue-500 transition-colors"
                placeholder="например, Глубокая работа"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-muted mb-2">Описание</label>
              <input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-50 border-slate-200 text-slate-900 dark:bg-theme-bg border dark:border-theme-border rounded-xl px-4 py-3 dark:text-theme-text outline-none focus:border-blue-500 transition-colors"
                placeholder="например, 2 часа без отвлечений"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-muted mb-2">Иконка</label>
              <div className="flex gap-2 flex-wrap">
                {icons.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all border ${
                      icon === i ? 'bg-blue-50 dark:bg-blue-500/20 border-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-theme-bg border-theme-border text-slate-500 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{i}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-muted mb-2">Цвет</label>
              <div className="flex gap-3">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-theme-card scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c, '--tw-ring-color': c } as any}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-6 border-t border-theme-border mt-6">
              <button 
                type="button"
                onClick={handleGenerate}
                disabled={!name}
                className="w-full py-4 rounded-xl font-bold transition-all relative group overflow-hidden disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] transition-opacity"></div>
                <span className="relative flex items-center justify-center gap-2 text-white">
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  Сгенерировать план с ИИ
                </span>
              </button>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl text-theme-muted font-medium hover:bg-theme-border-bg transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  disabled={!name}
                  className="flex-1 py-3 px-4 rounded-xl bg-theme-border-bg hover:bg-slate-200 dark:hover:bg-slate-800 text-theme-text border border-theme-border font-medium transition-colors disabled:opacity-50"
                >
                  Создать пустую
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
