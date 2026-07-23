import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'updateStats={updateStats}',
  'updateStats={(newStats: any) => setStats((prev: any) => ({ ...prev, ...newStats }))}'
);

fs.writeFileSync('src/App.tsx', content);
