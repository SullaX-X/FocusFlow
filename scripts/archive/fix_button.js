import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /\/\* Header controls \*\/\n      <div className="flex justify-end items-center mb-\[-1rem\] z-20 relative px-6">\n          <button \n            onClick=\{\(\) => setShowDemo\(!showDemo\)\}/;

const replacement = `/* Header controls */
      <div className="flex justify-end items-center mb-4 z-20 relative px-2">
          <button 
            onClick={() => setShowDemo(!showDemo)}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Statistics.tsx', content);
