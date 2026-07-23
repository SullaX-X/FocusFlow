import fs from 'fs';
let content = fs.readFileSync('src/components/FocusMode.tsx', 'utf8');

// The best way to pass colors to confetti is just to use the computed style of --accent
content = content.replace(/colors: isDimoonBlue \? \['\#38bdf8', '\#ffffff'\] : \['\#fde047', '\#ffffff'\],/g, "colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fde047', '#ffffff'],");
content = content.replace(/isDimoonBlue \? '\#38bdf8' : \(isCyberPulse \? '\#ff2d78' : '\#FDE047'\)/g, "getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fde047'");
content = content.replace(/isDimoonBlue \? '\#38bdf8' : \(isCyberPulse \? '\#00ffcc' : '\#FDE047'\)/g, "getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fde047'");

fs.writeFileSync('src/components/FocusMode.tsx', content);
