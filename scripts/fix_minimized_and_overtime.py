import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

# 1. Restore counting up in the interval
old_interval = """        if (!isOvertime) {
          setTimeLeft((prev) => {
            if (prev <= 1) return 0;
            return prev - 1;
          });
        }"""

new_interval = """        if (!isOvertime) {
          setTimeLeft((prev) => {
            if (prev <= 1) return 0;
            return prev - 1;
          });
        } else {
          // Count up for overtime
          setTimeLeft((prev) => prev + 1);
        }"""
content = content.replace(old_interval, new_interval)

# 2. Make sure it doesn't stop when it reaches 0
old_reach_zero = """  useEffect(() => {
    if (timeLeft === 0 && !isOvertime && isActive) {
      setIsOvertime(true);
      setIsActive(false);"""

new_reach_zero = """  useEffect(() => {
    if (timeLeft === 0 && !isOvertime && isActive) {
      setIsOvertime(true);"""
content = content.replace(old_reach_zero, new_reach_zero)


# 3. Update Minimized view
old_minimized = """  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 md:right-6 bg-theme-card border border-theme-border p-4 rounded-2xl shadow-2xl z-[999] flex items-center gap-4 cursor-pointer hover:border-theme-accent transition-colors group"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex flex-col">
          <span className="text-xs text-theme-muted font-medium max-w-[150px] truncate">
            {task ? task.title : "Свободная сессия"}
          </span>
          <div className="text-2xl font-mono font-bold text-theme-text tabular-nums tracking-tighter">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>"""

new_minimized = """  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 md:right-6 bg-theme-card border p-4 rounded-2xl shadow-2xl z-[999] flex items-center gap-4 cursor-pointer transition-colors group ${isOvertime ? 'border-theme-success shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-theme-success/5' : 'border-theme-border hover:border-theme-accent'}`}
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex flex-col">
          <span className={`text-xs font-medium max-w-[150px] truncate ${isOvertime ? 'text-theme-success/80' : 'text-theme-muted'}`}>
            {task ? task.title : "Свободная сессия"}
          </span>
          <div className={`text-2xl font-mono font-bold tabular-nums tracking-tighter ${isOvertime ? 'text-theme-success' : 'text-theme-text'}`}>
            {isOvertime && "+"}
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>"""
content = content.replace(old_minimized, new_minimized)


# 4. Make sure timer itself renders "+" in overtime!
old_timer = """              ) : (
                <div
                  className={`text-[60px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto transition-colors duration-1000 ${isOvertime ? "text-theme-success drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "text-theme-text"} ${isActive && !isOvertime ? "animate-breathe-scale" : ""}`}
                >
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>
              )}"""

new_timer = """              ) : (
                <div
                  className={`text-[60px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto transition-colors duration-1000 ${isOvertime ? "text-theme-success drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse" : "text-theme-text"} ${isActive && !isOvertime ? "animate-breathe-scale" : ""}`}
                >
                  {isOvertime && "+"}
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>
              )}"""
content = content.replace(old_timer, new_timer)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
