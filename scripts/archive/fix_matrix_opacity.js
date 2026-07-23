import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex4 = /style=\{day\.isOutsideYear && day\.minutes === 0 \? \{ opacity: 0, pointerEvents: 'none' \} : getIntensityInlineStyle\(day\.minutes, day\.isOutsideYear, day\.isFuture\)\}/;
content = content.replace(regex4, `style={getIntensityInlineStyle(day.minutes, day.isOutsideYear, day.isFuture)}`);

const regex5 = /className=\{\`w-\[14px\] h-\[14px\] rounded-\[4px\] transition-all duration-300 relative group\/cell cursor-pointer \$\{day\.isOutsideYear \? 'opacity-30 pointer-events-none' : ''\}\`\}/;
content = content.replace(regex5, "className={`w-[14px] h-[14px] rounded-[4px] transition-all duration-300 relative group/cell cursor-pointer ${day.isOutsideYear ? 'pointer-events-none' : ''}`}");

fs.writeFileSync('src/components/Statistics.tsx', content);
