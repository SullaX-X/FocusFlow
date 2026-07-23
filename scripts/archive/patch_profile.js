import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const achievementsSection = `
      {/* Achievements System: Focus Odyssey */}
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
                <span className="material-symbols-outlined text-3xl text-yellow-500">{ach.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-theme-text">{ach.title}</h4>
                  <span className="text-[10px] uppercase font-black text-yellow-500 tracking-wider">{ach.level}</span>
                </div>
                <p className="text-[11px] text-theme-muted uppercase tracking-widest mb-2">{ach.desc}</p>
                <div className="w-full h-1.5 bg-theme-bg rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: \`\${Math.min(100, (ach.progress / ach.max) * 100)}%\` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
`;

content = content.replace('{/* Stats Dashboard */}', achievementsSection + '\n      {/* Stats Dashboard */}');

fs.writeFileSync('src/components/Profile.tsx', content);
