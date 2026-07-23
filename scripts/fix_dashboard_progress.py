import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Update logic at the top
old_logic = """  const weeklyProgress = getWeekProgress();
  const weeklyGoal = stats?.weeklyGoal || 10;
  const progressPercent = Math.min((weeklyProgress / weeklyGoal) * 100, 100);
  const remainingHours = Math.max(weeklyGoal - weeklyProgress, 0).toFixed(1);"""

new_logic = """  const weeklyProgress = getWeekProgress();
  const weeklyGoal = stats?.weeklyGoal || 10;
  const rawProgressPercent = (weeklyProgress / weeklyGoal) * 100;
  const progressPercent = Math.min(rawProgressPercent, 100);
  const isGoalExceeded = rawProgressPercent > 100;
  const excessPercent = isGoalExceeded ? (rawProgressPercent - 100) : 0;
  const remainingHours = Math.max(weeklyGoal - weeklyProgress, 0).toFixed(1);
  const excessHours = Math.max(weeklyProgress - weeklyGoal, 0).toFixed(1);"""

content = content.replace(old_logic, new_logic)

# Update the rendered block for Weekly Goal
old_render = """        <motion.div 
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

new_render = """        <motion.div 
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
                {isGoalExceeded && (
                  <span className="text-[10px] uppercase font-bold bg-theme-success/20 text-theme-success px-2 py-0.5 rounded-full animate-pulse">
                    Превышена!
                  </span>
                )}
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
                <p className="text-xs text-theme-success mt-1 font-medium">Сверх цели: {excessHours} ч (+{Math.round(excessPercent)}%)</p>
              ) : (
                <p className="text-xs text-theme-accent mt-1">Осталось {remainingHours} часа</p>
              )}
            </div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90 transform">
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-slate-100 dark:stroke-slate-800" />
              <circle 
                cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeLinecap="round" 
                className={`transition-all duration-1000 ${isGoalExceeded ? 'stroke-theme-success drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'stroke-theme-accent'}`} 
                strokeDasharray="175.93" strokeDashoffset={175.93 - (175.93 * (isGoalExceeded ? 100 : progressPercent)) / 100} 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-sm font-bold ${isGoalExceeded ? 'text-theme-success' : 'text-theme-text'}`}>
                {isGoalExceeded ? `+${Math.round(excessPercent)}%` : `${Math.round(progressPercent)}%`}
              </span>
            </div>
          </div>
        </motion.div>"""

content = content.replace(old_render, new_render)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
