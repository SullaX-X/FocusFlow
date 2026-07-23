import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /const hasActualData = originalSessions.length > 0 \|\| hasLegacyData;/;
const replacement = `const hasActualData = originalSessions.length > 0 || hasLegacyData;
  const [demoToggle, setDemoToggle] = useState(false);
  const showDemo = demoToggle || !hasActualData;`;

content = content.replace(regex, replacement);

const regex2 = /const \[showDemo, setShowDemo\] = useState\(!hasActualData\);/;
content = content.replace(regex2, '');

const regex3 = /useEffect\(\(\) => \{\n    if \(hasActualData && !showDemo\) \{\n      \/\/ Just ensure it's false initially if they have data\n    \}\n  \}, \[hasActualData\]\);/;
content = content.replace(regex3, '');

const regex4 = /onClick=\{.*?setShowDemo\(!showDemo\).*?\}/;
content = content.replace(regex4, 'onClick={() => setDemoToggle(!demoToggle)}');

fs.writeFileSync('src/components/Statistics.tsx', content);
