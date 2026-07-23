import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

content = content.replace(
  'mb-[-1rem] z-20 relative px-6',
  'mb-4 z-20 relative px-2'
);

fs.writeFileSync('src/components/Statistics.tsx', content);
