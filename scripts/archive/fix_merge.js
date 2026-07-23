import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

content = content.replace(
  'if (!showDemo || hasActualSessions) {',
  'if (!showDemo) {'
);

fs.writeFileSync('src/components/Statistics.tsx', content);
