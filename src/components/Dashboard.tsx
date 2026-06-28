import { Discipline } from '../types';
import { calculateStreak, calculateGlobalStreak, formatDate } from '../utils';
import { motion } from 'motion/react';

export default function Dashboard({ disciplines, toggleDay }: any) {
  const today = formatDate(new Date());
  
  const globalStreak = calculateGlobalStreak(disciplines);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="mb-10 pt-4 md:pt-0">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Главная</h1>
        <p className="text-base md:text-lg text-slate-500 dark:text-[#908fa0]">Готовы поддерживать свой темп?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] shadow-sm p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#4de082]/10 dark:from-[#4de082]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-[#00b55d]/10 flex items-center justify-center text-green-600 dark:text-[#4de082]">
              <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-[#908fa0] font-medium text-sm">Глобальный стрик</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{globalStreak} <span className="text-lg text-slate-400 dark:text-[#908fa0] font-normal">дней</span></p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] shadow-sm p-6 rounded-2xl"
        >
          <div className="flex items-center gap-4 mb-2 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-[#494bd6]/10 flex items-center justify-center text-blue-600 dark:text-[#c0c1ff]">
              <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>task_alt</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-[#908fa0] font-medium text-sm">Отслеживаемые дисциплины</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{disciplines.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-blue-600 dark:text-[#c0c1ff]">today</span>
        Фокус на сегодня
      </h2>

      <div className="space-y-3">
        {disciplines.length === 0 ? (
          <div className="text-slate-500 dark:text-[#908fa0] bg-white dark:bg-[#122131] shadow-sm p-6 rounded-2xl border border-slate-200 dark:border-[#273647]">Нет дисциплин. Перейдите на вкладку «Дисциплины», чтобы добавить новую.</div>
        ) : (
          disciplines.map((d: Discipline, idx: number) => {
            const isDone = !!d.history[today];
            return (
              <motion.div 
                key={d.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white dark:bg-[#122131] shadow-sm border ${isDone ? 'border-green-400 dark:border-[#00b55d]/50 bg-green-50/30' : 'border-slate-200 dark:border-[#273647] hover:border-slate-300 dark:hover:border-[#464554]'} rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group`}
                onClick={() => toggleDay(d.id, today)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isDone ? 'bg-green-500 dark:bg-[#00b55d] text-white dark:text-[#003919] shadow-[0_0_12px_rgba(0,181,93,0.3)]' : 'bg-slate-50 dark:bg-[#051424] border border-slate-200 dark:border-[#273647] text-slate-400 dark:text-[#908fa0] group-hover:border-slate-300 dark:group-hover:border-[#464554]'
                  }`}>
                    {isDone ? (
                      <span className="material-symbols-outlined font-bold text-xl">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-xl">{d.icon}</span>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-base md:text-lg font-medium transition-colors ${isDone ? 'text-slate-400 dark:text-white line-through decoration-slate-400 dark:decoration-[#908fa0]' : 'text-slate-700 dark:text-white'}`}>{d.name}</h3>
                    <p className="text-slate-500 dark:text-[#908fa0] text-sm hidden sm:block">{d.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-[#908fa0] text-sm hidden sm:block">Лучший стрик:</span>
                  <div className="flex items-center gap-1 bg-green-50 dark:bg-[#00b55d]/10 px-2 py-1 rounded-md border border-green-100 dark:border-transparent">
                    <span className="material-symbols-outlined text-green-500 dark:text-[#4de082] text-sm" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                    <span className="text-green-600 dark:text-[#4de082] font-bold text-sm">{calculateStreak(d.history)}</span>
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
