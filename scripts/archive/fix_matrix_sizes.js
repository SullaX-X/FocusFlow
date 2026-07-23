import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

// Fix the cell sizes (remove md:w-4 md:h-4)
content = content.replace(
  /w-3\.5 h-3\.5 md:w-4 md:h-4 rounded-\[4px\]/g,
  'w-[14px] h-[14px] rounded-[4px]'
);

// Fix month labels spacing: 14px (cell) + 4px (gap) = 18px
content = content.replace(
  /style=\{\{ left: \`\\\$\\{m\.index \* 16\\}px\` \}\}/g,
  'style={{ left: `${m.index * 18}px` }}'
);

fs.writeFileSync('src/components/Statistics.tsx', content);
