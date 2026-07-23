import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "localStorage.setItem('focusmoon_inbox', JSON.stringify(mergedInbox));",
  "localStorage.setItem('focusmoon_inbox', typeof mergedInbox === 'string' ? mergedInbox : JSON.stringify(mergedInbox));"
);

fs.writeFileSync('src/App.tsx', content);
