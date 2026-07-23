import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

# Add showTimeUpAlert state
state_insert = """  const [showTimeUpAlert, setShowTimeUpAlert] = useState(false);
"""
idx = content.find("const [isMinimized, setIsMinimized] = useState(false);")
content = content[:idx] + state_insert + content[idx:]

# Inside useEffect for overtime, show alert
eff_find = """      setIsOvertime(true);
      if ("Notification" in window && Notification.permission === "granted") {"""
eff_repl = """      setIsOvertime(true);
      setShowTimeUpAlert(true);
      setTimeout(() => setShowTimeUpAlert(false), 15000);
      if ("Notification" in window && Notification.permission === "granted") {"""
content = content.replace(eff_find, eff_repl)

# Inside render, add the toast if showTimeUpAlert
# I will add it right before `if (isMinimized) { return ... }` but we want it to render!
# So I should add it inside the main return. Let's find `<AnimatePresence>` around the main return maybe? No, let's just add it inside the outermost div.
# Let's see the outermost div.

