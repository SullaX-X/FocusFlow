import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("const { theme, setTheme, actualTheme, showBackgroundEffects, tabTimer } = useTheme();", 
"const { theme, setTheme, actualTheme, showBackgroundEffects, tabTimer } = useTheme();\n  const { newlyUnlocked, setNewlyUnlocked } = useAchievements(stats);");

fs.writeFileSync('src/App.tsx', content);
