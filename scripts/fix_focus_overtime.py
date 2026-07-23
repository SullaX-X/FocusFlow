import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

# Fix prop type
content = content.replace(
    '  addFocusMinutes: (m: number) => void;',
    '  addFocusMinutes: (m: number, isOvertime?: boolean) => void;'
)

# Fix call
content = content.replace(
    '          addFocusMinutes(1);',
    '          addFocusMinutes(1, isOvertime);'
)

# Now, we need to show the +XX% for overtime.
# It should glow.
# Wait, let's find this section:
old_timer = """              ) : (
                <div
                  className={`text-[60px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto transition-colors duration-1000 ${isOvertime ? "text-theme-success drop-shadow-lg" : "text-theme-text"} ${isActive && !isOvertime ? "animate-breathe-scale" : ""}`}
                >
                  {isOvertime && "+"}
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>
              )}"""

new_timer = """              ) : (
                <div className="flex flex-col items-center justify-center pointer-events-auto">
                  <div
                    className={`text-[60px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums transition-colors duration-1000 ${isOvertime ? "text-theme-success drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "text-theme-text"} ${isActive && !isOvertime ? "animate-breathe-scale" : ""}`}
                  >
                    {isOvertime && "+"}
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                  </div>
                  {isOvertime && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="absolute -bottom-6 flex flex-col items-center gap-1"
                    >
                      <span className="text-sm font-bold text-theme-success bg-theme-success/20 px-3 py-1 rounded-full border border-theme-success/30 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        +{Math.round((timeLeft / totalTime) * 100)}% сверх цели
                      </span>
                      <span className="text-[10px] text-theme-success/80">
                        Двойная звездная пыльца!
                      </span>
                    </motion.div>
                  )}
                </div>
              )}"""

content = content.replace(old_timer, new_timer)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
