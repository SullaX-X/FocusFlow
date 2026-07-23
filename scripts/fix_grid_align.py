import re

with open('src/components/Statistics.tsx', 'r') as f:
    content = f.read()

bad = """          <div className="flex-1 flex flex-col gap-1 relative">
            <div className="flex gap-[4px]">"""

good = """          <div className="flex-1 flex flex-col gap-1 relative pt-[20px]">
            <div className="flex gap-[4px]">"""

content = content.replace(bad, good)

with open('src/components/Statistics.tsx', 'w') as f:
    f.write(content)

