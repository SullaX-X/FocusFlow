import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Replace weekly goal panel
old_weekly_panel = """        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-[32px] flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-theme-accent/10 flex items-center justify-center text-theme-accent shrink-0">
              <span className="material-symbols-outlined text-2xl">monitoring</span>
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
        </motion.div>"""

new_weekly_panel = """        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`glass-panel p-6 rounded-[32px] flex items-center justify-between transition-all duration-700 ${isGoalExceeded ? 'ring-2 ring-theme-success/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-theme-success/5' : ''}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isGoalExceeded ? 'bg-theme-success/20 text-theme-success shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-theme-accent/10 text-theme-accent'}`}>
              <span className="material-symbols-outlined text-2xl">{isGoalExceeded ? 'local_fire_department' : 'monitoring'}</span>
            </div>
            <div>
              <p className="text-theme-muted font-medium text-sm flex items-center gap-2">
                Цель на неделю
              </p>
              <div className="text-3xl font-bold text-theme-text flex items-center gap-2 group/edit relative mt-1">
                <span className={isGoalExceeded ? 'text-theme-success drop-shadow-sm' : ''}>{weeklyProgress % 1 === 0 ? weeklyProgress : weeklyProgress.toFixed(1)}</span>
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
              {isGoalExceeded ? (
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
              ) : (
                <p className="text-xs text-theme-accent mt-1">Осталось {remainingHours} часа</p>
              )}
            </div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90 transform">
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-slate-100 dark:stroke-slate-800" />
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeLinecap="round" 
                className={`transition-all duration-1000 ${isGoalExceeded ? 'stroke-theme-success drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'stroke-theme-accent'}`} 
                strokeDasharray="175.93" strokeDashoffset={175.93 - (175.93 * (isGoalExceeded ? 100 : progressPercent)) / 100} 
              />
            </svg>
            <span className={`absolute text-sm font-bold ${isGoalExceeded ? 'text-theme-success' : 'text-theme-text'}`}>
              {Math.round(rawProgressPercent)}%
            </span>
          </div>
        </motion.div>"""

content = content.replace(old_weekly_panel, new_weekly_panel)

# Also fix the daily goal render which is right above it
# Find it
old_daily_panel = """        <motion.div 
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

new_daily_panel = old_daily_panel.replace(
    "{isDailyGoalExceeded ? `+${Math.round(excessDailyPercent)}%` : `${Math.round(dailyProgressPercent)}%`}",
    "{Math.round(rawDailyPercent)}%"
)

content = content.replace(old_daily_panel, new_daily_panel)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
