import re

with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

new_nature = """  { id: 'rain', name: 'Шум дождя', type: 'synth', category: 'Природа' },
  { id: 'sea', name: 'Море', type: 'synth', category: 'Природа' },
  { id: 'river', name: 'Река', type: 'synth', category: 'Природа' },
  { id: 'birds', name: 'Пение птиц', type: 'synth', category: 'Природа' },
  { id: 'fire', name: 'Костёр', type: 'synth', category: 'Природа' },
  { id: 'wind', name: 'Ветер', type: 'synth', category: 'Природа' },
  { id: 'crickets', name: 'Ночные сверчки', type: 'synth', category: 'Природа' },
  { id: 'thunder', name: 'Гроза', type: 'synth', category: 'Природа' },"""

content = re.sub(
    r"\{\s*id:\s*'rain'.*?\{\s*id:\s*'birds'.*?\},",
    new_nature,
    content,
    flags=re.DOTALL
)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
print("Updated AudioContext.tsx")
