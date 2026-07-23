import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

content = content.replace("{isOvertime {isOvertime && !isActive && ({isOvertime && !isActive && ( (", "{isOvertime && (")

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
