import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');
content = content.replace(
  '<img src={ach.img} alt={ach.title} className="w-[135%] h-[135%] max-w-none flex-shrink-0 object-cover" />',
  '<img src={ach.img} alt={ach.title} loading="lazy" className="w-[135%] h-[135%] max-w-none flex-shrink-0 object-cover" />'
);
fs.writeFileSync('src/components/Profile.tsx', content);

try {
  let modalContent = fs.readFileSync('src/components/AchievementAwardModal.tsx', 'utf8');
  modalContent = modalContent.replace(
    '<img src={achievement.img} alt={achievement.title}',
    '<img src={achievement.img} alt={achievement.title} loading="lazy"'
  );
  fs.writeFileSync('src/components/AchievementAwardModal.tsx', modalContent);
} catch (e) {}
