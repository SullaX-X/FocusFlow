import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'const fullData = { disciplines, stats, inbox: inboxData };',
  "const fullData = { disciplines, stats, inbox: inboxData, premium_status: localStorage.getItem('focusmoon_premium') === 'true' };"
);

fs.writeFileSync('src/App.tsx', content);

let settingsContent = fs.readFileSync('src/components/Settings.tsx', 'utf8');
settingsContent = settingsContent.replace(
  'const fullData = { disciplines, stats, inbox: inboxData };',
  "const fullData = { disciplines, stats, inbox: inboxData, premium_status: localStorage.getItem('focusmoon_premium') === 'true' };"
);
fs.writeFileSync('src/components/Settings.tsx', settingsContent);
