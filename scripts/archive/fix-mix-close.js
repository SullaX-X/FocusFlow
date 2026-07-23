import fs from 'fs';

const file = 'src/components/FocusMode.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `{isLocked ? 'lock' : 'close'}`;
const replacement = `{isLocked ? 'lock' : 'stop'}`;

content = content.replace(target, replacement);

const target2 = `                                      <span className="material-symbols-outlined text-lg sm:text-xl transition-colors">
                                        {isLocked ? 'lock' : (isActive ? 'pause' : 'play_arrow')}
                                      </span>`;

const replacement2 = `                                      <span className="material-symbols-outlined text-lg sm:text-xl transition-colors">
                                        {isLocked ? 'lock' : (isActive ? 'stop' : 'play_arrow')}
                                      </span>`;
content = content.replace(target2, replacement2);

fs.writeFileSync(file, content);
console.log("Mix close icon updated to stop.");
