import React, { useState } from 'react';
import { Discipline } from '../types';
import { motion } from 'motion/react';

interface Props {
  disciplines: Discipline[];
  stats: any;
}

export default function Statistics({ disciplines, stats }: Props) {
  // Aggregate task statistics per discipline
  const disciplineStats = disciplines.map(d => {
    const totalMinutes = stats?.disciplineMinutes?.[d.id] || 0;
    return {
      name: d.name,
      value: totalMinutes,
    };
  });

  const freeMinutes = stats?.disciplineMinutes?.['free'] || 0;
  if (freeMinutes > 0) {
    disciplineStats.push({ name: 'Свободная сессия', value: freeMinutes });
  }

  // Filter out 0 values for Pie chart
  const pieData = disciplineStats.filter(d => d.value > 0);
  
  const COLORS = [
    'var(--color-theme-accent)', 
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4'  // cyan
  ];

  // Heatmap generation
  // 12 weeks back = 84 days
  const today = new Date();
  today.setHours(0,0,0,0);
  const days: { date: string, minutes: number }[] = [];
  
  // Create 12 weeks of data (start from Sunday 12 weeks ago to have aligned columns)
  const heatmapStart = new Date(today);
  heatmapStart.setDate(heatmapStart.getDate() - (12 * 7) - heatmapStart.getDay());
  
  for (let i = 0; i < 84 + today.getDay() + 1; i++) {
    const dDate = new Date(heatmapStart);
    dDate.setDate(dDate.getDate() + i);
    const dateStr = dDate.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      minutes: stats?.dailyMinutes?.[dateStr] || 0
    });
  }

  // Group into weeks (arrays of 7 days)
  const weeks: { date: string, minutes: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return 'bg-slate-100 dark:bg-slate-800/50';
    if (minutes < 30) return 'bg-theme-accent/20 dark:bg-theme-accent/30';
    if (minutes < 60) return 'bg-theme-accent/40 dark:bg-theme-accent/50';
    if (minutes < 120) return 'bg-theme-accent/70 dark:bg-theme-accent/80';
    return 'bg-theme-accent dark:bg-theme-accent';
  };

  // Generate Stars for Constellation Map
  const stars: { id: string; x: number; y: number; size: number; color: string; label: string }[] = [];
  const lines: { id: string; x1: number; y1: number; x2: number; y2: number; color: string }[] = [];

  let starId = 0;
  
  // Deterministic random
  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const [showDemo, setShowDemo] = useState(false);

  const isDemo = pieData.length === 0 || showDemo;
  const renderData = isDemo ? [
    { name: 'Глубокая работа (Демо)', value: 120 },
    { name: 'Чтение (Демо)', value: 45 },
    { name: 'Спорт (Демо)', value: 60 }
  ] : pieData;

  renderData.forEach((d, dIdx) => {
    const color = isDemo ? 'var(--color-theme-muted)' : COLORS[dIdx % COLORS.length]; 
    // Number of stars = total minutes / 5 (e.g., 1 star per 5 minutes)
    const numStars = Math.min(Math.max(1, Math.floor(d.value / 5)), 50); // cap at 50 per discipline
    
    const disciplineStars = [];
    
    // Base position for this constellation
    const baseX = 20 + random() * 60; // 20% to 80%
    const baseY = 20 + random() * 60; // 20% to 80%

    for (let i = 0; i < numStars; i++) {
      const star = {
        id: `star-${starId++}`,
        x: Math.max(5, Math.min(95, baseX + (random() - 0.5) * 30)),
        y: Math.max(5, Math.min(95, baseY + (random() - 0.5) * 30)),
        size: 1 + random() * 3,
        color: color,
        label: `${d.name} (${d.value} мин)`
      };
      disciplineStars.push(star);
      stars.push(star);
    }

    // Connect stars to form constellation
    for (let i = 1; i < disciplineStars.length; i++) {
      // Connect to the previous star or a random previous star
      const prevIdx = Math.floor(random() * i);
      lines.push({
        id: `line-${dIdx}-${i}`,
        x1: disciplineStars[i].x,
        y1: disciplineStars[i].y,
        x2: disciplineStars[prevIdx].x,
        y2: disciplineStars[prevIdx].y,
        color: color
      });
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="mb-10 pt-4 md:pt-0">
        <h1 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">Аналитика активности</h1>
        <p className="text-base md:text-lg text-theme-muted">Обзор вашего прогресса и вовлеченности</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-card border border-theme-border shadow-sm p-6 rounded-2xl mb-6 overflow-x-auto"
      >
        <div className="flex items-center justify-between mb-6 min-w-[600px]">
          <h2 className="text-xl font-bold text-theme-text">Матрица активности</h2>
          <div className="flex items-center gap-2 text-xs text-theme-muted">
            <span>Меньше</span>
            <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800/50"></div>
            <div className="w-3 h-3 rounded-sm bg-theme-accent/20 dark:bg-theme-accent/30"></div>
            <div className="w-3 h-3 rounded-sm bg-theme-accent/40 dark:bg-theme-accent/50"></div>
            <div className="w-3 h-3 rounded-sm bg-theme-accent/70 dark:bg-theme-accent/80"></div>
            <div className="w-3 h-3 rounded-sm bg-theme-accent dark:bg-theme-accent"></div>
            <span>Больше</span>
          </div>
        </div>
        
        <div className="flex gap-1 min-w-[600px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <div 
                  key={day.date}
                  className={`w-3.5 h-3.5 rounded-sm ${getIntensityColor(day.minutes)} transition-colors hover:ring-2 hover:ring-theme-accent/50 hover:scale-125 hover:z-10 relative group cursor-crosshair`}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-theme-bg-bg text-theme-text text-xs rounded border border-theme-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {day.minutes} мин на {day.date}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-theme-card border border-theme-border shadow-sm p-6 rounded-2xl relative overflow-hidden mb-8"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-10" style={{ backgroundImage: 'radial-gradient(1px 1px at 15% 25%, var(--color-theme-text) 100%, transparent), radial-gradient(1.5px 1.5px at 50% 60%, var(--color-theme-text) 100%, transparent)', backgroundSize: '100px 100px' }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-theme-text mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-theme-accent">star</span>
              Карта созвездий (Focus Stars)
            </h2>
            <p className="text-sm text-theme-muted">Каждые 5 минут фокуса зажигают новую звезду в вашем созвездии.</p>
          </div>
          
          {pieData.length > 0 && (
            <button 
              onClick={() => setShowDemo(!showDemo)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border ${showDemo ? 'bg-theme-accent text-white border-theme-accent' : 'bg-theme-bg border-theme-border text-theme-text hover:border-theme-accent'}`}
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              {showDemo ? 'Скрыть демо' : 'Показать демо'}
            </button>
          )}
        </div>

        <div className="relative w-full h-[400px] md:h-[500px] rounded-xl border border-theme-border bg-theme-bg overflow-hidden">
          {/* Constellation Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {lines.map(line => (
              <line 
                key={line.id}
                x1={`${line.x1}%`} 
                y1={`${line.y1}%`} 
                x2={`${line.x2}%`} 
                y2={`${line.y2}%`} 
                stroke={line.color} 
                strokeWidth="1" 
                strokeOpacity="0.3"
              />
            ))}
          </svg>

          {/* Stars */}
          {stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: random() * 2, duration: 1 }}
              className="absolute rounded-full cursor-pointer group"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size * 2}px`,
                height: `${star.size * 2}px`,
                backgroundColor: star.color,
                boxShadow: `0 0 ${star.size * 5}px ${star.color}`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-theme-card text-theme-text text-xs rounded border border-theme-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-sm">
                {star.label}
              </div>
            </motion.div>
          ))}

          {isDemo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-theme-bg/30 backdrop-blur-[1px]">
              <div className="bg-theme-card/90 px-6 py-3 rounded-2xl border border-theme-border shadow-lg text-theme-text font-medium flex items-center gap-2 backdrop-blur-md">
                <span className="material-symbols-outlined text-theme-accent">auto_awesome</span>
                Пример созвездий (пока нет данных)
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
