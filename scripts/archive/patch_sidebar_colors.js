import fs from 'fs';
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(/const colors = isImanLove \? \['\#ff69b4', '\#fdf2f8'\] : \(actualTheme === 'dimoon-blue' \? \['\#38bdf8', '\#ffffff'\] : \['\#fde047', '\#ffffff'\]\);/, 
"const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fde047';\nconst colors = [accent, '#ffffff'];");

fs.writeFileSync('src/components/Sidebar.tsx', content);
