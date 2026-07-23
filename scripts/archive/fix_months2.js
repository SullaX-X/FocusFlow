import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /weeks\.forEach\(\(week, index\) => \{\n      const firstDay = week\[0\];\n      if \(firstDay && firstDay\.month !== lastMonth\) \{/;
const replacement = `weeks.forEach((week, index) => {
      const validDay = week.find(d => !d.isOutsideYear) || week[0];
      if (validDay && validDay.month !== lastMonth && !validDay.isOutsideYear) {`;

content = content.replace(regex, replacement);
// Wait, I messed up the first regex replacement because it was missing !firstDay.isOutsideYear. Let's just do a more robust replace.

fs.writeFileSync('src/components/Statistics.tsx', content);
