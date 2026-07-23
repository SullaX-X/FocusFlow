import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

content = content.replace(
  'scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;',
  'setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth; }, 100);'
);

fs.writeFileSync('src/components/Statistics.tsx', content);
