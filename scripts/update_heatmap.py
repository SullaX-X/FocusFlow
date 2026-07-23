import re

with open('src/components/Statistics.tsx', 'r') as f:
    content = f.read()

# Replace the beginning of heatmap generation
old_heatmap = r"""  // Heatmap generation
  // 12 weeks back = 84 days
  const today = new Date\(\);
  today.setHours\(0,0,0,0\);
  const days: \{ date: string, minutes: number \}.*?  \};\n"""

new_heatmap = """  const [heatmapRange, setHeatmapRange] = useState<'12months' | 'currentYear'>('12months');
  
  // Heatmap generation
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Determine start date based on range
  const heatmapStart = new Date(today);
  if (heatmapRange === '12months') {
    heatmapStart.setFullYear(heatmapStart.getFullYear() - 1);
  } else {
    heatmapStart.setMonth(0, 1); // Jan 1st of current year
  }
  
  // Adjust to the previous Monday to align weeks
  const dayOfWeek = heatmapStart.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  heatmapStart.setDate(heatmapStart.getDate() - diffToMonday);

  const daysDiff = Math.ceil((today.getTime() - heatmapStart.getTime()) / (1000 * 3600 * 24)) + 1;
  
  // Ensure we round up to full weeks for consistent column height
  const totalDays = Math.ceil(daysDiff / 7) * 7;
  
  const heatmapDays: { date: string, minutes: number }[] = [];
  let totalMinutesInPeriod = 0;
  
  for (let i = 0; i < totalDays; i++) {
    const dDate = new Date(heatmapStart);
    dDate.setDate(dDate.getDate() + i);
    // Don't show future days, but we still need empty slots for layout if they exceed 'today'
    const isFuture = dDate > today;
    const dateStr = dDate.toISOString().split('T')[0];
    const mins = isFuture ? 0 : (stats?.dailyMinutes?.[dateStr] || 0);
    if (!isFuture) totalMinutesInPeriod += mins;
    heatmapDays.push({
      date: dateStr,
      minutes: mins,
      isFuture
    });
  }

  // Group into weeks (arrays of 7 days: Mon-Sun)
  const weeks: { date: string, minutes: number, isFuture: boolean }[][] = [];
  for (let i = 0; i < heatmapDays.length; i += 7) {
    weeks.push(heatmapDays.slice(i, i + 7));
  }

  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return 'bg-slate-100 dark:bg-slate-800/50 border-theme-border/50 border';
    if (minutes < 30) return 'bg-theme-accent/20 dark:bg-theme-accent/30';
    if (minutes < 60) return 'bg-theme-accent/40 dark:bg-theme-accent/50';
    if (minutes < 120) return 'bg-theme-accent/70 dark:bg-theme-accent/80';
    return 'bg-theme-accent dark:bg-theme-accent';
  };
"""

content = re.sub(old_heatmap, new_heatmap, content, flags=re.DOTALL)

# Now we need to replace the JSX rendering
# Search for `<div className="flex items-center justify-between mb-6 min-w-\[600px\]">`
# and end at `</motion.div>` for the heatmap block

jsx_start = content.find('className="bg-theme-card border border-theme-border shadow-sm p-6 rounded-2xl mb-6 overflow-x-auto"')
if jsx_start != -1:
    jsx_end = content.find('</motion.div>', jsx_start) + len('</motion.div>')
    
    new_jsx = """className="bg-theme-card border border-theme-border shadow-sm p-6 rounded-2xl mb-6 overflow-x-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 min-w-[700px] gap-4">
          <div className="flex items-center gap-4">
            <select 
              value={heatmapRange}
              onChange={(e) => setHeatmapRange(e.target.value as '12months' | 'currentYear')}
              className="bg-theme-bg border border-theme-border text-theme-text text-sm rounded-lg focus:ring-theme-accent focus:border-theme-accent px-3 py-2 outline-none cursor-pointer"
            >
              <option value="12months">Последние 12 месяцев</option>
              <option value="currentYear">Текущий год</option>
            </select>
            <span className="text-theme-muted text-sm font-medium">{totalMinutesInPeriod} мин сфокусировано</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-theme-muted">
            <span>Меньше</span>
            <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800/50 border border-theme-border/50"></div>
            <div className="w-3 h-3 rounded-sm bg-theme-accent/20 dark:bg-theme-accent/30"></div>
            <div className="w-3 h-3 rounded-sm bg-theme-accent/40 dark:bg-theme-accent/50"></div>
            <div className="w-3 h-3 rounded-sm bg-theme-accent/70 dark:bg-theme-accent/80"></div>
            <div className="w-3 h-3 rounded-sm bg-theme-accent dark:bg-theme-accent"></div>
            <span>Больше</span>
          </div>
        </div>
        
        <div className="flex min-w-[700px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[4px] pr-4 text-[10px] text-theme-muted pt-[20px]">
            <div className="h-3 flex items-center">Пн</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">Ср</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">Пт</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">Вс</div>
          </div>
          
          <div className="flex-1 flex flex-col gap-1 overflow-hidden relative">
            <div className="flex gap-[4px]">
              {weeks.map((week, wIdx) => {
                // Show month label roughly at the start of a month
                const firstDayOfMonth = week.find(d => d.date.endsWith('-01') || d.date.endsWith('-02') || d.date.endsWith('-03'));
                let monthLabel = null;
                if (firstDayOfMonth) {
                    const d = new Date(firstDayOfMonth.date);
                    if (d.getDate() <= 7) {
                        monthLabel = d.toLocaleString('ru-RU', { month: 'short' });
                    }
                }
                return (
                  <div key={wIdx} className="flex flex-col gap-[4px] relative min-w-[12px]">
                    {/* Month label header area */}
                    <div className="h-4 text-[10px] text-theme-muted absolute -top-5 left-0 whitespace-nowrap z-0">
                      {wIdx === 0 || monthLabel ? monthLabel || '' : ''}
                    </div>
                    {/* Days */}
                    {week.map((day, dIdx) => (
                      <div 
                        key={day.date}
                        className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm ${day.isFuture ? 'bg-transparent' : getIntensityColor(day.minutes)} transition-colors hover:ring-2 hover:ring-theme-accent/50 hover:scale-125 hover:z-10 relative group cursor-crosshair`}
                      >
                        {!day.isFuture && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-theme-card text-theme-text text-xs rounded border border-theme-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            {day.minutes > 0 ? `${day.minutes} мин` : 'Нет активности'} на {day.date}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-[10px] text-theme-muted border-t border-theme-border/50 pt-4">
          Примечание: Данные об активности отображаются по местному времени.
        </div>
      </motion.div>"""
    
    content = content[:jsx_start] + new_jsx + content[jsx_end:]
    
with open('src/components/Statistics.tsx', 'w') as f:
    f.write(content)

