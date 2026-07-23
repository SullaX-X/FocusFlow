import re
with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

# remove _old_stop completely up to stopAll()
content = re.sub(r'  _old_stop\(id: string\) \{.*?  stopAll\(\) \{', '  stopAll() {', content, flags=re.DOTALL)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
