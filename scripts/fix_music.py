import re
with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'className=\{`text-theme-muted hover:text-white transition-all duration-300 p-2 rounded-full bg-theme-card/80 hover:bg-theme-accent hover:shadow-\[0_0_15px_rgba\(var\(--color-theme-accent\),0\.4\)\] hover:scale-110 active:scale-95 backdrop-blur-sm shadow-sm (\$\{[^}]*\})`\}',
    r'className={`text-theme-muted hover-btn-accent \1`}',
    content
)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
