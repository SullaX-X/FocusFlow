import fs from 'fs';
const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/const normalizedBase = baseUrl\.endsWith\('\/'\) \? baseUrl : .*?;/, "const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;");
fs.writeFileSync(file, content);
