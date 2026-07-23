import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Fix imports/props
old_props = "export default function Dashboard({ disciplines, toggleDay, startFocus, stats, updateWeeklyGoal, addDiscipline }: any) {"
new_props = "export default function Dashboard({ disciplines, toggleDay, startFocus, stats, updateWeeklyGoal, updateDailyGoal, claimBonusDust, addDiscipline }: any) {"
content = content.replace(old_props, new_props)

old_state = """  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(stats?.weeklyGoal || 10);
  const [isAdding, setIsAdding] = useState(false);"""
new_state = """  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(stats?.weeklyGoal || 10);
  const [isEditingDailyGoal, setIsEditingDailyGoal] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState(stats?.dailyGoal || 120);
  const [isAdding, setIsAdding] = useState(false);
  
  const [claimedWeekly, setClaimedWeekly] = useState(false);
  const [claimedDaily, setClaimedDaily] = useState(false);"""
content = content.replace(old_state, new_state)

# Daily progress calculations
old_calc_daily = """  // Calculate today's focused hours
  const todayMinutes = stats?.dailyMinutes?.[new Date().toISOString().split('T')[0]] || 0;
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;"""
new_calc_daily = """  // Calculate today's focused hours
  const todayMinutes = stats?.dailyMinutes?.[new Date().toISOString().split('T')[0]] || 0;
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;
  
  const dailyGoal = stats?.dailyGoal || 120; // default 120 mins (2 hours)
  const rawDailyPercent = (todayMinutes / dailyGoal) * 100;
  const dailyProgressPercent = Math.min(rawDailyPercent, 100);
  const isDailyGoalExceeded = rawDailyPercent > 100;
  const excessDailyPercent = isDailyGoalExceeded ? (rawDailyPercent - 100) : 0;
  const remainingDailyMins = Math.max(dailyGoal - todayMinutes, 0);"""
content = content.replace(old_calc_daily, new_calc_daily)

# Render Daily Tile
old_render_daily = """        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-[32px] flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-theme-accent/10 flex items-center justify-center text-theme-accent shrink-0">
              <span className="material-symbols-outlined text-2xl">timer</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm">Сегодня сфокусировано</p>
              <div className="text-3xl font-bold text-theme-text mt-1">
                {todayHours > 0 ? `${todayHours} ч ` : ''}{todayMins} м
              </div>
              <p className="text-xs text-theme-accent mt-1">Вчера: {stats?.dailyMinutes?.[past7Days[5].date] || 0} м</p>
            </div>
          </div>
        </motion.div>"""

new_render_daily = """        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`glass-panel p-6 rounded-[32px] flex items-center justify-between transition-all duration-700 ${isDailyGoalExceeded ? 'ring-2 ring-theme-success/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-theme-success/5' : ''}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDailyGoalExceeded ? 'bg-theme-success/20 text-theme-success shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-theme-accent/10 text-theme-accent'}`}>
              <span className="material-symbols-outlined text-2xl">{isDailyGoalExceeded ? 'local_fire_department' : 'timer'}</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm flex items-center gap-2">
                Сегодня фокус
                {isDailyGoalExceeded && (
                  <span className="text-[10px] uppercase font-bold bg-theme-success/20 text-theme-success px-2 py-0.5 rounded-full animate-pulse">
                    Сверх нормы!
                  </span>
                )}
              </p>
              <div className="text-3xl font-bold text-theme-text flex items-center gap-2 mt-1 relative">
                <span className={isDailyGoalExceeded ? 'text-theme-success drop-shadow-sm' : ''}>{todayHours > 0 ? `${todayHours}ч ` : ''}{todayMins}м</span>
                <span className="text-lg text-slate-400 font-normal">/</span>
                {isEditingDailyGoal ? (
                  <input 
                    autoFocus type="number" value={dailyGoalInput}
                    onChange={(e) => setDailyGoalInput(Number(e.target.value))}
                    onBlur={() => { updateDailyGoal(dailyGoalInput); setIsEditingDailyGoal(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateDailyGoal(dailyGoalInput); setIsEditingDailyGoal(false); } }}
                    className="w-16 bg-transparent border-b border-theme-accent outline-none text-theme-text"
                  />
                ) : (
                  <span className="text-lg text-slate-400 font-normal cursor-pointer hover:text-theme-accent transition-colors" onClick={() => setIsEditingDailyGoal(true)}>
                    {Math.floor(dailyGoal / 60) > 0 ? `${Math.floor(dailyGoal/60)}ч ` : ''}{dailyGoal % 60 > 0 ? `${dailyGoal%60}м` : ''}
                  </span>
                )}
              </div>
              {isDailyGoalExceeded ? (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-theme-success font-medium">Сверх: {todayMinutes - dailyGoal} м (+{Math.round(excessDailyPercent)}%)</p>
                  {!claimedDaily && (
                    <button 
                      onClick={() => { claimBonusDust(50); setClaimedDaily(true); }}
                      className="text-[10px] bg-theme-success/20 hover:bg-theme-success/30 text-theme-success px-2 py-0.5 rounded-full border border-theme-success/30 transition-colors"
                    >
                      Забрать пыльцу
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-theme-accent mt-1">Осталось {Math.floor(remainingDailyMins / 60) > 0 ? `${Math.floor(remainingDailyMins/60)}ч ` : ''}{remainingDailyMins % 60}м</p>
              )}
            </div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90 transform">
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-slate-100 dark:stroke-slate-800" />
              <circle 
                cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeLinecap="round" 
                className={`transition-all duration-1000 ${isDailyGoalExceeded ? 'stroke-theme-success drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'stroke-theme-accent'}`} 
                strokeDasharray="175.93" strokeDashoffset={175.93 - (175.93 * (isDailyGoalExceeded ? 100 : dailyProgressPercent)) / 100} 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-sm font-bold ${isDailyGoalExceeded ? 'text-theme-success' : 'text-theme-text'}`}>
                {isDailyGoalExceeded ? `+${Math.round(excessDailyPercent)}%` : `${Math.round(dailyProgressPercent)}%`}
              </span>
            </div>
          </div>
        </motion.div>"""
content = content.replace(old_render_daily, new_render_daily)

# Add bonus dust claim to Weekly Goal
old_weekly = """              {isGoalExceeded ? (
                <p className="text-xs text-theme-success mt-1 font-medium">Сверх цели: {excessHours} ч (+{Math.round(excessPercent)}%)</p>
              ) : ("""
new_weekly = """              {isGoalExceeded ? (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-theme-success font-medium">Сверх цели: {excessHours} ч (+{Math.round(excessPercent)}%)</p>
                  {!claimedWeekly && (
                    <button 
                      onClick={() => { claimBonusDust(100); setClaimedWeekly(true); }}
                      className="text-[10px] bg-theme-success/20 hover:bg-theme-success/30 text-theme-success px-2 py-0.5 rounded-full border border-theme-success/30 transition-colors"
                    >
                      Забрать пыльцу
                    </button>
                  )}
                </div>
              ) : ("""
content = content.replace(old_weekly, new_weekly)


with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
