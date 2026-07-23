import re
with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'onMouseEnter={() => {\n                  confetti({\n                    particleCount: 20,\n                    spread: 120,\n                    origin: { y: 0, x: Math.random() * 0.5 + 0.25 },\n                    colors: [\'#ffffff\', \'#fde047\', \'#38bdf8\'],\n                    shapes: [\'star\'],\n                    gravity: 0.8,\n                    ticks: 200,\n                  });\n                }}\n                className="text-theme-accent hover:text-white transition-colors w-14 h-14 rounded-full bg-theme-card border border-theme-accent/30 hover:bg-theme-accent/40 flex items-center justify-center btn-tactile animate-[pulse_3s_ease-in-out_infinite] hover:animate-none shadow-[0_0_15px_rgba(var(--color-theme-accent),0.4)] relative z-50"\n                title="Посмотреть на звезды"\n                onMouseEnter={() => setIsHoveringTelescope(true)}\n                onMouseLeave={() => setIsHoveringTelescope(false)}',
    'onMouseEnter={() => {\n                  setIsHoveringTelescope(true);\n                  confetti({\n                    particleCount: 20,\n                    spread: 120,\n                    origin: { y: 0, x: Math.random() * 0.5 + 0.25 },\n                    colors: [\'#ffffff\', \'#fde047\', \'#38bdf8\'],\n                    shapes: [\'star\'],\n                    gravity: 0.8,\n                    ticks: 200,\n                  });\n                }}\n                onMouseLeave={() => setIsHoveringTelescope(false)}\n                className="text-theme-accent hover:text-white transition-colors w-14 h-14 rounded-full bg-theme-card border border-theme-accent/30 hover:bg-theme-accent/40 flex items-center justify-center btn-tactile animate-[pulse_3s_ease-in-out_infinite] hover:animate-none shadow-[0_0_15px_rgba(var(--color-theme-accent),0.4)] relative z-50"\n                title="Посмотреть на звезды"'
)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
