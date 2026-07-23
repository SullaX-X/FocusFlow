import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /for \(let i = 0; i < totalDays; i\+\+\) \{/;
const replacement = `for (let i = 0; i < totalDays; i++) {
      if (dDate > today) break;
      if (dDate.getFullYear() > currentYear && dDate.getDay() === 1) break; // stop if we entered next year and it's a Monday
`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Statistics.tsx', content);
