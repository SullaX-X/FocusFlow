import fs from 'fs';
let content = fs.readFileSync('src/components/Onboarding.tsx', 'utf8');

content = content.replace(/text-\[\#050714\]/g, 'text-text-on-accent');

fs.writeFileSync('src/components/Onboarding.tsx', content);
