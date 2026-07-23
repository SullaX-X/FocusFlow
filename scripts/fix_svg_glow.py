import re

with open('src/components/FocusMode.tsx', 'r') as f:
    content = f.read()

old_circle = """              <circle
                stroke={isOvertime ? "#10B981" : "var(--color-theme-accent)"}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-linear drop-shadow-[0_0_20px_rgba(var(--color-theme-accent),0.5)]"
              />"""

new_circle = """              <circle
                stroke={isOvertime ? "#10B981" : "var(--color-theme-accent)"}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className={`transition-all duration-1000 ease-linear ${isOvertime ? "drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "drop-shadow-[0_0_20px_rgba(var(--color-theme-accent),0.5)]"}`}
              />"""

content = content.replace(old_circle, new_circle)

with open('src/components/FocusMode.tsx', 'w') as f:
    f.write(content)
