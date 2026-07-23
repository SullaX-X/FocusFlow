import fs from 'fs';
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/\$\{\$\{getComputedStyle\(document.documentElement\).getPropertyValue\('--accent'\).trim\(\) \|\| '#FDE047'\}\}/g, "${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FDE047'}");

fs.writeFileSync('src/components/Dashboard.tsx', content);
