import { Discipline, Task } from '../types';
import { calculateStreak, calculateGlobalStreak, formatDate } from '../utils';
import { motion } from 'motion/react';

export default function Dashboard({ disciplines, toggleDay, startFocus }: any) {
  const today = formatDate(new Date());
  
  const globalStreak = calculateGlobalStreak(disciplines);

  // Find a suggested task for the Hero Card
  // Normally this would pick a task from the active discipline that is 'in_progress' or 'plan'
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

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="mb-8 pt-4 md:pt-0">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-[#F5F5F5] mb-2">{greeting} 👋</h1>
        <p className="text-base md:text-lg text-slate-500 dark:text-[#94A3B8]">Что будем делать прямо сейчас?</p>
      </div>

      {suggestedTask ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 dark:bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] dark:shadow-none dark:border dark:border-[#30343D] p-6 md:p-8 rounded-2xl mb-8 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider">{suggestedTask.disciplineName}</span>
                {suggestedTask.task.energy === 'high' && <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium">🧠 High Energy</span>}
                {suggestedTask.task.energy === 'low' && <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-md font-medium">🔋 Low Energy</span>}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">{suggestedTask.task.title}</h2>
              {suggestedTask.task.description && <p className="text-blue-100 max-w-lg">{suggestedTask.task.description}</p>}
            </div>
            <button 
              onClick={() => startFocus(suggestedTask?.task)}
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined font-bold">play_arrow</span>
              Начать фокус
            </button>
          </div>
          {/* Decorative background element */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-100 dark:bg-[#181B20] border border-slate-200 dark:border-[#30343D] p-6 md:p-8 rounded-2xl mb-8 text-center"
        >
          <div className="w-16 h-16 bg-slate-200 dark:bg-[#30343D] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-slate-400 dark:text-[#94A3B8] text-3xl">task</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-[#F5F5F5] mb-2">Все задачи выполнены</h2>
          <p className="text-slate-500 dark:text-[#94A3B8]">Отличная работа! Можете отдохнуть или добавить новые задачи.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#30343D] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none p-6 rounded-2xl group hover:-translate-y-0.5 transition-transform"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-[#94A3B8] font-medium text-sm">Глобальный стрик</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-[#F5F5F5]">{globalStreak} <span className="text-lg text-slate-400 font-normal">дней</span></p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#30343D] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none p-6 rounded-2xl group hover:-translate-y-0.5 transition-transform"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>timer</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-[#94A3B8] font-medium text-sm">Время в фокусе (сегодня)</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-[#F5F5F5]">0 <span className="text-lg text-slate-400 font-normal">ч</span> 0 <span className="text-lg text-slate-400 font-normal">м</span></p>
            </div>
          </div>
        </motion.div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 dark:text-[#F5F5F5] mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">today</span>
        Оставшиеся дисциплины на сегодня
      </h2>

      <div className="space-y-3">
        {disciplines.length === 0 ? (
          <div className="text-slate-500 dark:text-[#94A3B8] bg-white dark:bg-[#181B20] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none p-6 rounded-2xl border border-slate-200 dark:border-[#30343D]">Нет дисциплин. Перейдите на вкладку «Дисциплины», чтобы добавить новую.</div>
        ) : (
          disciplines.map((d: Discipline, idx: number) => {
            const isDone = !!d.history[today];
            return (
              <motion.div 
                key={d.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className={`bg-white dark:bg-[#181B20] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border ${isDone ? 'border-emerald-400/50 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5' : 'border-slate-200 dark:border-[#30343D]'} rounded-xl p-4 flex items-center justify-between transition-all hover:-translate-y-0.5 cursor-pointer group`}
                onClick={() => toggleDay(d.id, today)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isDone ? 'bg-emerald-500 dark:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-[#30343D] text-slate-400 dark:text-[#94A3B8] group-hover:border-blue-300 dark:group-hover:border-blue-500/50'
                  }`}>
                    {isDone ? (
                      <span className="material-symbols-outlined font-bold text-xl">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-xl">{d.icon}</span>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-base md:text-lg font-medium transition-colors ${isDone ? 'text-slate-400 dark:text-[#94A3B8] line-through decoration-slate-400' : 'text-slate-800 dark:text-[#F5F5F5]'}`}>{d.name}</h3>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
