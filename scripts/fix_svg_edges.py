import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

old_svg = """            {/* SVG Circle Timer */}
            <svg
              viewBox={`0 0 ${radius * 2} ${radius * 2}`}
              className={`w-[280px] h-[280px] md:w-[320px] md:h-[320px] origin-center drop-shadow-[0_0_15px_var(--color-theme-accent)] ${isActive && !isOvertime ? "animate-breathe" : "rotate-[-90deg]"}`}
            >"""

new_svg = """            {/* SVG Circle Timer */}
            <svg
              viewBox={`0 0 ${radius * 2} ${radius * 2}`}
              overflow="visible"
              className={`w-[280px] h-[280px] md:w-[320px] md:h-[320px] origin-center ${isActive && !isOvertime ? "animate-breathe" : "rotate-[-90deg]"}`}
            >"""
content = content.replace(old_svg, new_svg)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
