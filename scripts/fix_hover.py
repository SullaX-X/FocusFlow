import re
with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'\s*\{isHoveringTelescope && \(\s*<div className="absolute inset-0 pointer-events-none z-\[10\] overflow-hidden">[\s\S]*?</div>\s*\)\}', '', content)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
