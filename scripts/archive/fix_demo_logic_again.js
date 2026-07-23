import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /const \[demoToggle, setDemoToggle\] = useState\(false\);\n  const showDemo = demoToggle \|\| !hasActualData;/;
const replacement = `const [showDemo, setShowDemo] = useState(!hasActualData);`;
content = content.replace(regex, replacement);

const buttonRegex = /onClick=\{\(\) => setDemoToggle\(!demoToggle\)\}/;
content = content.replace(buttonRegex, 'onClick={() => setShowDemo(!showDemo)}');

fs.writeFileSync('src/components/Statistics.tsx', content);
