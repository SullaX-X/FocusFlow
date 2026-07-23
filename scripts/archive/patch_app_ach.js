import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("import Inbox from './components/Inbox';", "import Inbox from './components/Inbox';\nimport AchievementAwardModal from './components/AchievementAwardModal';\nimport { useAchievements } from './useAchievements';");

const stateInsertion = `  const { actualTheme } = useTheme();\n  const { newlyUnlocked, setNewlyUnlocked } = useAchievements(stats);`;

content = content.replace("  const { actualTheme } = useTheme();", stateInsertion);

const modalInsertion = `
      <AnimatePresence>
        {newlyUnlocked && (
          <AchievementAwardModal achievement={newlyUnlocked} onClose={() => setNewlyUnlocked(null)} />
        )}
      </AnimatePresence>
`;

content = content.replace("      <Inbox isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} />", "      <Inbox isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} />" + modalInsertion);

fs.writeFileSync('src/App.tsx', content);
