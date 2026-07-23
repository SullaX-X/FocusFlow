import os
import glob

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to replace rgba(var(--color-theme-accent), X) with var(--color-theme-accent)
    # Actually since it's just a few files let's just do a simple regex
    import re
    # Match rgba(var(--color-theme-accent), <any_number>)
    # and replace with var(--color-theme-accent) but since 100% opacity is too strong for shadows,
    # we can use color-mix(in srgb, var(--color-theme-accent) <number*100>%, transparent)
    
    def repl(m):
        alpha = float(m.group(1))
        percent = int(alpha * 100)
        return f"color-mix(in srgb, var(--color-theme-accent) {percent}%, transparent)"
    
    new_content = re.sub(r'rgba\(var\(--color-theme-accent\),\s*([0-9.]+)\)', repl, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for f in glob.glob('src/**/*.tsx', recursive=True):
    fix_file(f)
fix_file('src/index.css')

