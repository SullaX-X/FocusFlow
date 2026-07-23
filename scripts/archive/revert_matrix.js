import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex1 = / \/\/ Find the first ever app usage date[\s\S]*?firstUsageDate\.setHours\(0, 0, 0, 0\);\n\n    \/\/ Pre-compute sessions map by date string for O\(1\) lookup/;
content = content.replace(regex1, '    // Pre-compute sessions map by date string for O(1) lookup');

const regex2 = /const isBeforeAppExisted = dDate < firstUsageDate;/;
content = content.replace(regex2, '');

const regex3 = /isOutsideYear,\n        isBeforeAppExisted,\n        label:/;
content = content.replace(regex3, 'isOutsideYear,\n        label:');

const regex4 = /style=\{\(day\.isOutsideYear \|\| day\.isBeforeAppExisted\) && day\.minutes === 0 \? \{ opacity: 0, pointerEvents: 'none' \} : getIntensityInlineStyle\(day\.minutes, day\.isOutsideYear \|\| day\.isBeforeAppExisted, day\.isFuture\)\}/;
content = content.replace(regex4, `style={day.isOutsideYear && day.minutes === 0 ? { opacity: 0, pointerEvents: 'none' } : getIntensityInlineStyle(day.minutes, day.isOutsideYear, day.isFuture)}`);

const regex5 = /className=\{\`w-\[14px\] h-\[14px\] rounded-\[4px\] transition-all duration-300 relative group\/cell cursor-pointer \$\{\(day\.isOutsideYear \|\| day\.isBeforeAppExisted\) && day\.minutes === 0 \? 'pointer-events-none' : ''\}\`\}/;
content = content.replace(regex5, "className={`w-[14px] h-[14px] rounded-[4px] transition-all duration-300 relative group/cell cursor-pointer ${day.isOutsideYear ? 'opacity-30 pointer-events-none' : ''}`}");

fs.writeFileSync('src/components/Statistics.tsx', content);
