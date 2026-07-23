import fs from 'fs';
let modalContent = fs.readFileSync('src/components/AchievementAwardModal.tsx', 'utf8');
modalContent = modalContent.replace(
  'src={achievement.img}',
  'src={achievement.img}\n              loading="lazy"'
);
fs.writeFileSync('src/components/AchievementAwardModal.tsx', modalContent);
