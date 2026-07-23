import fs from 'fs';

const files = ['src/components/FocusMode.tsx', 'src/components/Settings.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix FocusMode isLocked in active sounds
  if (file.includes('FocusMode')) {
    content = content.replace(
      /const isLocked = s\.dustRequired && \(stats\?\.focusDust \|\| 0\) < s\.dustRequired && !AccessManager\.isPremium\(\);/g,
      `const isUnlocked = !s.dustRequired || AccessManager.isPremium() || (stats?.unlockedSounds || []).includes(s.id);
                                  const isLocked = !isUnlocked;`
    );
  }
  
  // Fix dustRequired display
  // We want to replace `{s.dustRequired && (` with `{isLocked && s.dustRequired && (` 
  // Wait, in FocusMode it might be `s.dustRequired` and in Settings it might be `sound.dustRequired`.
  
  content = content.replace(/\{s\.dustRequired && \(/g, "{isLocked && s.dustRequired && (");
  content = content.replace(/\{sound\.dustRequired && \(/g, "{isLocked && sound.dustRequired && (");
  content = content.replace(/\{t\.dustRequired && \(/g, "{isLocked && t.dustRequired && ("); // For themes as well
  
  fs.writeFileSync(file, content);
}

console.log("Prices hidden when unlocked, and isLocked logic fixed.");
