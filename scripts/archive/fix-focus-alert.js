import fs from 'fs';
const file = 'src/components/FocusMode.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                                      <button onClick={() => {
                                        if (isLocked) {
                                          alert(\`Требуется \${s.dustRequired} ✨ звездной пыльцы\`);
                                          return;
                                        }
                                        toggleSound(s.id);
                                      }} className="p-1 text-theme-muted hover:text-red-500 transition-colors shrink-0">`;

const replacement = `                                      <button onClick={() => {
                                        if (isLocked) {
                                          setConfirmSound(s.id);
                                          return;
                                        }
                                        toggleSound(s.id);
                                      }} className="p-1 text-theme-muted hover:text-red-500 transition-colors shrink-0">`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Fixed alert in FocusMode.");
} else {
  console.log("Could not find target in FocusMode.");
}
