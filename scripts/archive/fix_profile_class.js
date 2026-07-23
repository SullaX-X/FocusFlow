import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

content = content.replace(
  'transition-transform duration-500 will-change-transform',
  'transition-all duration-500 will-change-transform'
);

fs.writeFileSync('src/components/Profile.tsx', content);
