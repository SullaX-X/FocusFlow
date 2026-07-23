import fs from 'fs';

const file = 'src/components/FocusMode.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `      {confirmSound && (
      <ConfirmModal
        onCancel={() => {
          if (confirmSound && activeSounds[confirmSound]?.isPlaying) {
            toggleSound(confirmSound);
          }
          setConfirmSound(null);
        }}
        onConfirm={() => {
          if (!confirmSound) return;
          const sound = sounds.find(s => s.id === confirmSound);
          if (sound && updateStats) {
             setPurchasingSound(sound.id);
             setTimeout(() => {
               updateStats({
                 focusDust: (stats?.focusDust || 0) - (sound.dustRequired || 0),
                 unlockedSounds: [...(stats?.unlockedSounds || []), sound.id]
               });
               setPurchasingSound(null);
               confetti({
                 particleCount: 100,
                 spread: 70,
                 origin: { y: 0.6 }
               });
             }, 800);
          }
          setConfirmSound(null);
        }}
        title="Покупка звука"
        message={confirmSound ? \`Купить звук "\${sounds.find(s => s.id === confirmSound)?.name}" за \${sounds.find(s => s.id === confirmSound)?.dustRequired} ✨?\` : ''}
      />
    )}`;

const replacement = `      {confirmSound && (() => {
        const sound = sounds.find(s => s.id === confirmSound);
        if (!sound) return null;
        
        const currentDust = stats?.focusDust || 0;
        const requiredDust = sound.dustRequired || 0;
        const hasEnough = currentDust >= requiredDust;
        
        return (
          <ConfirmModal
            onCancel={() => {
              if (confirmSound && activeSounds[confirmSound]?.isPlaying) {
                toggleSound(confirmSound);
              }
              setConfirmSound(null);
            }}
            onConfirm={() => {
              if (!hasEnough) {
                if (confirmSound && activeSounds[confirmSound]?.isPlaying) {
                  toggleSound(confirmSound);
                }
                setConfirmSound(null);
                return;
              }
              if (updateStats) {
                 setPurchasingSound(sound.id);
                 setTimeout(() => {
                   updateStats({
                     focusDust: currentDust - requiredDust,
                     unlockedSounds: [...(stats?.unlockedSounds || []), sound.id]
                   });
                   setPurchasingSound(null);
                   confetti({
                     particleCount: 100,
                     spread: 70,
                     origin: { y: 0.6 }
                   });
                 }, 800);
              }
              setConfirmSound(null);
            }}
            title={hasEnough ? "Покупка звука" : "Недостаточно пыльцы"}
            message={hasEnough 
              ? \`Купить звук "\${sound.name}" за \${requiredDust} ✨?\` 
              : \`Для покупки нужно \${requiredDust} ✨. У вас сейчас \${currentDust} ✨.\`}
            confirmText={hasEnough ? "Купить" : "Понятно"}
            hideCancel={!hasEnough}
          />
        );
      })()}
`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find target in FocusMode!");
}
