import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const startIndex = content.indexOf('{/* Header controls */}');
const endIndex = content.indexOf('{/* Star Map */}');

if (startIndex !== -1 && endIndex !== -1) {
    content = content.slice(0, startIndex) + content.slice(endIndex);
    fs.writeFileSync('src/components/Statistics.tsx', content);
    console.log('Removed top button.');
} else {
    console.log('Could not find indices', startIndex, endIndex);
}
