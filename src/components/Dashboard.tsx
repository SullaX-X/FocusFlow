import { useState } from 'react';
import { Discipline, Task } from '../types';
import { calculateStreak, calculateGlobalStreak, formatDate, getPast7Days } from '../types';
import { motion } from 'motion/react';
import { AddDisciplineModal } from './Disciplines';
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

export default function Dashboard({ disciplines, toggleDay, startFocus, stats, updateWeeklyGoal, addDiscipline }: any) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(stats?.weeklyGoal || 10);
  const [isAdding, setIsAdding] = useState(false);
  const today = formatDate(new Date());
  const past7Days = getPast7Days();
  
  const globalStreak = calculateGlobalStreak(disciplines);

  // Calculate today's focused hours
  const todayMinutes = stats?.dailyMinutes?.[new Date().toISOString().split('T')[0]] || 0;
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;

  // Calculate this week's progress
  const getWeekProgress = () => {
    let weeklyMinutes = 0;
    const dDate = new Date();
    const day = dDate.getDay() || 7;
    dDate.setHours(0,0,0,0);
    dDate.setDate(dDate.getDate() - day + 1);
    
    for (let i = 0; i < 7; i++) {
      const dateStr = dDate.toISOString().split('T')[0];
      weeklyMinutes += (stats?.dailyMinutes?.[dateStr] || 0);
      dDate.setDate(dDate.getDate() + 1);
    }
    return weeklyMinutes / 60;
  };

  const weeklyProgress = getWeekProgress();
  const weeklyGoal = stats?.weeklyGoal || 10;
  const progressPercent = Math.min((weeklyProgress / weeklyGoal) * 100, 100);
  const remainingHours = Math.max(weeklyGoal - weeklyProgress, 0).toFixed(1);

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
  
  const { theme, actualTheme } = useTheme();
  const isDimoon = theme === 'dimoon' || actualTheme === 'dimoon';
  const isDimoonBlue = theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
  const isDimoonBase = isDimoon || isDimoonBlue;
  const greetingEmoji = isDimoonBase ? '🌖' : '👋';

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 pt-4 md:pt-0 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">{greeting} {greetingEmoji}</h1>
          <p className="text-base md:text-lg text-theme-muted">Что будем делать прямо сейчас?</p>
        </div>
        
        {/* Focus Dust Indicator */}
        <div className="flex items-center gap-2 bg-theme-card border border-theme-border rounded-2xl px-4 py-2 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center relative overflow-hidden group">
            <span className="material-symbols-outlined text-indigo-500 text-sm relative z-10">auto_awesome</span>
            {/* simple particle animation for visual flair */}
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.2)_0%,_transparent_70%)] animate-pulse"></div>
          </div>
          <div>
            <div className="text-xs text-theme-muted font-medium uppercase tracking-wider">Звездная пыльца</div>
            <div className="text-lg font-bold text-theme-text font-mono leading-none">{stats?.focusDust || 0} <span className="text-xs font-normal text-slate-400">FD</span></div>
          </div>
        </div>
      </div>

      {suggestedTask ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] dark:shadow-none dark:border dark:border-theme-border p-6 md:p-8 rounded-2xl mb-8 relative overflow-hidden ${
            isDimoon 
              ? 'bg-[#0B0E20] border-2 border-[#1E244A] shadow-[4px_4px_0_0_#FDE047]' 
              : isDimoonBlue
              ? 'bg-[#0f172a] border border-[#1e293b]'
              : 'bg-theme-accent dark:bg-theme-accent'
          }`}
        >
          {/* Decorative dimoon background for the task panel */}
          {isDimoonBase && (
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `radial-gradient(1.5px 1.5px at 10% 20%, ${isDimoonBlue ? '#38bdf8' : '#FDE047'} 100%, transparent), radial-gradient(1px 1px at 40% 60%, #fff 100%, transparent), radial-gradient(2px 2px at 80% 30%, ${isDimoonBlue ? '#38bdf8' : '#FDE047'} 100%, transparent)`, backgroundSize: '100px 100px' }}></div>
          )}
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-theme-accent/100 text-white text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider">{suggestedTask.disciplineName}</span>
                {suggestedTask.task.energy === 'high' && <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium">🧠 High Energy</span>}
                {suggestedTask.task.energy === 'low' && <span className="bg-theme-success text-white text-xs px-2 py-1 rounded-md font-medium">🔋 Low Energy</span>}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">{suggestedTask.task.title}</h2>
              {suggestedTask.task.description && <p className="text-white/80 max-w-lg">{suggestedTask.task.description}</p>}
            </div>
            <button 
              onClick={() => startFocus(suggestedTask?.task)}
              className={`btn-tactile flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm shrink-0 ${
                isDimoonBase 
                  ? 'bg-theme-accent text-[#050714] hover:brightness-110' 
                  : 'bg-white text-theme-accent hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined font-bold">{isDimoonBase ? 'rocket_launch' : 'play_arrow'}</span>
              Начать фокус
            </button>
          </div>
          {!isDimoonBase && (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-theme-accent flex items-center justify-center text-white shadow-lg shadow-theme-accent/30">
              <span className="material-symbols-outlined text-3xl drop-shadow-md" style={{fontVariationSettings: "'FILL' 1"}}>{isDimoonBase ? 'stars' : 'local_fire_department'}</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm">Глобальный стрик</p>
              <p className="text-2xl lg:text-3xl font-bold text-theme-text">{globalStreak} <span className="text-lg text-slate-400 font-normal">дней</span></p>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-6 rounded-2xl group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-theme-accent flex items-center justify-center text-white shadow-lg shadow-theme-accent/30">
              <span className="material-symbols-outlined text-3xl drop-shadow-md" style={{fontVariationSettings: "'FILL' 1"}}>{isDimoonBase ? 'timelapse' : 'timer'}</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm">Время в фокусе (сегодня)</p>
              <p className="text-2xl lg:text-3xl font-bold text-theme-text">{todayHours} <span className="text-lg text-slate-400 font-normal">ч</span> {todayMins} <span className="text-lg text-slate-400 font-normal">м</span></p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl group hover:-translate-y-0.5 transition-transform flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-theme-accent flex items-center justify-center text-white shadow-lg shadow-theme-accent/30">
              <span className="material-symbols-outlined text-3xl drop-shadow-md" style={{fontVariationSettings: "'FILL' 1"}}>{isDimoonBase ? 'star' : 'flag'}</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm">Цель на неделю</p>
              <div className="text-3xl font-bold text-theme-text flex items-center gap-2 group/edit relative mt-1">
                <span>{weeklyProgress % 1 === 0 ? weeklyProgress : weeklyProgress.toFixed(1)}</span>
                <span className="text-lg text-slate-400 font-normal">/</span>
                {isEditingGoal ? (
                  <input 
                    autoFocus type="number" value={goalInput}
                    onChange={(e) => setGoalInput(Number(e.target.value))}
                    onBlur={() => { updateWeeklyGoal(goalInput); setIsEditingGoal(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateWeeklyGoal(goalInput); setIsEditingGoal(false); } }}
                    className="w-16 bg-transparent border-b border-theme-accent outline-none text-theme-text"
                  />
                ) : (
                  <span className="text-lg text-slate-400 font-normal cursor-pointer hover:text-theme-accent transition-colors" onClick={() => setIsEditingGoal(true)}>
                    {weeklyGoal} ч
                  </span>
                )}
              </div>
              <p className="text-xs text-theme-accent mt-1">Осталось {remainingHours} часа</p>
            </div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90 transform">
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-slate-100 dark:stroke-slate-800" />
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-theme-accent transition-all duration-1000" strokeDasharray="175.93" strokeDashoffset={175.93 - (175.93 * progressPercent) / 100} />
            </svg>
            <span className="absolute text-sm font-bold text-theme-text">{Math.round(progressPercent)}%</span>
          </div>
        </motion.div>
      </div>

      <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-theme-accent text-xl">today</span>
        Оставшиеся дисциплины на сегодня
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplines.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl col-span-full text-theme-muted">Нет дисциплин. Перейдите на вкладку «Дисциплины», чтобы добавить новую.</div>
        ) : (
          disciplines.map((d: Discipline, idx: number) => {
            const isDone = !!d.history[today];
            const { completed, total } = getDisciplineProgress(d);
            const percentage = total > 0 ? (completed / total) * 100 : 0;

            return (
              <motion.div 
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className={`glass-panel rounded-[24px] p-6 flex flex-col transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-xl ${isDone ? 'opacity-75' : ''}`}
                style={{ '--theme-accent': d.color || 'var(--color-theme-accent)' } as any}
                onClick={() => {
                  if (!isDone) toggleDay(d.id, today);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDone ? 'bg-theme-accent/20 text-theme-accent' : 'bg-theme-accent/10 text-theme-accent'}`}>
                    {isDone ? '✓ Выполнено' : '● Фокус сегодня'}
                  </div>
                  <div className="w-10 h-10 bg-theme-bg/50 rounded-xl border border-theme-border flex items-center justify-center text-theme-muted">
                    <span className="material-symbols-outlined text-lg text-theme-accent">{d.icon}</span>
                  </div>
                </div>

                <h3 className={`font-bold text-2xl leading-tight mb-6 transition-colors ${isDone ? 'text-theme-muted line-through' : 'text-theme-text'}`}>
                  {d.name}
                </h3>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-theme-muted text-sm font-medium mb-1">Прогресс</p>
                    <p className="text-3xl font-bold text-theme-text">{Math.round(percentage)}%</p>
                  </div>
                  <MiniCircularProgress percentage={percentage} color={d.color || 'var(--color-theme-accent)'} />
                </div>

                <div className="mt-auto">
                  <p className="text-theme-muted text-sm font-medium mb-2">Последние 7 дней</p>
                  <div className="flex gap-1.5 justify-between h-8">
                    {past7Days.slice().reverse().map((date) => {
                      const doneDay = !!d.history[date];
                      const isToday = date === today;
                      const isFuture = date > today;
                      return (
                        <div 
                          key={date} 
                          className={`flex-1 flex items-center justify-center rounded-md transition-all h-full ${
                            isFuture ? 'bg-theme-bg/30 opacity-20' :
                            doneDay ? 'bg-theme-accent shadow-lg shadow-theme-accent/20 border-theme-accent' 
                            : isToday ? 'bg-theme-accent/20 border border-theme-accent/50 animate-pulse' 
                            : 'bg-theme-bg border border-theme-border opacity-40'
                          }`}
                          title={date}
                        >
                          {!isFuture && (
                            doneDay ? (
                              <svg className="w-4 h-4 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-theme-muted/50" />
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-theme-border hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all group h-full min-h-[300px]"
        >
          <div className="w-12 h-12 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <h3 className="text-xl font-bold text-theme-text mb-1">Новая дисциплина</h3>
          <p className="text-theme-muted text-sm text-center">Создайте новую область для фокуса и установите цели.</p>
        </button>
      </div>

      {isAdding && <AddDisciplineModal onClose={() => setIsAdding(false)} onAdd={(data: any) => { addDiscipline(data); setIsAdding(false); }} />}
    </div>
  );
}
