import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

old_reach_zero = """  useEffect(() => {
    if (timeLeft === 0 && !isOvertime && isActive) {
      setIsOvertime(true);
      setIsActive(false);
      if (endAudioRef.current) {"""

new_reach_zero = """  useEffect(() => {
    if (timeLeft === 0 && !isOvertime && isActive) {
      setIsOvertime(true);
      if (endAudioRef.current) {"""
content = content.replace(old_reach_zero, new_reach_zero)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
