import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

// Replace all hasActualSessions with hasActualData
content = content.replace(/hasActualSessions/g, 'hasActualData');

fs.writeFileSync('src/components/Statistics.tsx', content);
