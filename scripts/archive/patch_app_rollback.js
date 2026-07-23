import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "// Rollback\n          isRollingBack.current = true;\n          setDisciplines(previousDisciplines.current);",
  "// We don't rollback anymore because it's queued offline"
);

fs.writeFileSync('src/App.tsx', content);
