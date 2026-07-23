import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /const \[showDemo, setShowDemo\] = useState\(!hasActualData\);/;
const replacement = `const [showDemo, setShowDemo] = useState(false);`;
content = content.replace(regex, replacement);

fs.writeFileSync('src/components/Statistics.tsx', content);
