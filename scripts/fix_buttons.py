import re
with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="text-theme-muted hover:text-theme-text transition-colors p-2 bg-theme-card/80 hover:bg-theme-border/50 backdrop-blur-sm rounded-full shadow-sm"',
    'className="text-theme-muted hover:text-white transition-all duration-300 p-2 bg-theme-card/80 hover:bg-theme-accent hover:shadow-[0_0_15px_rgba(var(--color-theme-accent),0.4)] hover:scale-110 active:scale-95 backdrop-blur-sm rounded-full shadow-sm"'
).replace(
    'className="text-theme-muted hover:text-red-500 transition-colors p-2 bg-theme-card/80 hover:bg-theme-border/50 backdrop-blur-sm rounded-full shadow-sm"',
    'className="text-theme-muted hover:text-white transition-all duration-300 p-2 bg-theme-card/80 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-95 backdrop-blur-sm rounded-full shadow-sm"'
)

# For music and lock
content = re.sub(
    r'className={`text-theme-muted hover:text-theme-text transition-colors p-2 rounded-full bg-theme-card/80 hover:bg-theme-border/50 backdrop-blur-sm shadow-sm (\${[^}]*})`}',
    r'className={`text-theme-muted hover:text-white transition-all duration-300 p-2 rounded-full bg-theme-card/80 hover:bg-theme-accent hover:shadow-[0_0_15px_rgba(var(--color-theme-accent),0.4)] hover:scale-110 active:scale-95 backdrop-blur-sm shadow-sm \1`}',
    content
)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
