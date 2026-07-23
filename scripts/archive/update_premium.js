import fs from 'fs';

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Inject AccessManager if not present
  if (!content.includes('AccessManager')) {
    content = content.replace("import { useTheme } from '../ThemeContext';", "import { useTheme } from '../ThemeContext';\nimport { AccessManager } from '../AccessManager';");
  }

  // Inject isPremium check
  content = content.replace(
    'const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired && !(stats?.unlockedThemes || []).includes(t.id);',
    'const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired && !(stats?.unlockedThemes || []).includes(t.id) && !AccessManager.isPremium();'
  );
  content = content.replace(
    'const isLocked = sound.dustRequired && (stats?.focusDust || 0) < sound.dustRequired;',
    'const isLocked = sound.dustRequired && (stats?.focusDust || 0) < sound.dustRequired && !AccessManager.isPremium();'
  );

  fs.writeFileSync(file, content);
}

updateFile('src/components/Settings.tsx');
updateFile('src/components/UserMenu.tsx');
updateFile('src/components/CommandPalette.tsx');
// FocusMode might have different logic, let's check it separately.
