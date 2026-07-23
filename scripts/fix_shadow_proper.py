import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

# Replace invalid rgba() with valid color-mix() using underscores for Tailwind compatibility
def repl(m):
    percent = int(float(m.group(1)) * 100)
    return f"color-mix(in_srgb,var(--color-theme-accent)_{percent}%,transparent)"

# This will replace drop-shadow-[0_0_20px_rgba(var(--color-theme-accent),0.5)] 
# with drop-shadow-[0_0_20px_color-mix(in_srgb,var(--color-theme-accent)_50%,transparent)]
new_content = re.sub(r'rgba\(var\(--color-theme-accent\),\s*([0-9.]+)\)', repl, content)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(new_content)
    
print("Updated FocusMode.tsx with valid color-mix")
