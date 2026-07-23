import re

with open('src/AudioEngine.ts', 'r') as f:
    content = f.read()

# I will just leave the engine as is, or maybe clean it up if I need to.
# Actually leaving them in AudioEngine doesn't hurt and won't show in UI. 
# It avoids breaking things with regex.
