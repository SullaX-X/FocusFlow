import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /const isOutsideYear = dDate\.getFullYear\(\) !== currentYear;/;
const replacement = `const isOutsideYear = dDate.getFullYear() !== currentYear;
      const isPast = dDate < new Date(currentYear, 0, 1);`;

content = content.replace(regex, replacement);

const cellClassRegex = /className=\{\`w-\[14px\] h-\[14px\] rounded-\[4px\] transition-all duration-300 relative group\/cell cursor-pointer \$\{day\.isOutsideYear \? 'opacity-30' : ''\}\`\}/;
const newCellClass = "className={`w-[14px] h-[14px] rounded-[4px] transition-all duration-300 relative group/cell cursor-pointer ${day.isOutsideYear ? 'opacity-30 pointer-events-none' : ''}`}";
content = content.replace(cellClassRegex, newCellClass);

const styleRegex = /style=\{getIntensityInlineStyle\(day\.minutes, day\.isOutsideYear, day\.isFuture\)\}/;
const newStyle = "style={day.isOutsideYear && day.minutes === 0 ? { opacity: 0, pointerEvents: 'none' } : getIntensityInlineStyle(day.minutes, day.isOutsideYear, day.isFuture)}";
content = content.replace(styleRegex, newStyle);

fs.writeFileSync('src/components/Statistics.tsx', content);
