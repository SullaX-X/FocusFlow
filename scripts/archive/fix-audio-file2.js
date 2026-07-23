import fs from 'fs';
const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`\\\${baseUrl}\/\\`/g, "`${baseUrl}/`");
fs.writeFileSync(file, content);
