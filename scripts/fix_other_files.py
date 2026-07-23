import re
import glob

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    def repl(m):
        percent = int(float(m.group(1)) * 100)
        return f"color-mix(in_srgb,var(--color-theme-accent)_{percent}%,transparent)"
    
    new_content = re.sub(r'rgba\(var\(--color-theme-accent\),\s*([0-9.]+)\)', repl, content)
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for f in glob.glob('src/**/*.tsx', recursive=True):
    if 'FocusMode' not in f:
        fix_file(f)
