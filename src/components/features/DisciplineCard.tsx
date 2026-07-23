import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline, Task } from '../../types';
import { calculateStreak, formatDate } from '../../types';
import { Edit2, Trash2, ChevronDown, MoreVertical } from 'lucide-react';

interface Props {
  discipline: Discipline;
  viewMode: 'grid' | 'list';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  percentage: number;
  completed: number;
  total: number;
  children?: React.ReactNode;
  key?: string | number;
}

export default function DisciplineCard({
  discipline,
  viewMode,
  isCollapsed,
  onToggleCollapse,
  onEdit,
  onDelete,
  percentage,
  completed,
  total,
  children
}: Props) {
  const streak = calculateStreak(discipline.history);

  const ActionButtons = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="w-9 h-9 rounded-xl bg-theme-bg/60 hover:bg-theme-accent hover:text-text-on-accent transition-all text-theme-muted border border-theme-border/50 hover:border-theme-accent flex items-center justify-center shadow-sm backdrop-blur-md"
        title="Редактировать"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="w-9 h-9 rounded-xl bg-theme-bg/60 hover:bg-red-500/20 hover:text-red-500 transition-all text-theme-muted border border-theme-border/50 hover:border-red-500/50 flex items-center justify-center shadow-sm backdrop-blur-md"
        title="Удалить"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const CircularProgress = ({ size = 52, strokeWidth = 4, percentage = 0 }: { size?: number, strokeWidth?: number, percentage?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-theme-border/10"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <motion.circle
            className="text-theme-accent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <span className="absolute text-[10px] font-mono font-black text-theme-text">{Math.round(percentage)}%</span>
      </div>
    );
  };

  const ActivityRow = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = formatDate(date);
      const hasActivity = discipline.history && discipline.history[dateStr];
      return { date: dateStr, active: !!hasActivity, isToday: i === 6 };
    });

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-theme-muted uppercase tracking-widest opacity-70">Последние 7 дней</span>
        </div>
        <div className="flex gap-1.5">
          {last7Days.map((day, i) => (
            <div 
              key={i}
              className={`w-6.5 h-6.5 rounded-lg border flex items-center justify-center transition-all duration-500 relative ${
                day.active 
                  ? 'bg-theme-accent text-text-on-accent border-theme-accent/50 shadow-[0_0_10px_rgba(var(--color-theme-accent-rgb,var(--color-theme-accent)),0.4)]' 
                  : 'bg-theme-accent/5 border-theme-text/10'
              } ${day.isToday && !day.active ? 'ring-2 ring-theme-accent/20 border-theme-accent/30' : ''}`}
            >
              {day.active && <div className="w-1.5 h-1.5 rounded-full bg-text-on-accent shadow-sm" />}
              {day.isToday && !day.active && <div className="w-1 h-1 rounded-full bg-theme-accent animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className={`rounded-3xl flex flex-col transition-all duration-300 border border-theme-border/50 overflow-hidden relative group ${
          !isCollapsed ? 'ring-1 ring-theme-accent/30 bg-theme-card shadow-2xl z-10' : 'bg-theme-card shadow-sm hover:shadow-md hover:border-theme-border/80'
        }`}
      >
        {/* Card Header */}
        <div className="p-5 pb-2">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-theme-accent/10 border border-theme-accent/20 text-theme-accent w-fit">
                <div className="w-1 h-1 rounded-full bg-theme-accent animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider">Фокус</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ActionButtons className="flex opacity-100" />
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-[0.5px] transition-all duration-500"
                style={{ 
                  backgroundColor: `${discipline.color}15`,
                  borderColor: `${discipline.color}30`,
                  color: discipline.color,
                }}
              >
                <span className="material-symbols-outlined text-lg">{discipline.icon}</span>
              </div>
            </div>
          </div>

          <div className="mb-4 cursor-pointer" onClick={onToggleCollapse}>
            <h3 className="text-xl font-display font-black text-theme-text truncate tracking-tight uppercase leading-tight">{discipline.name}</h3>
          </div>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-1 pb-4">
                  {/* Progress Block */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-theme-bg/30 border border-theme-border/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-theme-muted uppercase tracking-widest mb-0.5 opacity-70">Прогресс</span>
                      <span className="text-2xl font-display font-black text-theme-text leading-none">{Math.round(percentage)}%</span>
                    </div>
                    <CircularProgress percentage={percentage} size={48} strokeWidth={4} />
                  </div>

                  {/* Activity Block */}
                  <ActivityRow />

                  {discipline.description && (
                    <p className="text-[11px] text-theme-muted font-medium opacity-60 leading-relaxed italic line-clamp-2">
                      "{discipline.description}"
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* List of sessions if expanded */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-theme-border/5"
            >
              <div className="p-5 pt-3 space-y-3">
                 <div className="space-y-2">
                   {children}
                 </div>
                 
                 <button 
                  onClick={onToggleCollapse}
                  className="w-full py-2.5 rounded-xl bg-theme-bg/50 border border-theme-border/10 text-theme-muted font-black text-[9px] uppercase tracking-widest hover:bg-theme-accent hover:text-text-on-accent transition-all flex items-center justify-center gap-2"
                >
                  Свернуть <ChevronDown className="w-3 h-3 rotate-180" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <button 
            onClick={onToggleCollapse}
            className="w-full py-3 text-[8px] font-black text-theme-muted/40 uppercase tracking-[0.2em] hover:text-theme-accent hover:bg-theme-accent/5 transition-all flex items-center justify-center gap-2 border-t border-theme-border/5"
          >
            Детали <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );
  }

  // LIST VIEW - Compact density
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = formatDate(date);
    const hasActivity = discipline.history && discipline.history[dateStr];
    
    // Day of week letter (M, T, W, T, F, S, S)
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // JS getDay() is 0 for Sunday
    const dayLetter = dayNames[date.getDay()];
    
    return { date: dateStr, active: !!hasActivity, dayLetter };
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`transition-all duration-300 relative group bg-theme-card border border-theme-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md ${!isCollapsed ? 'ring-1 ring-theme-accent/30 z-10 shadow-lg' : ''}`}
    >
      <div 
        className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <div className="flex flex-1 items-center gap-4 min-w-0">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
            style={{ 
              backgroundColor: `${discipline.color}15`,
              color: discipline.color,
            }}
          >
            <span className="material-symbols-outlined text-2xl">{discipline.icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-theme-text truncate">{discipline.name}</h3>
            <span className="text-sm text-theme-muted truncate block">{discipline.description || 'No description'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-12 pl-16 md:pl-0 w-full md:w-auto pr-2 md:pr-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className={`material-symbols-outlined text-[20px] ${streak > 0 ? 'text-green-600 dark:text-green-500' : 'text-theme-muted'}`}>
              local_fire_department
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold ${streak > 0 ? 'text-theme-text' : 'text-theme-muted'}`}>{streak}</span>
              <span className="text-sm text-theme-muted">days</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            {last7Days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className={`text-[10px] font-bold ${day.active ? 'text-theme-accent' : 'text-theme-muted opacity-50'}`}>
                  {day.dayLetter}
                </span>
                <div 
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                    day.active 
                      ? 'bg-theme-accent text-text-on-accent border border-theme-accent' 
                      : 'border border-theme-muted/30 bg-transparent'
                  }`}
                >
                  {day.active && <span className="material-symbols-outlined text-[14px]">check</span>}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-theme-muted hover:text-theme-text transition-colors p-1"
             >
               <Edit2 className="w-5 h-5" />
             </button>
             <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-theme-muted hover:text-red-500 transition-colors p-1"
             >
               <Trash2 className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-theme-bg/5"
          >
            <div className="px-4 py-4 md:pl-20 border-t border-theme-border/10 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
