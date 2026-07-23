import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const targetStr = `                        onClick={() => isUnlocked && setSelectedAchievement({ ...ach, displayColor, isThemeTinted: true })}`;
const replacementStr = `                        onClick={() => setSelectedAchievement({ ...ach, displayColor, isThemeTinted: isUnlocked, isUnlocked, progress, progressPercent })}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/Profile.tsx', content);
console.log("Updated Profile.tsx");
