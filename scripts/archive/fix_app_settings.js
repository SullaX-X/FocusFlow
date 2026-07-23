import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "{activeTab === 'settings' && <Settings stats={stats} />}",
  "{activeTab === 'settings' && <Settings stats={stats} updateStats={updateStats} />}"
);

fs.writeFileSync('src/App.tsx', content);
