import fs from 'fs';
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/isDimoonBlue \? '\#38bdf8' : \(isCyberPulse \? '\#ff2d78' : '\#FDE047'\)/g, "${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FDE047'}");
content = content.replace(/isDimoonBlue \? '\#38bdf8' : \(isCyberPulse \? '\#00ffcc' : '\#FDE047'\)/g, "${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FDE047'}");

fs.writeFileSync('src/components/Dashboard.tsx', content);
