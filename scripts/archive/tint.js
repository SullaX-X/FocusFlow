import fs from 'fs';

let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

content = content.replace(
  "onClick={() => isUnlocked && setSelectedAchievement({ ...ach, displayColor })}",
  "onClick={() => isUnlocked && setSelectedAchievement({ ...ach, displayColor, isThemeTinted: useThemeColorsForAch })}"
);

content = content.replace(
  '<img src={ach.img} alt={ach.title} className="w-full h-full object-cover scale-[1.35]" />',
  '<img src={ach.img} alt={ach.title} className="w-full h-full object-cover scale-[1.35]" />\n                  {useThemeColorsForAch && isUnlocked && (\n                    <div className="absolute inset-0 pointer-events-none mix-blend-color opacity-90" style={{ backgroundColor: displayColor }} />\n                  )}'
);

fs.writeFileSync('src/components/Profile.tsx', content);

let modalContent = fs.readFileSync('src/components/AchievementAwardModal.tsx', 'utf8');
modalContent = modalContent.replace(
  '<motion.img \n              src={achievement.img} \n              alt={achievement.title}\n              className="w-full h-full object-cover scale-[1.35]"\n              whileHover={{ scale: 1.25 }}\n              transition={{ duration: 0.4 }}\n            />',
  '<motion.img \n              src={achievement.img} \n              alt={achievement.title}\n              className="w-full h-full object-cover scale-[1.35]"\n              whileHover={{ scale: 1.25 }}\n              transition={{ duration: 0.4 }}\n            />\n            {achievement.isThemeTinted && (\n              <div className="absolute inset-0 pointer-events-none mix-blend-color opacity-90" style={{ backgroundColor: (achievement.displayColor || achievement.color) }} />\n            )}'
);
fs.writeFileSync('src/components/AchievementAwardModal.tsx', modalContent);
