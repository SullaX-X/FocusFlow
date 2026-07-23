import fs from 'fs';

let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

// Ensure RARITY_LABELS is imported
if (!content.includes('RARITY_LABELS')) {
  content = content.replace("import { ACHIEVEMENTS } from '../achievementsData';", "import { ACHIEVEMENTS, RARITY_LABELS } from '../achievementsData';");
}

// Remove useThemeColorsForAch state
content = content.replace(/const \[useThemeColorsForAch, setUseThemeColorsForAch\] = useState\(false\);\n/, '');

// Replace the Gallery header and buttons
const oldHeader = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-theme-text tracking-tight uppercase">Галлерея Достижений</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const randomAch = ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)];
                setSelectedAchievement({ ...randomAch, displayColor: useThemeColorsForAch ? 'var(--color-theme-accent)' : randomAch.color });
              }}
              className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-text-on-accent"
            >
              Демо анимации
            </button>
            <button 
              onClick={() => setUseThemeColorsForAch(!useThemeColorsForAch)}
              className={\`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border \${useThemeColorsForAch ? 'bg-theme-accent text-text-on-accent border-theme-accent' : 'bg-transparent text-theme-text border-theme-border hover:border-theme-accent'}\`}
            >
              Цвета: {useThemeColorsForAch ? 'ТЕМА' : 'ОРИГИНАЛ'}
            </button>
          </div>
        </div>`;

const newHeader = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-theme-text tracking-tight uppercase">Галлерея Достижений</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const randomAch = ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)];
                setSelectedAchievement({ ...randomAch, displayColor: randomAch.color });
              }}
              className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-text-on-accent"
            >
              Демо анимации
            </button>
          </div>
        </div>`;
content = content.replace(oldHeader, newHeader);

// Replace the loop logic
const oldLoop = `{(showAllAchievements ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 4)).map((ach) => {
            const progress = getAchievementProgress(ach);
            const isUnlocked = progress >= ach.max;
            const progressPercent = Math.min(100, (progress / ach.max) * 100);
            
            const displayColor = useThemeColorsForAch ? 'var(--color-theme-accent)' : ach.color;

            return (
              <motion.div 
                key={ach.id} 
                onClick={() => isUnlocked && setSelectedAchievement({ ...ach, displayColor, isThemeTinted: useThemeColorsForAch })}
                whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                className={\`relative flex flex-col items-center p-4 bg-theme-card/30 border rounded-3xl transition-all duration-500 \${isUnlocked ? 'cursor-pointer hover:bg-theme-card hover:shadow-xl' : 'opacity-80'}\`}
                style={isUnlocked ? { borderColor: displayColor, boxShadow: \`0 10px 30px -10px \${displayColor}40\` } : { borderColor: 'var(--color-theme-border)' }}
              >
                <div 
                  className={\`w-24 h-24 shrink-0 rounded-full overflow-hidden border-[4px] bg-theme-bg flex items-center justify-center mb-4 transition-all duration-500 relative \${!isUnlocked ? 'grayscale opacity-50' : ''}\`}
                  style={{ borderColor: isUnlocked ? displayColor : 'var(--color-theme-border)' }}
                >
                  <img src={ach.img} alt={ach.title} className="w-full h-full object-cover scale-[1.35]" />
                  {useThemeColorsForAch && isUnlocked && (
                    <div className="absolute inset-0 pointer-events-none mix-blend-color opacity-90" style={{ backgroundColor: displayColor }} />
                  )}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                      <span className="material-symbols-outlined text-3xl text-white">lock</span>
                    </div>
                  )}
                </div>
                
                <div className="w-full text-center flex-1 flex flex-col">
                  <h4 className={\`font-bold text-sm mb-1 \${!isUnlocked ? 'text-theme-muted' : 'text-theme-text'}\`}>{ach.title}</h4>
                  
                  {isUnlocked ? (
                    <p className="text-[9px] text-theme-muted uppercase tracking-widest mb-3 flex-1">{ach.desc}</p>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center mb-3">
                      <p className="text-[9px] text-theme-accent font-bold uppercase tracking-widest leading-tight">
                        Как получить:
                      </p>
                      <p className="text-[9px] text-theme-text uppercase tracking-widest opacity-80 mt-1">
                        {ach.desc}
                      </p>
                    </div>
                  )}
                  
                  <div className="w-full mt-auto">
                    <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                      <span className="text-theme-muted">{isUnlocked ? 'Разблокировано' : 'Прогресс'}</span>
                      <span style={{ color: isUnlocked ? displayColor : 'var(--color-theme-text)' }}>
                        {isUnlocked ? '100%' : \`\${Math.floor(progressPercent)}%\`}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-theme-bg rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ 
                          width: \`\${progressPercent}%\`, 
                          backgroundColor: isUnlocked ? displayColor : 'var(--color-theme-text)' 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}`;

const newLoop = `{(showAllAchievements ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 4)).map((ach) => {
            const progress = getAchievementProgress(ach);
            const isUnlocked = progress >= ach.max;
            const progressPercent = Math.min(100, (progress / ach.max) * 100);
            
            const displayColor = ach.color;
            const rarityLabel = RARITY_LABELS[ach.rarity] || ach.rarity;

            return (
              <motion.div 
                key={ach.id} 
                onClick={() => isUnlocked && setSelectedAchievement({ ...ach, displayColor, isThemeTinted: true })}
                whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                className={\`relative flex flex-col items-center p-4 bg-theme-card/30 border rounded-3xl transition-all duration-500 \${isUnlocked ? 'cursor-pointer hover:bg-theme-card hover:shadow-xl' : 'opacity-80'}\`}
                style={isUnlocked ? { borderColor: displayColor, boxShadow: \`0 10px 30px -10px \${displayColor}40\` } : { borderColor: 'var(--color-theme-border)' }}
              >
                <div 
                  className={\`w-24 h-24 shrink-0 rounded-full overflow-hidden border-[4px] bg-theme-bg flex items-center justify-center mb-3 transition-all duration-500 relative \${!isUnlocked ? 'grayscale opacity-50' : ''}\`}
                  style={{ borderColor: isUnlocked ? displayColor : 'var(--color-theme-border)' }}
                >
                  <img src={ach.img} alt={ach.title} className="w-full h-full object-cover scale-[1.35]" />
                  {isUnlocked && (
                    <div className="absolute inset-0 pointer-events-none mix-blend-color opacity-[0.85]" style={{ backgroundColor: displayColor }} />
                  )}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                      <span className="material-symbols-outlined text-3xl text-white">lock</span>
                    </div>
                  )}
                </div>
                
                <div className="w-full text-center flex-1 flex flex-col">
                  <h4 className={\`font-bold text-sm mb-1 \${!isUnlocked ? 'text-theme-muted' : 'text-theme-text'}\`}>{ach.title}</h4>
                  
                  {isUnlocked ? (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: displayColor }}>
                        {rarityLabel}
                      </span>
                      <p className="text-[9px] text-theme-muted uppercase tracking-widest mb-3 flex-1">{ach.desc}</p>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest mb-1 text-theme-muted">
                        {rarityLabel}
                      </span>
                      <p className="text-[9px] text-theme-accent font-bold uppercase tracking-widest leading-tight">
                        Как получить:
                      </p>
                      <p className="text-[9px] text-theme-text uppercase tracking-widest opacity-80 mt-1">
                        {ach.desc}
                      </p>
                    </div>
                  )}
                  
                  <div className="w-full mt-auto">
                    <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                      <span className="text-theme-muted">{isUnlocked ? 'Разблокировано' : 'Прогресс'}</span>
                      <span style={{ color: isUnlocked ? displayColor : 'var(--color-theme-text)' }}>
                        {isUnlocked ? '100%' : \`\${Math.floor(progressPercent)}%\`}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-theme-bg rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ 
                          width: \`\${progressPercent}%\`, 
                          backgroundColor: isUnlocked ? displayColor : 'var(--color-theme-text)' 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}`;

content = content.replace(oldLoop, newLoop);
fs.writeFileSync('src/components/Profile.tsx', content);

// Also remove `useThemeColorsForAch` from `AchievementAwardModal` logic if it applies, though `isThemeTinted` handles that.
let modalContent = fs.readFileSync('src/components/AchievementAwardModal.tsx', 'utf8');
if (!modalContent.includes('ach.rarity')) {
  // Let's also display rarity in the modal!
  modalContent = modalContent.replace(
    `<h2 className="text-sm font-black uppercase tracking-[0.3em] mb-2" style={{ color: achievement.color }}>`,
    `<h2 className="text-sm font-black uppercase tracking-[0.3em] mb-2" style={{ color: (achievement.displayColor || achievement.color) }}>`
  );
  
  // We need to also add rarity label.
  modalContent = modalContent.replace(
    `import { motion, AnimatePresence } from 'motion/react';`,
    `import { motion, AnimatePresence } from 'motion/react';\nimport { RARITY_LABELS } from '../achievementsData';`
  );

  modalContent = modalContent.replace(
    `<h1 className="text-4xl font-black text-theme-text mb-4 drop-shadow-lg">{achievement.title}</h1>`,
    `<h1 className="text-4xl font-black text-theme-text mb-2 drop-shadow-lg">{achievement.title}</h1>\n            <div className="px-3 py-1 rounded-full border-2 inline-block mb-4" style={{ borderColor: (achievement.displayColor || achievement.color), color: (achievement.displayColor || achievement.color) }}>\n              <span className="text-[10px] font-black uppercase tracking-widest">{RARITY_LABELS[achievement.rarity] || achievement.rarity} РЕДКОСТЬ</span>\n            </div>`
  );
  
  fs.writeFileSync('src/components/AchievementAwardModal.tsx', modalContent);
}

