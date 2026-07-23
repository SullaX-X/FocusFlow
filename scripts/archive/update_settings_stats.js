import fs from 'fs';

let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');
content = content.replace('export default function Settings() {', 'export default function Settings({ stats = {} }: { stats?: any }) {');
fs.writeFileSync('src/components/Settings.tsx', content);

