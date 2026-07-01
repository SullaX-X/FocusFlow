import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Discipline, Task } from '../types';
import { getPast7Days, formatDate, calculateStreak } from '../types';
import ConfirmModal from './ConfirmModal';
import { generateContent } from '../aiClient';
import { useTheme } from '../ThemeContext';

function getDisciplineProgress(d: Discipline) {
  let completed = 0;
  let total = 0;
  if (d.themes && d.themes.length > 0) {
    d.themes.forEach(t => {
      t.tasks.forEach(task => {
        total++;
        if (task.status === 'done') completed++;
      });
    });
  }
  return { completed, total };
}

function CircularProgress({ percentage, color }: { percentage: number, color: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-theme-border/50"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx="24"
          cy="24"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

function ThemeAccordion({ theme, d, onUpdateTask, setSelectedTask, startFocus }: any) {
  const completedTasks = theme.tasks.filter((t: any) => t.status === 'done').length;
  const isAllDone = theme.tasks.length > 0 && completedTasks === theme.tasks.length;
  const [isOpen, setIsOpen] = useState(!isAllDone);

  useEffect(() => {
    if (isAllDone) {
      setIsOpen(false);
    }
  }, [isAllDone]);

  return (
    <div className="border border-theme-border rounded-xl overflow-hidden mb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-theme-card/50 hover:bg-theme-bg transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="w-4 h-4 text-theme-muted" /> : <ChevronRight className="w-4 h-4 text-theme-muted" />}
          <h4 className={`text-sm font-semibold tracking-wider ${isAllDone ? 'text-theme-accent line-through opacity-70' : 'text-theme-text'}`}>
            {theme.name}
          </h4>
        </div>
        <span className="text-xs font-medium text-theme-muted">
          {completedTasks}/{theme.tasks.length}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-2 bg-theme-card/30">
              {theme.tasks.map((task: any) => (
                <div 
                  key={task.id} 
                  tabIndex={0}
                  onClick={() => setSelectedTask({ disciplineId: d.id, themeId: theme.id, task })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedTask({ disciplineId: d.id, themeId: theme.id, task });
                    } else if (e.key === ' ') {
                      e.preventDefault();
                      onUpdateTask(d.id, theme.id, task.id, { status: task.status === 'done' ? 'plan' : 'done' });
                    } else if (e.key.toLowerCase() === 'f') {
                      if (startFocus) startFocus(task);
                    }
                  }}
                  className="task-item group flex items-center gap-3 bg-theme-bg p-3 rounded-xl border border-theme-border cursor-pointer hover:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent focus:bg-theme-accent/10 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors group-hover:bg-theme-accent/100 group-hover:border-theme-accent group-hover:text-white ${task.status === 'done' ? 'bg-theme-accent/100 border-theme-accent text-white' : 'border-theme-border bg-theme-card'}`}>
                    {task.status === 'done' ? (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100">play_arrow</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-sm truncate ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-theme-text'}`}>
                      {task.title}
                    </span>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-theme-accent transition-all duration-300"
                            style={{ width: `${(task.subtasks.filter((s:any) => s.isCompleted).length / task.subtasks.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-theme-muted font-medium w-6 shrink-0">
                          {task.subtasks.filter((s:any) => s.isCompleted).length}/{task.subtasks.length}
                        </span>
                      </div>
                    )}
                  </div>
                  {task.contentUrl && <span className="material-symbols-outlined text-slate-400 text-sm">link</span>}
                  {task.energy === 'high' && <span className="text-[10px] bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-2 py-0.5 rounded">🧠 High</span>}
                  {task.energy === 'low' && <span className="text-[10px] bg-theme-success/10 text-theme-success dark:bg-theme-success/20 px-2 py-0.5 rounded">🔋 Low</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Disciplines({ disciplines, toggleDay, addDiscipline, deleteDiscipline, editDiscipline, updateTask, startFocus }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<{disciplineId: string, themeId: string, task: Task} | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'progress' | 'done'>('all');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const filteredDisciplines = disciplines
    .filter((d: Discipline) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((d: Discipline) => {
       const { completed, total } = getDisciplineProgress(d);
       const isDone = total > 0 && completed === total;
       if (filterMode === 'done') return isDone;
       if (filterMode === 'progress') return total === 0 || completed < total;
       return true;
    })
    .sort((a: Discipline, b: Discipline) => {
       const aProg = getDisciplineProgress(a);
       const bProg = getDisciplineProgress(b);
       const aPerc = aProg.total > 0 ? aProg.completed / aProg.total : 0;
       const bPerc = bProg.total > 0 ? bProg.completed / bProg.total : 0;
       return aPerc - bPerc; // Sort by lowest completion first
    });

  const allCount = disciplines.length;
  const doneCount = disciplines.filter((d: Discipline) => {
    const { completed, total } = getDisciplineProgress(d);
    return total > 0 && completed === total;
  }).length;
  const progressCount = allCount - doneCount;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pt-4 md:pt-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">Дисциплины</h2>
          <p className="text-theme-muted text-sm md:text-base">Отслеживайте свои ежедневные обязательства и создавайте темп.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-tactile bg-theme-accent hover:bg-theme-accent/90 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Добавить дисциплину
        </button>
      </div>

      <div className="bg-theme-card/40 backdrop-blur-md border border-theme-border p-3 md:p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Поиск..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-theme-bg/50 border border-theme-border rounded-xl outline-none focus:border-theme-accent transition-colors text-theme-text text-sm"
          />
        </div>
        <div className="flex bg-theme-bg/50 border border-theme-border rounded-xl p-1 w-full overflow-x-auto whitespace-nowrap md:w-auto">
          <button 
            onClick={() => setFilterMode('all')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterMode === 'all' ? 'bg-theme-card shadow-sm text-theme-text' : 'text-theme-muted hover:text-theme-text'}`}
          >
            Все ({allCount})
          </button>
          <button 
            onClick={() => setFilterMode('progress')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterMode === 'progress' ? 'bg-theme-card shadow-sm text-theme-text' : 'text-theme-muted hover:text-theme-text'}`}
          >
            В процессе ({progressCount})
          </button>
          <button 
            onClick={() => setFilterMode('done')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterMode === 'done' ? 'bg-theme-card shadow-sm text-theme-accent' : 'text-theme-muted hover:text-theme-text'}`}
          >
            Завершено ({doneCount})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredDisciplines.map((d: Discipline) => {
            const { completed, total } = getDisciplineProgress(d);
            const percentage = total > 0 ? (completed / total) * 100 : 0;

            return (
              <motion.div 
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel rounded-2xl p-4 md:p-5 hover:border-theme-accent/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  {/* Left Side: Icon & Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-theme-accent/10 text-theme-accent border-theme-accent/30">
                      <span className="material-symbols-outlined text-2xl">{d.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-theme-text">{d.name}</h3>
                      <p className="text-theme-muted text-sm mt-0.5 truncate max-w-[200px] sm:max-w-[300px]">{d.description}</p>
                    </div>
                  </div>

                  {/* Middle Side: Streak & History */}
                  <div className="flex items-center gap-6 sm:gap-8">
                    {/* Streak */}
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                      <span className="text-theme-text font-bold text-lg">{calculateStreak(d.history)}</span>
                    </div>

                    {/* 5 Days History */}
                    <div className="flex gap-1.5 items-center">
                      {past7Days.slice(2).map((date) => { // show only last 5 days to match photo style, or maybe keep 7. Let's keep 5 for the row compact look.
                        const isDone = !!d.history[date];
                        const isToday = date === formatDate(new Date());
                        const isPast = date < formatDate(new Date());

                        return (
                          <button
                            key={date}
                            onClick={() => { if (isToday) toggleDay(d.id, date); }}
                            disabled={!isToday}
                            title={date}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border-2 ${
                              isDone 
                                ? 'bg-theme-accent border-theme-accent text-white shadow-[0_0_12px_var(--theme-accent)] cursor-default' 
                                : isToday 
                                  ? 'bg-theme-accent/10 border-theme-accent/40 hover:border-theme-accent cursor-pointer'
                                  : 'bg-theme-bg/30 border-theme-border opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {(isDone || isPast) && (
                              isDone ? (
                                <svg className="w-5 h-5 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-slate-400 dark:text-theme-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              )
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => toggleCollapse(d.id)} 
                      className="text-slate-400 hover:text-theme-accent transition-colors p-2 rounded-lg hover:bg-theme-accent/10"
                      title={collapsedIds.has(d.id) ? "Развернуть" : "Свернуть"}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {collapsedIds.has(d.id) ? 'expand_more' : 'expand_less'}
                      </span>
                    </button>
                    <button 
                      onClick={() => setEditingDiscipline(d)} 
                      className="text-slate-400 hover:text-theme-accent transition-colors p-2 rounded-lg hover:bg-theme-accent/10"
                      title="Редактировать"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(d.id)} 
                      className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                      title="Удалить"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>

                </div>

                {/* Tasks List */}
                <AnimatePresence>
                  {!collapsedIds.has(d.id) && d.themes && d.themes.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-4 border-t border-theme-border">
                        {d.themes.map(t => (
                          <ThemeAccordion 
                            key={t.id} 
                            theme={t} 
                            d={d} 
                            onUpdateTask={handleUpdateTask} 
                            setSelectedTask={setSelectedTask} 
                            startFocus={startFocus} 
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button 
          onClick={() => setIsAdding(true)}
          className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-theme-border hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all group mt-4 bg-theme-card/30"
        >
          <div className="w-12 h-12 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <h3 className="text-xl font-bold text-theme-text mb-1">Новая дисциплина</h3>
          <p className="text-theme-muted text-sm text-center">Создайте новую область для фокуса и установите цели.</p>
        </button>
      </div>

      {isAdding && <AddDisciplineModal onClose={() => setIsAdding(false)} onAdd={addDiscipline} />}
      {editingDiscipline && (
        <AddDisciplineModal 
          onClose={() => setEditingDiscipline(null)} 
          initialData={editingDiscipline}
          onEdit={(updates: any) => editDiscipline(editingDiscipline.id, updates)}
        />
      )}
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
            startFocus={startFocus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskSidePanel({ task, disciplineId, themeId, onClose, onUpdateTask, startFocus }: any) {
  const { theme, actualTheme } = useTheme();
  const isDimoonBase = theme === 'dimoon' || actualTheme === 'dimoon' || theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
  const [url, setUrl] = useState(task.contentUrl || '');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<string[]>(task.quiz || []);
  const [quizStatus, setQuizStatus] = useState<Record<number, 'success' | 'fail' | null>>({});
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSummarize = async () => {
    if (!url) return;
    setErrorMsg('');
    setIsSummarizing(true);
    try {
      const provider = localStorage.getItem('focusflow_ai_provider') || 'gemini';
      const apiKey = provider === 'openai' ? localStorage.getItem('focusflow_openai_key') : localStorage.getItem('focusflow_gemini_key');
      
      const prompt = `Сделай краткое резюме (до 5 предложений) для следующей ссылки или текста. Отвечай строго в формате JSON, без маркдауна и блоков с кодом: {"summary": "текст"}. Контент: ${url}`;
      
      const data = await generateContent(prompt, apiKey);
      if (data && data.summary) {
        onUpdateTask(disciplineId, themeId, task.id, { contentUrl: url, summary: data.summary });
      } else {
        throw new Error('Некорректный ответ от ИИ');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!task.summary) return;
    setErrorMsg('');
    setIsGeneratingQuiz(true);
    try {
      const provider = localStorage.getItem('focusflow_ai_provider') || 'gemini';
      const apiKey = provider === 'openai' ? localStorage.getItem('focusflow_openai_key') : localStorage.getItem('focusflow_gemini_key');

      const prompt = `Составь 3 коротких вопроса для проверки знаний по тексту: "${task.summary}". Отвечай строго в формате JSON, без маркдауна и блоков кода: {"questions": ["вопрос 1", "вопрос 2", "вопрос 3"]}`;
      
      const data = await generateContent(prompt, apiKey);
      if (data && data.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
        onUpdateTask(disciplineId, themeId, task.id, { quiz: data.questions });
      } else {
        throw new Error('Некорректный ответ от ИИ');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleUrlChange = (e: any) => {
    setUrl(e.target.value);
    onUpdateTask(disciplineId, themeId, task.id, { contentUrl: e.target.value });
  };

  const handleStartFocus = () => {
    onClose();
    if (startFocus) startFocus(task);
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
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2">
              <span className="material-symbols-outlined text-red-500 text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {task.description && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Описание</h4>
              <p className="text-theme-muted text-sm">{task.description}</p>
            </div>
          )}

          {/* Subtasks Section */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Чек-лист</h4>
            <div className="space-y-2 mb-3">
              {(task.subtasks || []).map((st: any) => (
                <div key={st.id} className="flex items-center gap-3 group">
                  <button 
                    onClick={() => {
                      const updatedSubtasks = (task.subtasks || []).map((s: any) => 
                        s.id === st.id ? { ...s, isCompleted: !s.isCompleted } : s
                      );
                      onUpdateTask(disciplineId, themeId, task.id, { subtasks: updatedSubtasks });
                    }}
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${st.isCompleted ? 'bg-theme-accent border-theme-accent text-white' : 'border-slate-300 dark:border-theme-border text-transparent'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                  <span className={`text-sm ${st.isCompleted ? 'text-slate-400 line-through' : 'text-theme-text'}`}>{st.title}</span>
                  <button 
                    onClick={() => {
                      const updatedSubtasks = (task.subtasks || []).filter((s: any) => s.id !== st.id);
                      onUpdateTask(disciplineId, themeId, task.id, { subtasks: updatedSubtasks });
                    }}
                    className="ml-auto text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Добавить пункт..."
                className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2 text-theme-text outline-none focus:border-theme-accent transition-colors text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const newSubtask = {
                      id: Math.random().toString(36).substr(2, 9),
                      title: e.currentTarget.value.trim(),
                      isCompleted: false
                    };
                    onUpdateTask(disciplineId, themeId, task.id, { subtasks: [...(task.subtasks || []), newSubtask] });
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>

          <div className="mb-6">
            <button 
              onClick={handleStartFocus}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg bg-theme-accent hover:bg-theme-accent/90 shadow-theme-accent/20 hover:scale-[1.02] active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">{isDimoonBase ? 'rocket_launch' : 'play_arrow'}</span>
              Начать фокус (Ручной запуск)
            </button>
          </div>
          
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ссылка на материалы</h4>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={url}
                onChange={handleUrlChange}
                placeholder="Вставьте ссылку на статью или YouTube..."
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-colors text-sm"
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
                    <span className="material-symbols-outlined text-[20px]">{isDimoonBase ? 'stars' : 'auto_awesome'}</span>
                  )}
                  Сжать в конспект
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
                  <span className="material-symbols-outlined text-[16px] text-theme-accent">auto_awesome</span>
                  Конспект (Smart Summary)
                </h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(task.summary || '');
                    // Could add a toast here, but simple visual feedback is enough for now
                  }}
                  className="text-slate-400 hover:text-theme-accent transition-colors p-1"
                  title="Скопировать Markdown"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>
              <div className="bg-theme-accent/5 border border-theme-accent/10 p-4 rounded-xl mb-4">
                <p className="text-sm text-theme-text-300 whitespace-pre-wrap">{task.summary}</p>
              </div>
              
              {!quizQuestions.length ? (
                <button 
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="w-full py-3 bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isGeneratingQuiz ? (
                    <><span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Составляем вопросы...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[20px]">psychology</span> Проверить себя</>
                  )}
                </button>
              ) : (
                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-theme-accent uppercase tracking-wider flex items-center gap-1 mb-3">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    Проверка знаний
                  </h4>
                  <div className="space-y-3">
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} className={`bg-theme-bg border ${quizStatus[idx] === 'success' ? 'border-theme-success' : quizStatus[idx] === 'fail' ? 'border-red-500' : 'border-theme-border'} p-4 rounded-xl transition-colors`}>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <p className="text-sm text-theme-text font-medium">{idx + 1}. {q}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <button 
                              onClick={() => setQuizStatus(prev => ({...prev, [idx]: prev[idx] === 'success' ? null : 'success'}))}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${quizStatus[idx] === 'success' ? 'bg-theme-success text-white' : 'bg-slate-200 dark:bg-theme-card text-theme-muted hover:text-theme-success'}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                            <button 
                              onClick={() => setQuizStatus(prev => ({...prev, [idx]: prev[idx] === 'fail' ? null : 'fail'}))}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${quizStatus[idx] === 'fail' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-theme-card text-theme-muted hover:text-red-500'}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        </div>
                        <textarea 
                          className="w-full bg-white dark:bg-theme-card border border-slate-200 dark:border-theme-border rounded-lg p-2 text-sm text-theme-text outline-none focus:border-theme-accent transition-colors resize-none"
                          placeholder="Ваш ответ..."
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

export function AddDisciplineModal({ onClose, onAdd, initialData, onEdit }: any) {
  const { theme, actualTheme } = useTheme();
  const isDimoonBase = theme === 'dimoon' || actualTheme === 'dimoon' || theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState(initialData?.icon || 'menu_book');
  const [color, setColor] = useState(initialData?.color || '#494bd6');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isCancelledRef = useRef(false);
  const isEditing = !!initialData;

  const icons = ['menu_book', 'fitness_center', 'psychology', 'self_improvement', 'laptop_mac', 'payments', 'edit', 'code', 'terminal'];
  const colors = ['#494bd6', '#4de082', '#ffb783', '#ec4899', '#8b5cf6', '#eab308', '#14b8a6', '#f97316'];

  const handleGenerate = async () => {
    if (!name) return;
    setErrorMsg('');
    setIsGenerating(true);
    isCancelledRef.current = false;
    try {
      const provider = localStorage.getItem('focusflow_ai_provider') || 'gemini';
      const apiKey = provider === 'openai' ? localStorage.getItem('focusflow_openai_key') : localStorage.getItem('focusflow_gemini_key');

      const prompt = `Создай план обучения по теме "${name}" (уровень: Средний, 30 минут в день). Выдай ответ строго в формате JSON без маркдауна. Формат: {"themes": [{"name": "название темы", "tasks": [{"title": "задача", "description": "описание", "energy": "high"}]}]}`;

      const resData = await generateContent(prompt, apiKey);
      if (isCancelledRef.current) return;
      if (resData && resData.themes) {
        const generatedThemes = resData.themes.map((t: any, idx: number) => ({
          id: `theme_${idx}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: t.name,
          tasks: (t.tasks || []).map((task: any, tIdx: number) => ({
            id: `task_${idx}_${tIdx}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title: task.title,
            description: task.description,
            status: 'plan',
            energy: task.energy || 'high',
            createdAt: new Date().toISOString()
          }))
        }));

        if (isEditing) {
          onEdit({
            name,
            description: description || `AI Сгенерированный план: ${name}`,
            icon,
            color,
            themes: [...(initialData.themes || []), ...generatedThemes]
          });
        } else {
          onAdd({
            id: Math.random().toString(36).substr(2, 9),
            name,
            description: description || `AI Сгенерированный план: ${name}`,
            icon,
            color,
            history: {},
            createdAt: new Date().toISOString(),
            themes: generatedThemes
          });
        }
        onClose();
      } else {
        throw new Error('Не удалось сгенерировать план (неверный формат ИИ)');
      }
    } catch (e: any) {
      if (isCancelledRef.current) return;
      console.error(e);
      setErrorMsg(e.message);
    } finally {
      if (!isCancelledRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!name) return;
    if (isEditing) {
      onEdit({ name, description, icon, color });
      onClose();
    } else {
      setShowConfirm(true);
    }
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
          <h2 className="text-2xl font-bold text-theme-text">{isEditing ? 'Редактировать дисциплину' : 'Новая дисциплина'}</h2>
        </div>
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2">
            <span className="material-symbols-outlined text-red-500 text-base shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {isGenerating ? (
          <div className="py-8 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
               <div className="absolute inset-0 border-4 border-theme-accent/30 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="material-symbols-outlined text-3xl text-theme-accent animate-pulse">{isDimoonBase ? 'stars' : 'auto_awesome'}</span>
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
            <button 
              type="button"
              onClick={() => {
                isCancelledRef.current = true;
                setIsGenerating(false);
              }}
              className="mt-6 w-full py-3 px-4 rounded-xl text-theme-muted font-medium hover:bg-theme-border-bg transition-colors"
            >
              Отмена генерации
            </button>
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
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-colors"
                placeholder="Назовите дисциплину (например, Английский B2)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-muted mb-2">Описание</label>
              <input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-colors"
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
                      icon === i ? 'bg-theme-accent/10 border-theme-accent text-theme-accent border-2' : 'bg-theme-bg border-theme-border text-theme-muted hover:border-theme-accent/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{i}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-muted mb-2">Цвет</label>
              <div className="flex gap-3 flex-wrap">
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
                className="btn-tactile btn-ai bg-theme-accent w-full py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center justify-center gap-2 text-white">
                  <span className="material-symbols-outlined text-[20px]">{isDimoonBase ? 'stars' : 'auto_awesome'}</span>
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
                  {isEditing ? 'Сохранить изменения' : 'Создать пустую'}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
