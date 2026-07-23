import fs from 'fs';
let content = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');

content = content.replace(
  'const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired && !(stats?.unlockedThemes || []).includes(t.id);',
  'const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired && !(stats?.unlockedThemes || []).includes(t.id) && !AccessManager.isPremium();'
);

fs.writeFileSync('src/components/CommandPalette.tsx', content);
