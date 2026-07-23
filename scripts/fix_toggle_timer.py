import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

old_toggle = """  const toggleTimer = () => {
    if (!isActive) unlockAudio();
    setIsActive(!isActive);
  };"""

new_toggle = """  const toggleTimer = () => {
    if (!isActive) {
      unlockAudio();
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
    setIsActive(!isActive);
  };"""

content = content.replace(old_toggle, new_toggle)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
