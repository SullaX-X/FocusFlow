import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

# Fix the shadow for the big timer SVG circle
old_shadow = 'drop-shadow-[0_0_20px_rgba(var(--color-theme-accent),0.5)]'
new_shadow = 'drop-shadow-[0_0_20px_var(--color-theme-accent)]'
content = content.replace(old_shadow, new_shadow)

# Fix the shadow for the SVG tag itself
old_svg_shadow = 'drop-shadow-[0_0_15px_rgba(var(--color-theme-accent),0.3)]'
new_svg_shadow = 'drop-shadow-[0_0_15px_var(--color-theme-accent)]'
content = content.replace(old_svg_shadow, new_svg_shadow)


# Fix the shadow for the Dimoon active background SVG glow
old_dimoon_glow = 'drop-shadow-[0_0_60px_var(--color-theme-accent)]'
# Actually this one is fine because it doesn't use rgba

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
