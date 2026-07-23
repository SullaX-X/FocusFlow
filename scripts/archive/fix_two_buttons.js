import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /\/\* Header controls \*\/[\s\S]*?<\/div>\n\n      \/\* Star Map \*\//;

content = content.replace(regex, '/* Star Map */');
fs.writeFileSync('src/components/Statistics.tsx', content);
