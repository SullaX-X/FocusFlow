import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const oldS = `\${day.minutes} мин (\${day.sessionsCount} сессий)`;
const newS = `\${day.minutes} мин, сессий: \${day.sessionsCount}`;

content = content.replace(oldS, newS);
fs.writeFileSync('src/components/Statistics.tsx', content);
