import React, { useState } from 'react';
import { Discipline, Task } from '../../types';
import { calculateStreak, calculateGlobalStreak, formatDate, getPast7Days } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { AddDisciplineModal } from './Disciplines';
import { useTheme } from '../../services/ThemeContext';

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

function MiniCircularProgress({ percentage, color }: { percentage: number, color: string }) {
  const radius = 24;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const size = (radius + stroke) * 2;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-theme-border/50" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="drop-shadow-md" />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>{Math.round(percentage)}%</span>
    </div>
  );
}

const Dashboard = React.memo(({ disciplines, toggleDay, startFocus, stats, updateWeeklyGoal, updateDailyGoal, claimBonusDust, addDiscipline }: any) => {
  const { theme, actualTheme, performanceMode } = useTheme();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(stats?.weeklyGoal || 10);
  const [isEditingDailyGoal, setIsEditingDailyGoal] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState(stats?.dailyGoal || 120);
  const [isAdding, setIsAdding] = useState(false);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [claimedWeekly, setClaimedWeekly] = useState(false);
  const [claimedDaily, setClaimedDaily] = useState(false);
  const today = formatDate(new Date());
  const past7Days = getPast7Days();
  
  const globalStreak = calculateGlobalStreak(disciplines);

  // Calculate today's focused hours
  const todayMinutes = stats?.dailyMinutes?.[formatDate(new Date())] || 0;
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;
  
  const dailyGoal = stats?.dailyGoal || 120; // default 120 mins (2 hours)
  const rawDailyPercent = (todayMinutes / dailyGoal) * 100;
  const dailyProgressPercent = Math.min(rawDailyPercent, 100);
  const isDailyGoalExceeded = rawDailyPercent > 100;
  const excessDailyPercent = isDailyGoalExceeded ? (rawDailyPercent - 100) : 0;
  const remainingDailyMins = Math.max(dailyGoal - todayMinutes, 0);

  // Calculate this week's progress
  const getWeekProgress = () => {
    let weeklyMinutes = 0;
    const dDate = new Date();
    const day = dDate.getDay() || 7;
    dDate.setHours(0,0,0,0);
    dDate.setDate(dDate.getDate() - day + 1);
    
    for (let i = 0; i < 7; i++) {
      const dateStr = formatDate(dDate);
      weeklyMinutes += (stats?.dailyMinutes?.[dateStr] || 0);
      dDate.setDate(dDate.getDate() + 1);
    }
    return weeklyMinutes / 60;
  };

  const weeklyProgress = getWeekProgress();
  const weeklyGoal = stats?.weeklyGoal || 10;
  const rawProgressPercent = (weeklyProgress / weeklyGoal) * 100;
  const progressPercent = Math.min(rawProgressPercent, 100);
  const isGoalExceeded = rawProgressPercent > 100;
  const excessPercent = isGoalExceeded ? (rawProgressPercent - 100) : 0;
  const remainingHours = Math.max(weeklyGoal - weeklyProgress, 0).toFixed(1);
  const excessHours = Math.max(weeklyProgress - weeklyGoal, 0).toFixed(1);

  let suggestedTask: { task: Task, disciplineName: string } | null = null;
  for (const d of disciplines) {
    if (d.themes) {
      for (const t of d.themes) {
        const activeTask = t.tasks.find((task: Task) => task.status !== 'done');
        if (activeTask) {
          suggestedTask = { task: activeTask, disciplineName: d.name };
          break;
        }
      }
    }
    if (suggestedTask) break;
  }

  const hour = new Date().getHours();
  let greeting = 'Добрый день';
  if (hour < 12) greeting = 'Доброе утро';
  if (hour > 18) greeting = 'Добрый вечер';
  
  const isDimoon = theme === 'dimoon' || actualTheme === 'dimoon';
  const isDimoonBlue = theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
  const isDimoonBase = isDimoon || isDimoonBlue;
  const isCyberPulse = actualTheme === 'cyber-pulse';
  const isMonoDark = actualTheme === 'mono-dark';
  const greetingEmoji = isDimoonBase ? '🌖' : '👋';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 2xl:pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 pt-4 md:pt-0 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">{greeting}, {stats?.userName || 'Гость'} {greetingEmoji}</h1>
          <p className="text-base md:text-lg text-theme-muted">Что будем делать прямо сейчас?</p>
        </div>
        
        {/* Focus Dust Indicator */}
        <div className="flex items-center gap-2 bg-theme-card border border-theme-border rounded-2xl px-4 py-2 shadow-sm will-change-transform">
          <div className="w-8 h-8 rounded-full bg-theme-accent/10 flex items-center justify-center relative overflow-hidden group">
            <span className="material-symbols-outlined text-theme-accent text-sm relative z-10">auto_awesome</span>
            {/* simple particle animation for visual flair */}
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_50%_50%,_rgba(var(--color-theme-accent-rgb),0.2)_0%,_transparent_70%)] animate-pulse"></div>
          </div>
          <div>
            <div className="text-xs text-theme-muted font-medium uppercase tracking-wider">Звездная пыльца</div>
            <div className="text-lg font-bold text-theme-text font-mono leading-none">{stats?.focusDust || 0} <span className="text-xs font-normal text-theme-muted/50">FD</span></div>
          </div>
        </div>
      </div>

      {suggestedTask ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-2xl mb-8 relative overflow-hidden transition-all duration-300 bg-theme-card border-2 border-theme-accent shadow-premium text-theme-text"
        >
          {/* Decorative effects for special themes */}
          {(isDimoonBase || isCyberPulse) && (
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `radial-gradient(1.5px 1.5px at 10% 20%, ${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FDE047'} 100%, transparent), radial-gradient(1px 1px at 40% 60%, #fff 100%, transparent), radial-gradient(2px 2px at 80% 30%, ${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FDE047'} 100%, transparent)`, backgroundSize: '100px 100px' }}></div>
          )}
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider bg-theme-accent/20 text-theme-accent">{suggestedTask.disciplineName}</span>
                {suggestedTask.task.energy === 'high' && <span className="text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider bg-theme-accent/20 text-theme-accent">🧠 High Energy</span>}
                {suggestedTask.task.energy === 'low' && <span className="text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider bg-theme-success/20 text-theme-success">🔋 Low Energy</span>}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 truncate w-full" title={suggestedTask.task.title}>{suggestedTask.task.title}</h2>
              {suggestedTask.task.description && <p className="text-theme-muted max-w-lg truncate w-full" title={suggestedTask.task.description}>{suggestedTask.task.description}</p>}
            </div>
            <button 
              onClick={() => startFocus(suggestedTask?.task)}
              className={`btn-tactile flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shrink-0 ${
                isDimoonBase || isCyberPulse || isMonoDark
                  ? 'bg-theme-accent text-text-on-accent hover:scale-105 active:scale-95' 
                  : 'bg-theme-bg text-theme-text hover:brightness-95 dark:hover:brightness-110'
              }`}
            >
              <span className="material-symbols-outlined font-bold">{isDimoonBase ? 'rocket_launch' : (isCyberPulse ? 'bolt' : 'play_arrow')}</span>
              Начать фокус
            </button>
          </div>
          {!(isDimoonBase || isCyberPulse || isMonoDark) && (
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-theme-accent/100 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 md:p-8 rounded-2xl mb-8 text-center"
        >
          <div className="w-16 h-16 bg-theme-border rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="material-symbols-outlined text-theme-muted text-3xl">{isDimoonBase ? 'stars' : 'task'}</span>
          </div>
          <h2 className="text-xl font-bold text-theme-text mb-2">Все задачи выполнены</h2>
          <p className="text-theme-muted">Отличная работа! Можете отдохнуть или добавить новые задачи.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10 overflow-visible">
        <motion.div initial={performanceMode ? {} : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: performanceMode ? 0 : 0.1, duration: performanceMode ? 0 : 0.3 }} className="glass-panel p-6 rounded-2xl group hover:-translate-y-0.5 transition-transform will-change-transform">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-theme-accent flex items-center justify-center text-text-on-accent shadow-accent">
              <span className="material-symbols-outlined text-3xl drop-shadow-md" style={{fontVariationSettings: "'FILL' 1"}}>{isDimoonBase ? 'stars' : 'local_fire_department'}</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm">Глобальный стрик</p>
              <p className="text-2xl lg:text-3xl font-bold text-theme-text">{globalStreak} <span className="text-lg text-theme-muted/40 font-normal">дней</span></p>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={performanceMode ? {} : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: performanceMode ? 0 : 0.15, duration: performanceMode ? 0 : 0.3 }} className="glass-panel p-6 rounded-2xl group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-theme-accent flex items-center justify-center text-text-on-accent shadow-accent">
              <span className="material-symbols-outlined text-3xl drop-shadow-md" style={{fontVariationSettings: "'FILL' 1"}}>{isDimoonBase ? 'timelapse' : 'timer'}</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm">Время в фокусе (сегодня)</p>
              <p className="text-2xl lg:text-3xl font-bold text-theme-text">{todayHours} <span className="text-lg text-theme-muted/40 font-normal">ч</span> {todayMins} <span className="text-lg text-theme-muted/40 font-normal">м</span></p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={performanceMode ? {} : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: performanceMode ? 0 : 0.2, duration: performanceMode ? 0 : 0.3 }} className="glass-panel p-6 rounded-2xl group hover:-translate-y-0.5 transition-transform flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-theme-accent flex items-center justify-center text-text-on-accent shadow-accent">
              <span className="material-symbols-outlined text-3xl drop-shadow-md" style={{fontVariationSettings: "'FILL' 1"}}>{isDimoonBase ? 'star' : 'flag'}</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm">Цель на неделю</p>
              <div className="text-3xl font-bold text-theme-text flex items-center gap-2 group/edit relative mt-1">
                <span>{weeklyProgress % 1 === 0 ? weeklyProgress : weeklyProgress.toFixed(1)}</span>
                <span className="text-lg text-theme-muted/40 font-normal">/</span>
                {isEditingGoal ? (
                  <input 
                    autoFocus type="number" value={goalInput}
                    onChange={(e) => setGoalInput(Number(e.target.value))}
                    onBlur={() => { updateWeeklyGoal(goalInput); setIsEditingGoal(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateWeeklyGoal(goalInput); setIsEditingGoal(false); } }}
                    className="w-16 bg-transparent border-b border-theme-accent outline-none text-theme-text"
                  />
                ) : (
                  <span className="text-lg text-theme-muted/40 font-normal cursor-pointer hover:text-theme-accent transition-colors" onClick={() => setIsEditingGoal(true)}>
                    {weeklyGoal} ч
                  </span>
                )}
              </div>
              <p className="text-xs text-theme-accent mt-1">Осталось {remainingHours} часа</p>
            </div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90 transform">
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-theme-border/20" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                fill="none" 
                strokeWidth="6" 
                strokeLinecap="round" 
                className={`stroke-theme-accent ${performanceMode ? '' : 'transition-all duration-1000'}`} 
                strokeDasharray="175.93" 
                strokeDashoffset={175.93 - (175.93 * progressPercent) / 100} 
              />
            </svg>
            <span className="absolute text-sm font-bold text-theme-text">{Math.round(rawProgressPercent)}%</span>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
          <span className="material-symbols-outlined text-theme-accent text-xl">today</span>
          Оставшиеся дисциплины на сегодня
        </h2>
        <div className="flex bg-theme-bg/50 border border-theme-border rounded-xl p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-theme-card shadow-sm text-theme-accent' : 'text-theme-muted hover:text-theme-text'}`}
            title="Сетка"
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-theme-card shadow-sm text-theme-accent' : 'text-theme-muted hover:text-theme-text'}`}
            title="Список"
          >
            <span className="material-symbols-outlined text-[20px]">view_list</span>
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
        {disciplines.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl col-span-full text-theme-muted">Нет дисциплин. Перейдите на вкладку «Дисциплины», чтобы добавить новую.</div>
        ) : (
          disciplines.map((d: Discipline, idx: number) => {
            const isDone = !!(d.history && d.history[today]);
            const { completed, total } = getDisciplineProgress(d);
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            const isExpanded = expandedIds.has(d.id);

            if (viewMode === 'list') {
              return (
                <motion.div 
                  layout
                  key={d.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className={`rounded-xl flex flex-col transition-all border border-theme-border/50 group overflow-hidden ${isDone ? 'opacity-60 bg-theme-card/50' : 'bg-theme-card hover:border-theme-accent/30'} ${isExpanded ? 'ring-1 ring-theme-accent/30 shadow-md' : ''}`}
                >
                  <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={(e) => toggleExpand(d.id, e)}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (!isDone) toggleDay(d.id, today); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${isDone ? 'bg-theme-accent border-theme-accent text-text-on-accent' : 'bg-theme-bg border-theme-border text-transparent hover:border-theme-accent group-hover:text-theme-accent/40'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{isDone ? 'check' : 'play_arrow'}</span>
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-theme-bg/50 border border-theme-border flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-theme-accent">{d.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-bold truncate ${isDone ? 'text-theme-muted line-through' : 'text-theme-text'}`}>{d.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[9px] text-theme-muted uppercase font-bold tracking-widest">{isDone ? 'Завершено' : 'В процессе'}</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-theme-accent text-[10px]" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                          <span className="text-[10px] font-bold text-theme-muted">{calculateStreak(d.history || {})}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1.5 mr-2">
                        {past7Days.map((dateStr, i) => {
                          const [yyyy, mm, dd] = dateStr.split("-").map(Number);
const date = new Date(yyyy, mm - 1, dd);
                          const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                          const dayLetter = dayNames[date.getDay()];
                          const active = !!(d.history && d.history[dateStr]);
                          return (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                              <span className={`text-[10px] font-bold ${active ? 'text-theme-accent' : 'text-theme-muted opacity-50'}`}>
                                {dayLetter}
                              </span>
                              <div 
                                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                                  active 
                                    ? 'bg-theme-accent text-text-on-accent border border-theme-accent' 
                                    : 'bg-theme-bg/50 border border-theme-border/50'
                                }`}
                              >
                                {active && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <span className="material-symbols-outlined text-theme-muted text-[18px] transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden bg-theme-bg/20 border-t border-theme-border/30"
                      >
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-theme-card/50 rounded-xl border border-theme-border/50">
                              <p className="text-[9px] text-theme-muted uppercase font-bold tracking-wider mb-1">Прогресс</p>
                              <p className="text-lg font-bold text-theme-text">{completed} / {total}</p>
                            </div>
                            <div className="p-3 bg-theme-card/50 rounded-xl border border-theme-border/50">
                              <p className="text-[9px] text-theme-muted uppercase font-bold tracking-wider mb-1">Фокус сегодня</p>
                              <p className="text-lg font-bold text-theme-text">{(d.history ? d.history[today] : undefined) || 0} мин</p>
                            </div>
                          </div>
                          <div className="space-y-1.5 mt-2">
                            <p className="text-[9px] text-theme-muted font-bold uppercase tracking-wider">История (7 дней)</p>
                            <div className="flex gap-1 justify-between">
                              {past7Days.map((dateStr, i) => {
                                const [yyyy, mm, dd] = dateStr.split("-").map(Number);
const date = new Date(yyyy, mm - 1, dd);
                                const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                                const dayLetter = dayNames[date.getDay()];
                                const active = !!(d.history && d.history[dateStr]);
                                const isToday = dateStr === today;
                                const isFuture = dateStr > today;
                                return (
                                  <div key={i} className="flex flex-col items-center gap-1">
                                    <span className={`text-[8px] font-bold ${active ? 'text-theme-accent' : isFuture ? 'text-theme-muted opacity-30' : 'text-theme-muted opacity-70'}`}>
                                      {dayLetter}
                                    </span>
                                    <div 
                                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                                        isFuture 
                                          ? 'bg-theme-bg/20 border border-transparent opacity-10' 
                                          : active 
                                            ? 'bg-theme-accent text-text-on-accent border border-theme-accent shadow-sm' 
                                            : isToday 
                                              ? 'bg-theme-accent/10 border border-theme-accent/30 animate-pulse' 
                                              : 'bg-theme-bg/50 border border-theme-border opacity-30'
                                      }`}
                                    >
                                      {active && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }

            return (
              <motion.div 
                layout
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={`rounded-2xl flex flex-col transition-all duration-300 group border overflow-hidden cursor-pointer ${isDone ? 'opacity-60 bg-theme-card/50 border-theme-border/30' : 'bg-theme-card border-theme-border/50 shadow-sm hover:shadow-md hover:border-theme-border/80'} ${isExpanded ? 'ring-1 ring-theme-accent/30 shadow-xl z-10' : ''}`}
                onClick={(e) => toggleExpand(d.id, e)}
              >
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-theme-accent/10 rounded-2xl flex items-center justify-center text-theme-accent border border-theme-accent/20">
                        <span className="material-symbols-outlined text-[26px]">{d.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-bold text-lg tracking-tight truncate max-w-[150px] ${isDone ? 'text-theme-muted line-through' : 'text-theme-text'}`}>{d.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-1 bg-theme-accent/10 px-1.5 py-0.5 rounded text-theme-accent">
                             <span className="material-symbols-outlined text-[10px]" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                             <span className="text-[10px] font-bold">{calculateStreak(d.history || {})}</span>
                          </div>
                          <span className="text-[10px] text-theme-muted font-bold uppercase tracking-widest">{isDone ? '✓ Готово' : '● В деле'}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (!isDone) toggleDay(d.id, today); }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isDone ? 'bg-theme-accent border-theme-accent text-text-on-accent shadow-lg shadow-theme-accent/30' : 'bg-theme-bg border-theme-border text-theme-accent hover:bg-theme-accent hover:text-text-on-accent'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{isDone ? 'check' : 'play_arrow'}</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-theme-muted">
                      <span>Прогресс</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-theme-bg rounded-full overflow-hidden">
                      <div className="h-full bg-theme-accent transition-all duration-700" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-theme-border/30 bg-theme-bg/10"
                    >
                    <div className="p-5 pt-2 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-theme-muted text-[10px] font-bold uppercase tracking-wider mb-1">Всего времени</p>
                          <p className="text-2xl font-bold text-theme-text font-mono">{completed * 25}<span className="text-xs opacity-40 ml-1">мин</span></p>
                        </div>
                        <MiniCircularProgress percentage={percentage} color={d.color || 'var(--color-theme-accent)'} />
                      </div>

                      <div className="space-y-2 mt-2">
                        <p className="text-theme-muted text-[10px] font-bold uppercase tracking-wider">История активности</p>
                        <div className="flex gap-1 justify-between">
                          {past7Days.map((dateStr, i) => {
                            const [yyyy, mm, dd] = dateStr.split("-").map(Number);
const date = new Date(yyyy, mm - 1, dd);
                            const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                            const dayLetter = dayNames[date.getDay()];
                            const active = !!(d.history && d.history[dateStr]);
                            const isToday = dateStr === today;
                            const isFuture = dateStr > today;
                            return (
                              <div key={i} className="flex flex-col items-center gap-1.5">
                                <span className={`text-[9px] font-bold ${active ? 'text-theme-accent' : isFuture ? 'text-theme-muted opacity-30' : 'text-theme-muted opacity-70'}`}>
                                  {dayLetter}
                                </span>
                                <div 
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                                    isFuture 
                                      ? 'bg-theme-bg/20 border border-transparent opacity-10' 
                                      : active 
                                        ? 'bg-theme-accent text-text-on-accent border border-theme-accent shadow-sm' 
                                        : isToday 
                                          ? 'bg-theme-accent/10 border border-theme-accent/30 animate-pulse' 
                                          : 'bg-theme-bg/50 border border-theme-border opacity-30'
                                  }`}
                                >
                                  {active && <div className="w-2 h-2 rounded-full bg-current" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </motion.div>
            );
          })

        )}
        
        <button 
          onClick={() => setIsAdding(true)}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-theme-border hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all group ${viewMode === 'list' ? 'p-3 flex-row gap-4 border-none bg-theme-card/30' : 'p-6 h-full min-h-[160px]'}`}
        >
          <div className="w-8 h-8 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </div>
          <div className={viewMode === 'list' ? 'flex-1 text-left' : 'text-center mt-2'}>
            <h3 className="text-sm font-bold text-theme-text">Новая дисциплина</h3>
            {viewMode === 'grid' && <p className="text-theme-muted text-[10px] uppercase tracking-wider font-bold mt-1">Добавить цель</p>}
          </div>
        </button>
      </div>

      {isAdding && <AddDisciplineModal onClose={() => setIsAdding(false)} onAdd={(data: any) => { addDiscipline(data); setIsAdding(false); }} />}
    </div>
  );
});

export default Dashboard;
