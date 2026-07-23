import re

with open('src/components/Statistics.tsx', 'r') as f:
    content = f.read()

# Replace the days label block
old_labels = """          {/* Day labels */}
          <div className="flex flex-col gap-[4px] pr-4 text-[10px] text-theme-muted pt-[20px]">
            <div className="h-3 flex items-center">Пн</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">Ср</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">Пт</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">Вс</div>
          </div>"""

new_labels = """          {/* Day labels */}
          <div className="flex flex-col gap-[4px] pr-4 text-[10px] text-theme-muted pt-[20px]">
            <div className="h-3 md:h-3.5 flex items-center">Пн</div>
            <div className="h-3 md:h-3.5"></div>
            <div className="h-3 md:h-3.5 flex items-center">Ср</div>
            <div className="h-3 md:h-3.5"></div>
            <div className="h-3 md:h-3.5 flex items-center">Пт</div>
            <div className="h-3 md:h-3.5"></div>
            <div className="h-3 md:h-3.5 flex items-center">Вс</div>
          </div>"""

content = content.replace(old_labels, new_labels)

with open('src/components/Statistics.tsx', 'w') as f:
    f.write(content)
