import re

with open('src/index.css', 'r') as f:
    content = f.read()

def repl(m):
    percent = int(float(m.group(1)) * 100)
    return f"color-mix(in srgb, var(--color-theme-accent) {percent}%, transparent)"

new_content = re.sub(r'rgba\(var\(--color-theme-accent\),\s*([0-9.]+)\)', repl, content)

with open('src/index.css', 'w') as f:
    f.write(new_content)
    
print("Updated index.css")
