import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const newIcon = `<span className="text-3xl leading-none" role="img" aria-label="spider">🕷️</span>`;

content = content.replace(/<svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30" className="text-yellow-500">[\s\S]*?<\/svg>/, newIcon);

fs.writeFileSync('src/components/Profile.tsx', content);
