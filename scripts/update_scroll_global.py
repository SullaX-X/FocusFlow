import re
with open('src/index.css', 'r') as f:
    content = f.read()

content = re.sub(r'\.custom-scrollbar\s*{[^}]*}\s*\.custom-scrollbar::-webkit-scrollbar\s*{[^}]*}\s*\.custom-scrollbar::-webkit-scrollbar-track\s*{[^}]*}\s*\.custom-scrollbar::-webkit-scrollbar-thumb\s*{[^}]*}\s*\.custom-scrollbar::-webkit-scrollbar-thumb:hover\s*{[^}]*}', '''
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
*::-webkit-scrollbar-track {
  background: transparent;
}
*::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
*::-webkit-scrollbar-thumb:hover {
  background-color: var(--accent);
}
''', content)

with open('src/index.css', 'w') as f:
    f.write(content)
