import fs from 'fs';
const file = 'src/components/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if ((stats?.focusDust || 0) >= (sound.dustRequired || 0)) {
                            setConfirmSound(sound.id);
                          } else {
                            alert(\`Недостаточно звездной пыли! Нужно еще \${(sound.dustRequired || 0) - (stats?.focusDust || 0)} ✨\`);
                          }
                        }}`;

const replace1 = `                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmSound(sound.id);
                        }}`;

if (content.includes(target1)) {
  content = content.replace(target1, replace1);
  fs.writeFileSync(file, content);
  console.log("Fixed settings alert.");
} else {
  console.log("Could not find target1.");
}
