import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /const validDay = week\.find\(d => !d\.isOutsideYear\) \|\| week\[0\];\n      if \(validDay && validDay\.month !== lastMonth && !validDay\.isOutsideYear\) \{\n        labels\.push\(\{\n          index,\n          label: monthNames\[firstDay\.month\]\n        \}\);\n        lastMonth = firstDay\.month;\n      \}/;
const replacement = `const validDay = week.find(d => !d.isOutsideYear) || week[0];
      if (validDay && validDay.month !== lastMonth && !validDay.isOutsideYear) {
        labels.push({
          index,
          label: monthNames[validDay.month]
        });
        lastMonth = validDay.month;
      }`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/Statistics.tsx', content);
