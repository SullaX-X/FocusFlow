import re
with open('src/index.css', 'r') as f:
    content = f.read()

content = re.sub(r'\.custom-scrollbar\s*{[^}]*}\s*\.custom-scrollbar::-webkit-scrollbar\s*{[^}]*}', '''
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--accent);
}
''', content)

with open('src/index.css', 'w') as f:
    f.write(content)
