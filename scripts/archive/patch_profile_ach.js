import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

// Insert imports
content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { ACHIEVEMENTS } from '../achievementsData';\nimport AchievementAwardModal from './AchievementAwardModal';");

// Insert modal state and calculations
const stateInsert = `
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  const getAchievementProgress = (ach: any) => {
    switch(ach.type) {
      case 'activeDays': return activeDays;
      case 'totalMinutes': return totalMinutes;
      case 'focusDust': return focusDust;
      default: return 0;
    }
  };
`;

content = content.replace("export default function Profile() {", "export default function Profile() {\n" + stateInsert);

const oldSection = `      {/* Achievements System: Focus Odyssey */}
      <section className="space-y-8">
        <h3 className="text-xl font-black text-theme-text tracking-tight uppercase">Focus Odyssey (Достижения)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Маленький Принц", desc: "Пыльца", level: "Bronze", progress: focusDust, max: 1000, icon: "local_florist" },
            { title: "Человек-Паук", desc: "Интенсивность", level: "Silver", progress: avgDaily, max: 120, icon: "spider" },
            { title: "Лило и Стич", desc: "Дни", level: "Gold", progress: activeDays, max: 30, icon: "pets" },
            { title: "Скорбь Сатаны", desc: "Время суток (Ночь)", level: "Platinum", progress: totalMinutes / 60, max: 100, icon: "dark_mode" },
            { title: "Конец Света", desc: "Прогресс", level: "Apex", progress: totalMinutes, max: 10000, icon: "public" },
          ].map((ach, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-theme-card/30 border border-theme-border/30 rounded-3xl hover:bg-theme-card transition-all">
              <div className="w-16 h-16 shrink-0 rounded-full border-2 border-yellow-500/50 bg-[#111] flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                {ach.icon === 'spider' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                    <path d="M12 2v20"/>
                    <path d="M2 12h20"/>
                    <path d="m4.9 4.9 14.2 14.2"/>
                    <path d="m4.9 19.1 14.2-14.2"/>
                    <path d="M12 6c-3.3 0-6 2.7-6 6"/>
                    <path d="M12 6c3.3 0 6 2.7 6 6"/>
                    <path d="M12 18c-3.3 0-6-2.7-6-6"/>
                    <path d="M12 18c3.3 0 6-2.7 6-6"/>
                    <path d="M12 9c-1.7 0-3 1.3-3 3"/>
                    <path d="M12 9c1.7 0 3 1.3 3 3"/>
                    <path d="M12 15c-1.7 0-3-1.3-3-3"/>
                    <path d="M12 15c1.7 0 3-1.3 3-3"/>
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-3xl text-yellow-500">{ach.icon}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-theme-text">{ach.title}</h4>
                  <span className="text-[10px] uppercase font-black text-yellow-500 tracking-wider">{ach.level}</span>
                </div>
                <p className="text-[11px] text-theme-muted uppercase tracking-widest mb-2">{ach.desc}</p>
                <div className="w-full h-1.5 bg-theme-bg rounded-full overflow-hidden">
                  <div className="h-full bg-theme-accent" style={{ width: \`\${Math.min(100, (ach.progress / ach.max) * 100)}%\` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>`;

const newSection = `      {/* Achievements System: Focus Odyssey */}
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
                  <img src={ach.img} alt={ach.title} className="w-full h-full object-cover scale-[1.15]" />
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

// Replace old with new
content = content.replace(oldSection, newSection);

// Add modal render
content = content.replace("    </div>\n  );\n}", "      {selectedAchievement && (\n        <AchievementAwardModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />\n      )}\n    </div>\n  );\n}");

fs.writeFileSync('src/components/Profile.tsx', content);
