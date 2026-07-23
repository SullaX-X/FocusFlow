import re

with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

# remove class AudioEngine from AudioContext.tsx
content = re.sub(r'class AudioEngine \{.*?const engine = new AudioEngine\(\);', 'import { AudioEngine } from "./AudioEngine";\n\nconst engine = new AudioEngine();', content, flags=re.DOTALL)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
