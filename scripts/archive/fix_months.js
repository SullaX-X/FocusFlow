import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /if \(firstDay && firstDay\.month !== lastMonth && !firstDay\.isOutsideYear\) \{/g;
const replacement = `if (firstDay && firstDay.month !== lastMonth) {`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/Statistics.tsx', content);
