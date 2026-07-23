import re
with open('src/components/FocusMode.tsx', 'r') as f:
    text = f.read()

# Let's just make sure there are no remaining invalid rgba(var(--color-theme-accent), X)
if 'rgba(var(--color-theme-accent)' in text:
    print("WARNING: still contains invalid rgba")
else:
    print("All clear")
