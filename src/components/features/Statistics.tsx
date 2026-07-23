import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Discipline, Session, formatDate } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '../../services/ThemeContext';
import FocusStarsCanvas from '../FocusStarsCanvas';
import { generateDemoSessions } from '../generateDemoSessions';

interface Props {
  disciplines: Discipline[];
  stats: any;
}

const Statistics = React.memo(({ disciplines, stats }: Props) => {
  const { theme, performanceMode } = useTheme();
  
  const originalSessions: Session[] = useMemo(() => stats?.sessions || [], [stats?.sessions]);
  const hasLegacyData = Object.keys(stats?.dailyMinutes || {}).length > 0;
  const hasActualData = originalSessions.length > 0 || hasLegacyData;
  const [showDemo, setShowDemo] = useState(false);
  
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  

  const sessions = useMemo(() => {
    if (showDemo) {
      return generateDemoSessions();
    }
    return originalSessions;
  }, [showDemo, originalSessions]);
  
  const hasSessions = sessions.length > 0;

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    sessions.forEach(s => {
      const year = new Date(s.startTime).getFullYear();
      if (!isNaN(year)) years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [sessions]);

  // Dynamic Theme Colors
  const [colors, setColors] = useState({
    accent: '#2563eb',
    muted: '#94a3b8',
    card: '#ffffff',
    border: '#e2e8f0'
  });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      accent: style.getPropertyValue('--accent').trim() || '#2563eb',
      muted: style.getPropertyValue('--text-muted').trim() || '#94a3b8',
      card: style.getPropertyValue('--card').trim() || '#ffffff',
      border: style.getPropertyValue('--border').trim() || '#e2e8f0'
    });
  }, [theme]);

  // 1. Chronotype Analysis (Radar Chart)
  const chronotypeData = useMemo(() => {
    const hours = new Array(6).fill(0);
    
    if (sessions.length > 0) {
      sessions.forEach(s => {
        const hour = new Date(s.startTime).getHours();
        const slot = Math.floor(hour / 4);
        hours[slot] += s.duration;
      });
    }
    
    const labels = ['Ночь', 'Утро', 'День', 'Полдень', 'Вечер', 'Полночь'];
    return hours.map((val, i) => ({
      subject: labels[i],
      A: val,
      fullMark: Math.max(...hours, 1)
    }));
  }, [sessions]);

  // 2. Focus Dust Economy
  const economyData = useMemo(() => {
    const dailyDust: Record<string, number> = {};
    
    if (sessions.length > 0) {
      sessions.forEach(s => {
        const day = formatDate(new Date(s.startTime));
        const dust = s.duration * (s.isDeepWork ? 2 : 1);
        dailyDust[day] = (dailyDust[day] || 0) + dust;
      });
    }

    const sortedEntries = Object.entries(dailyDust)
      .map(([date, dust]) => ({
        date: new Date(date).getTime(),
        label: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        dust
      }))
      .sort((a, b) => a.date - b.date);

    return sortedEntries.slice(-14);
  }, [sessions]);

  // 3. Discipline Balance
  const disciplineBalance = useMemo(() => {
    if (sessions.length === 0) return [];

    // Pre-calculate demo stats if needed
    const actualDisciplineMinutes = showDemo && !hasActualData 
      ? sessions.reduce((acc, s) => {
          acc[s.disciplineId || 'demo'] = (acc[s.disciplineId || 'demo'] || 0) + s.duration;
          return acc;
        }, {} as Record<string, number>)
      : (stats?.disciplineMinutes || {});

    let data = disciplines.map(d => ({
      name: d.name,
      value: actualDisciplineMinutes?.[d.id] || 0,
      color: d.color
    })).filter(d => d.value > 0);
    
    if ((actualDisciplineMinutes?.['free'] || 0) > 0) {
      data.push({ name: 'Свободная сессия', value: actualDisciplineMinutes['free'], color: colors.muted });
    }
    
    if (showDemo && !hasActualData && disciplines.length === 0) {
      data = [{ name: 'Демо-дисциплина', value: 500, color: colors.accent }];
    }
    
    return data;
  }, [disciplines, stats, colors.muted, sessions, showDemo, hasActualData, colors.accent]);

  // 4. Activity Matrix Logic (OPTIMIZED)
  const activityData = useMemo(() => {
    const currentYear = selectedYear;
    const start = new Date(currentYear, 0, 1);
    
    // Adjust to first Monday of the year (or previous year if Jan 1 is not Monday)
    const dayOfWeek = start.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start.setDate(start.getDate() - diffToMonday);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

           // Pre-compute sessions map by date string for O(1) lookup
    const sessionsByDate: Record<string, Session[]> = {};
    const minutesByDate: Record<string, number> = {};
    
    sessions.forEach(s => {
      const dateStr = formatDate(new Date(s.startTime));
      if (!sessionsByDate[dateStr]) sessionsByDate[dateStr] = [];
      sessionsByDate[dateStr].push(s);
      minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + s.duration;
    });

    // Merge legacy dailyMinutes if it exists
    if (!showDemo) {
       Object.entries(stats?.dailyMinutes || {}).forEach(([dateStr, mins]) => {
         // Only use dailyMinutes if it's larger (meaning sessions are missing or incomplete for this day)
         if (!minutesByDate[dateStr] || minutesByDate[dateStr] < (mins as number)) {
            minutesByDate[dateStr] = mins as number;
         }
       });
    }

    const days = [];
    const totalDays = 53 * 7;
    const dDate = new Date(start);

    for (let i = 0; i < totalDays; i++) {
      if (dDate > today) break;
      if (dDate.getFullYear() > currentYear && dDate.getDay() === 1) break; // stop if we entered next year and it's a Monday

      const dateStr = formatDate(dDate);
      
      const isFuture = dDate > today;
      const isOutsideYear = dDate.getFullYear() !== currentYear;
      
      
      const daySessions = sessionsByDate[dateStr] || [];
      const minutes = minutesByDate[dateStr] || 0;
      
      days.push({
        date: dateStr,
        minutes,
        sessionsCount: daySessions.length,
        isDeep: daySessions.some(s => s.isDeepWork),
        isFuture,
        isOutsideYear,
        label: dDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
        month: dDate.getMonth(),
        dayOfMonth: dDate.getDate(),
        dayOfWeek: dDate.getDay() // 0-6
      });
      
      dDate.setDate(dDate.getDate() + 1); // increment date
    }
    return days;
  }, [sessions, stats?.dailyMinutes, selectedYear, showDemo, hasActualData]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth; }, 100);
    }
  }, [selectedYear, activityData]);

  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < activityData.length; i += 7) {
      w.push(activityData.slice(i, i + 7));
    }
    return w;
  }, [activityData]);

  // Pre-calculate month labels
  const monthLabels = useMemo(() => {
    const labels: { index: number, label: string }[] = [];
    let lastMonth = -1;
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    weeks.forEach((week, index) => {
      const validDay = week.find(d => !d.isOutsideYear) || week[0];
      if (validDay && validDay.month !== lastMonth && !validDay.isOutsideYear) {
        labels.push({
          index,
          label: monthNames[validDay.month]
        });
        lastMonth = validDay.month;
      }
    });
    return labels;
  }, [weeks]);

  // Max intensity logic
  const maxIntensity = useMemo(() => {
    return Math.max(...activityData.map(d => d.minutes), 60);
  }, [activityData]);

  const getIntensityInlineStyle = (minutes: number, isOutsideYear: boolean = false, isFuture: boolean = false) => {
    if (isFuture) return { backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px', opacity: 0.1 };
    if (minutes === 0) return { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', borderWidth: '1px', opacity: isOutsideYear ? 0.2 : 0.4 };
    
    const ratio = minutes / maxIntensity;
    let alpha = 0;
    if (ratio > 0.75) alpha = 1;
    else if (ratio > 0.5) alpha = 0.75;
    else if (ratio > 0.25) alpha = 0.5;
    else alpha = 0.25;
    
    let r = 37, g = 99, b = 235;
    if (colors.accent.startsWith('#')) {
      const hex = colors.accent.replace('#', '');
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    }
    
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
      opacity: isOutsideYear ? Math.max(alpha - 0.5, 0.1) : 1,
      borderWidth: '0px',
      borderRadius: '2px'
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Star Map */}
      <section className="glass-panel p-6 md:p-10 rounded-[3.5rem] border border-theme-border shadow-sm overflow-hidden relative group hover:border-theme-accent/20 transition-all duration-500">
        <div className="mb-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-theme-text uppercase tracking-tight font-display mb-2">Звездная Карта</h3>
            <p className="text-sm text-theme-muted font-medium opacity-60">Визуализация ваших сессий. Чем глубже фокус, тем ярче звезды.</p>
          </div>
          <button 
            onClick={() => setShowDemo(!showDemo)}
            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 border ${
              showDemo 
                 ? 'bg-theme-accent/10 border-theme-accent/20 text-theme-accent'
                 : 'bg-theme-bg border-theme-border text-theme-muted hover:border-theme-accent/30'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {showDemo ? 'visibility_off' : 'visibility'}
            </span>
            <span className="hidden sm:inline">{showDemo ? 'Скрыть демо' : 'Показать демо'}</span>
            <span className="sm:hidden">{showDemo ? 'Демо' : 'Демо'}</span>
          </button>
        </div>
        <div className="relative rounded-3xl overflow-hidden border border-theme-border shadow-inner">
          <FocusStarsCanvas sessions={sessions} />
        </div>
      </section>
      
      {/* 1. Full Activity Matrix (Constellation Map) */}
      <section className="glass-panel p-6 md:p-10 rounded-[3.5rem] border border-theme-border shadow-sm overflow-hidden relative group hover:border-theme-accent/20 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-b from-theme-bg/50 to-theme-card/80 z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-theme-text uppercase tracking-tight font-display mb-2">Матрица Активности</h3>
            <p className="text-sm text-theme-muted font-medium opacity-60">Активность ваших сфокусированных сессий за год</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            {/* Year Selector */}
            <div className="flex items-center gap-2 bg-theme-bg/50 p-1.5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedYear === year 
                      ? 'bg-theme-accent text-text-on-accent shadow-lg shadow-theme-accent/20' 
                      : 'text-theme-muted hover:text-theme-text'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            
            <div className="hidden md:flex items-center gap-4 text-[8px] font-black text-theme-muted uppercase tracking-[0.15em]">
              <span>Меньше</span>
              <div className="flex gap-1">
                {[0, 30, 60, 90, 120].map(m => (
                  <div 
                    key={m} 
                    className={`w-3 h-3 rounded-sm`} 
                    style={getIntensityInlineStyle(m)}
                  />
                ))}
              </div>
              <span>Больше</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 w-full overflow-x-auto pb-4 custom-scrollbar" ref={scrollRef}>
          <div className="flex flex-col gap-2 min-w-max pr-8">
            {/* Months labels */}
            <div className="flex ml-8 h-4 relative">
              {monthLabels.map((m, idx) => (
                <div 
                  key={idx} 
                  className="absolute text-[9px] font-black uppercase tracking-widest text-theme-muted/60"
                  style={{ left: `${m.index * 18}px` }} // updated for wider gaps
                >
                  {m.label}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {/* Weekday labels */}
              <div className="flex flex-col gap-[4px] text-[9px] font-black uppercase tracking-tighter text-theme-muted/50 w-6 pt-1">
                <div className="h-3.5 flex items-center">Пн</div>
                <div className="h-3.5" />
                <div className="h-3.5 flex items-center">Ср</div>
                <div className="h-3.5" />
                <div className="h-3.5 flex items-center">Пт</div>
                <div className="h-3.5" />
                <div className="h-3.5" />
              </div>
              {/* Grid */}
              <div className="flex gap-[4px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={selectedYear}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-[4px]"
                  >
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[4px]">
                        {week.map(day => (
                          <div 
                            key={day.date}
                            className={`w-[14px] h-[14px] rounded-[4px] transition-all duration-300 relative group/cell cursor-pointer ${day.isOutsideYear ? 'pointer-events-none' : ''}`}
                            style={getIntensityInlineStyle(day.minutes, day.isOutsideYear, day.isFuture)}
                          >
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-theme-text text-theme-bg text-[10px] font-medium rounded-lg opacity-0 group-hover/cell:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity flex flex-col items-center">
                              <span className="font-bold">{day.minutes > 0 ? `${day.minutes} мин, сессий: ${day.sessionsCount}` : 'Нет активности'}</span>
                              <span className="opacity-70">{day.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Charts Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Chronotype */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-10 rounded-[3.5rem] border border-theme-border shadow-2xl min-h-[480px] flex flex-col group hover:border-theme-accent/30 transition-all duration-500 relative overflow-hidden"
        >
          <div className="mb-10 relative z-10">
            <h4 className="text-xl font-black text-theme-text uppercase tracking-tight font-display">Пики Активности</h4>
            <p className="text-sm text-theme-muted font-medium opacity-60">Анализ периодов максимального потока</p>
          </div>
          <div className="flex-1 min-h-0 relative z-10">
            {hasSessions ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chronotypeData}>
                  <PolarGrid stroke={colors.border} strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: colors.muted, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }} />
                  <Radar
                    dataKey="A"
                    stroke={colors.accent}
                    strokeWidth={3}
                    fill={colors.accent}
                    fillOpacity={0.3}
                    isAnimationActive={!performanceMode}
                    animationDuration={1500}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', padding: '12px 20px' }}
                    itemStyle={{ color: colors.accent, fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-theme-accent/5 flex items-center justify-center text-theme-accent mb-4 blur-sm opacity-50">
                  <span className="material-symbols-outlined text-4xl">radar</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted opacity-40">Нет данных для анализа</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Economy */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-10 rounded-[3.5rem] border border-theme-border shadow-2xl min-h-[480px] flex flex-col group hover:border-theme-accent/30 transition-all duration-500 relative overflow-hidden"
        >
          <div className="mb-10 relative z-10">
            <h4 className="text-xl font-black text-theme-text uppercase tracking-tight font-display">Траектория Роста</h4>
            <p className="text-sm text-theme-muted font-medium opacity-60">Баланс Звездной пыли (14 дней)</p>
          </div>
          <div className="flex-1 min-h-0 relative z-10">
            {hasSessions && economyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={economyData}>
                  <defs>
                    <linearGradient id="colorDust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.accent} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={colors.accent} stopOpacity={0}/>
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', padding: '12px 20px' }}
                    itemStyle={{ color: colors.accent, fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                    cursor={{ stroke: colors.accent, strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="dust" 
                    stroke={colors.accent} 
                    strokeWidth={6} 
                    fill="url(#colorDust)" 
                    isAnimationActive={!performanceMode}
                    animationDuration={2000}
                    filter="url(#glow)"
                    dot={{ fill: colors.accent, r: 4, strokeWidth: 2, stroke: colors.card }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: colors.accent, className: 'animate-pulse' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-theme-accent/5 flex items-center justify-center text-theme-accent mb-4 blur-sm opacity-50">
                  <span className="material-symbols-outlined text-4xl">trending_up</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted opacity-40">Начните сессию для отслеживания роста</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Balance */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-10 rounded-[3.5rem] border border-theme-border shadow-2xl min-h-[480px] flex flex-col group hover:border-theme-accent/30 transition-all duration-500 relative overflow-hidden"
        >
          <div className="mb-10 relative z-10">
            <h4 className="text-xl font-black text-theme-text uppercase tracking-tight font-display">Космические Сферы</h4>
            <p className="text-sm text-theme-muted font-medium opacity-60">Распределение усилий по категориям</p>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center relative z-10">
            {hasSessions && disciplineBalance.length > 0 ? (
              <>
                <div className="absolute inset-0 bg-theme-accent/5 blur-[80px] rounded-full pointer-events-none scale-50" />
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={disciplineBalance}
                      innerRadius={85}
                      outerRadius={120}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={!performanceMode}
                      animationDuration={1500}
                    >
                      {disciplineBalance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', padding: '12px 20px' }}
                      itemStyle={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center info */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="material-symbols-outlined text-4xl text-theme-accent opacity-50 block mb-1">rocket_launch</span>
                  <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest leading-tight">Focus<br/>Balance</p>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-theme-accent/5 flex items-center justify-center text-theme-accent mb-4 blur-sm opacity-50">
                  <span className="material-symbols-outlined text-4xl">pie_chart</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted opacity-40">Нет данных о дисциплинах</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
});

export default Statistics;
