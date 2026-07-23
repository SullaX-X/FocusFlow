import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

toast_jsx = """
      <AnimatePresence>
        {showTimeUpAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] bg-theme-card border border-theme-accent shadow-2xl p-4 rounded-xl flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-theme-accent/20 flex items-center justify-center text-theme-accent">
              <span className="material-symbols-outlined">notifications_active</span>
            </div>
            <div>
              <h3 className="font-bold text-theme-text">Время вышло!</h3>
              <p className="text-sm text-theme-muted">Пора сделать перерыв или продолжить работу.</p>
            </div>
            <button 
              onClick={() => setShowTimeUpAlert(false)}
              className="ml-4 p-2 text-theme-muted hover:text-theme-text transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
"""

content = content.replace("<div className={`fixed inset-0 bg-theme-bg", toast_jsx + "\n      <div className={`fixed inset-0 bg-theme-bg")

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)

