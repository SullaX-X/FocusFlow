import fs from 'fs';
let content = fs.readFileSync('src/components/Onboarding.tsx', 'utf8');
content = content.replace(/const fadeIn = \{/g, 'const fadeIn: any = {');
content = content.replace(/const slideUp = \{/g, 'const slideUp: any = {');
fs.writeFileSync('src/components/Onboarding.tsx', content);
