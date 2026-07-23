import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /className=\{\`w-\[14px\] h-\[14px\] rounded-\[4px\] transition-all duration-300 relative group\/cell cursor-pointer \$\{day\.isOutsideYear \? 'opacity-30 pointer-events-none' : ''\}\`\}/;
const replacement = "className={`w-[14px] h-[14px] rounded-[4px] transition-all duration-300 relative group/cell cursor-pointer ${(day.isOutsideYear || day.isBeforeAppExisted) && day.minutes === 0 ? 'pointer-events-none' : ''}`}";

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Statistics.tsx', content);
