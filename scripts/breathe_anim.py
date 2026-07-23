import re
with open('src/index.css', 'r') as f:
    content = f.read()

if 'breatheScale' not in content:
    content = content.replace(
        '@keyframes breathe {',
        '@keyframes breatheScale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }\n@keyframes breathe {'
    ).replace(
        '--animate-breathe: breathe 8s ease-in-out infinite;',
        '--animate-breathe: breathe 8s ease-in-out infinite;\n  --animate-breathe-scale: breatheScale 8s ease-in-out infinite;'
    )
    with open('src/index.css', 'w') as f:
        f.write(content)
