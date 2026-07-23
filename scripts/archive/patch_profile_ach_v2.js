import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const stateInsert = `
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [useThemeColorsForAch, setUseThemeColorsForAch] = useState(false);
`;

content = content.replace(/const \[selectedAchievement, setSelectedAchievement\] = useState<any>\(null\);/, stateInsert);

const oldSection = `      {/* Achievements System: Focus Odyssey */}
      <section className="space-y-8">
        <h3 className="text-xl font-black text-theme-text tracking-tight uppercase">Галлерея Достижений</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {ACHIEVEMENTS.map((ach) => {
            const progress = getAchievementProgress(ach);
            const isUnlocked = progress >= ach.max;
            const progressPercent = Math.min(100, (progress / ach.max) * 100);
            
            return (
              <motion.div 
                key={ach.id} 
                onClick={() => isUnlocked && setSelectedAchievement(ach)}
                whileHover={isUnlocked ? { scale: 1.05 } : {}}
                className={\`relative flex flex-col items-center p-4 bg-theme-card/30 border border-theme-border/30 rounded-3xl transition-all \${isUnlocked ? 'cursor-pointer hover:bg-theme-card hover:shadow-xl' : 'opacity-60 grayscale'}\`}
                style={isUnlocked ? { borderColor: ach.color, boxShadow: \`0 0 20px \${ach.color}15\` } : {}}
              >
                <div 
                  className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-[4px] bg-theme-bg flex items-center justify-center mb-4 transition-all"
                  style={{ borderColor: isUnlocked ? ach.color : 'var(--color-theme-border)' }}
                >
                  <img src={ach.img} alt={ach.title} className="w-full h-full object-cover scale-[1.35]" />
                </div>
                
                <div className="w-full text-center flex-1 flex flex-col">
                  <h4 className="font-bold text-theme-text text-sm mb-1">{ach.title}</h4>
                  <p className="text-[9px] text-theme-muted uppercase tracking-widest mb-3 flex-1">{ach.desc}</p>
                  
                  <div className="w-full mt-auto">
                    <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                      <span className="text-theme-muted">{isUnlocked ? 'Разблокировано' : 'Прогресс'}</span>
                      <span style={{ color: isUnlocked ? ach.color : 'var(--color-theme-text)' }}>
                        {isUnlocked ? '100%' : \`\${Math.floor(progressPercent)}%\`}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-theme-bg rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ 
                          width: \`\${progressPercent}%\`, 
                          backgroundColor: isUnlocked ? ach.color : 'var(--color-theme-text)' 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>`;

const newSection = `      {/* Achievements System: Focus Odyssey */}
      <section className="space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-theme-text tracking-tight uppercase">Галлерея Достижений</h3>
          <button 
            onClick={() => setUseThemeColorsForAch(!useThemeColorsForAch)}
            className={\`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border \${useThemeColorsForAch ? 'bg-theme-accent text-text-on-accent border-theme-accent' : 'bg-transparent text-theme-text border-theme-border hover:border-theme-accent'}\`}
          >
            Цвета под тему: {useThemeColorsForAch ? 'ВКЛ' : 'ОТКЛ'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {(showAllAchievements ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 4)).map((ach) => {
            const progress = getAchievementProgress(ach);
            const isUnlocked = progress >= ach.max;
            const progressPercent = Math.min(100, (progress / ach.max) * 100);
            
            const displayColor = useThemeColorsForAch ? 'var(--color-theme-accent)' : ach.color;

            return (
              <motion.div 
                key={ach.id} 
                onClick={() => isUnlocked && setSelectedAchievement({ ...ach, displayColor })}
                whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                className={\`relative flex flex-col items-center p-4 bg-theme-card/30 border rounded-3xl transition-all duration-500 \${isUnlocked ? 'cursor-pointer hover:bg-theme-card hover:shadow-xl' : 'opacity-80'}\`}
                style={isUnlocked ? { borderColor: displayColor, boxShadow: \`0 10px 30px -10px \${displayColor}40\` } : { borderColor: 'var(--color-theme-border)' }}
              >
                <div 
                  className={\`w-24 h-24 shrink-0 rounded-full overflow-hidden border-[4px] bg-theme-bg flex items-center justify-center mb-4 transition-all duration-500 relative \${!isUnlocked ? 'grayscale opacity-50' : ''}\`}
                  style={{ borderColor: isUnlocked ? displayColor : 'var(--color-theme-border)' }}
                >
                  <img src={ach.img} alt={ach.title} className="w-full h-full object-cover scale-[1.35]" />
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
          })}
        </div>
        
        {ACHIEVEMENTS.length > 4 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAllAchievements(!showAllAchievements)}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-theme-card border border-theme-border hover:border-theme-accent transition-all hover:shadow-lg"
            >
              <span className="text-xs font-black uppercase tracking-widest text-theme-text group-hover:text-theme-accent transition-colors">
                {showAllAchievements ? 'Скрыть часть' : 'Показать все достижения'}
              </span>
              <span className={\`material-symbols-outlined text-[18px] text-theme-text group-hover:text-theme-accent transition-all \${showAllAchievements ? 'rotate-180' : ''}\`}>
                expand_more
              </span>
            </button>
          </div>
        )}
      </section>`;

content = content.replace(oldSection, newSection);
fs.writeFileSync('src/components/Profile.tsx', content);

// Now patch AchievementAwardModal to use the provided color
let modalContent = fs.readFileSync('src/components/AchievementAwardModal.tsx', 'utf8');
// It already uses achievement.color, but since we passed { ...ach, displayColor } we should use displayColor
modalContent = modalContent.replace(/achievement\.color/g, '(achievement.displayColor || achievement.color)');
fs.writeFileSync('src/components/AchievementAwardModal.tsx', modalContent);

