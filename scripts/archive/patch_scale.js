import fs from 'fs';
let contentProfile = fs.readFileSync('src/components/Profile.tsx', 'utf8');
contentProfile = contentProfile.replace(/scale-\[1.15\]/g, 'scale-[1.35]');
fs.writeFileSync('src/components/Profile.tsx', contentProfile);

let contentModal = fs.readFileSync('src/components/AchievementAwardModal.tsx', 'utf8');
contentModal = contentModal.replace(/scale-\[1.15\]/g, 'scale-[1.35]');
fs.writeFileSync('src/components/AchievementAwardModal.tsx', contentModal);
