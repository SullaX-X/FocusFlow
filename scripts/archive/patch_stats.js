import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

content = content.replace("style.getPropertyValue('--color-theme-accent').trim() || '#2563eb'", "style.getPropertyValue('--accent').trim() || '#2563eb'");
content = content.replace("style.getPropertyValue('--color-theme-muted').trim() || '#94a3b8'", "style.getPropertyValue('--text-muted').trim() || '#94a3b8'");
content = content.replace("style.getPropertyValue('--color-theme-card').trim() || '#ffffff'", "style.getPropertyValue('--card').trim() || '#ffffff'");
content = content.replace("style.getPropertyValue('--color-theme-border').trim() || '#e2e8f0'", "style.getPropertyValue('--border').trim() || '#e2e8f0'");

fs.writeFileSync('src/components/Statistics.tsx', content);
