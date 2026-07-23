import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Revert color-mix back to rgba
    def repl(m):
        percent = int(m.group(1))
        alpha = percent / 100.0
        return f"rgba(var(--color-theme-accent),{alpha})"
    
    new_content = re.sub(r'color-mix\(in srgb,\s*var\(--color-theme-accent\)\s*(\d+)%,\s*transparent\)', repl, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Reverted {filepath}")

for f in glob.glob('src/**/*.tsx', recursive=True):
    fix_file(f)
fix_file('src/index.css')
