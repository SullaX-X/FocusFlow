import re

with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

# Remove the bad sounds from the sounds list
to_remove = [
    r"\{\s*id:\s*'river'.*?\},",
    r"\{\s*id:\s*'birds'.*?\},",
    r"\{\s*id:\s*'fire'.*?\},",
    r"\{\s*id:\s*'wind'.*?\},",
    r"\{\s*id:\s*'crickets'.*?\},",
    r"\{\s*id:\s*'thunder'.*?\},",
    r"\{\s*id:\s*'river_piano'.*?\},",
    r"\{\s*id:\s*'tibetan_birds'.*?\},",
    r"\{\s*id:\s*'sea_piano_flute'.*?\},"
]

for pattern in to_remove:
    content = re.sub(pattern, "", content)

# Remove empty lines that might be left
content = re.sub(r'\n\s*\n', '\n', content)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)

