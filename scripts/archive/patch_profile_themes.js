import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const oldRender = `{themes.map((t, idx) => (
             <motion.button 
               key={t.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               onClick={() => setTheme(t.id as any)}
               className={\`group relative flex flex-col rounded-2xl border transition-all duration-300 bg-theme-card/30 \${
                 theme === t.id 
                   ? 'border-theme-accent ring-2 ring-theme-accent/10 shadow-lg shadow-theme-accent/5' 
                   : 'border-theme-border/50 hover:border-theme-accent/30'
               }\`}
             >
               <div className="aspect-video p-2 flex flex-col relative">
                 <div className="theme-card-preview relative flex-1 mb-2">
                    <div className="theme-card-section theme-card-section-bg" style={{ backgroundColor: t.colors[0] }} />
                    <div className="theme-card-section theme-card-section-panel" style={{ backgroundColor: t.colors[1] }} />
                    <div className="theme-card-section theme-card-section-accent" style={{ backgroundColor: t.colors[2] }} />
                    
                    {theme === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-theme-accent text-text-on-accent p-1 rounded-full shadow-xl scale-125 border-2 border-theme-bg">
                          <span className="material-symbols-outlined text-[16px] font-black">check</span>
                        </div>
                      </div>
                    )}
                 </div>
               </div>
               
               <div className="p-4 pt-1 flex flex-col items-start w-full relative z-10 border-t border-theme-border/10 bg-theme-bg/20 rounded-b-2xl">
                 <div className="text-sm font-black text-theme-text text-left group-hover:text-theme-accent transition-colors">
                   {t.name}
                 </div>
                 <div className="text-[9px] uppercase tracking-widest text-theme-muted font-bold mt-1 text-left opacity-80">
                   {t.desc}
                 </div>
               </div>
             </motion.button>
          ))}`;

const newRender = `{themes.map((t, idx) => {
            const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired;
            return (
             <motion.button 
               key={t.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               onClick={() => {
                 if (isLocked) {
                   alert(\`Требуется \${t.dustRequired} ✨ звездной пыльцы\`);
                   return;
                 }
                 setTheme(t.id as any);
               }}
               className={\`group relative flex flex-col rounded-2xl border transition-all duration-300 bg-theme-card/30 \${
                 isLocked ? 'opacity-60 grayscale cursor-not-allowed' : (
                   theme === t.id 
                     ? 'border-theme-accent ring-2 ring-theme-accent/10 shadow-lg shadow-theme-accent/5' 
                     : 'border-theme-border/50 hover:border-theme-accent/30'
                 )
               }\`}
             >
               <div className="aspect-video p-2 flex flex-col relative">
                 <div className="theme-card-preview relative flex-1 mb-2">
                    <div className="theme-card-section theme-card-section-bg" style={{ backgroundColor: t.colors[0] }} />
                    <div className="theme-card-section theme-card-section-panel" style={{ backgroundColor: t.colors[1] }} />
                    <div className="theme-card-section theme-card-section-accent" style={{ backgroundColor: t.colors[2] }} />
                    
                    {theme === t.id && !isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-theme-accent text-text-on-accent p-1 rounded-full shadow-xl scale-125 border-2 border-theme-bg">
                          <span className="material-symbols-outlined text-[16px] font-black">check</span>
                        </div>
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-black/50 text-white p-2 rounded-full shadow-xl scale-110 border-2 border-white/20">
                          <span className="material-symbols-outlined text-[16px] font-black">lock</span>
                        </div>
                      </div>
                    )}
                 </div>
               </div>
               
               <div className="p-4 pt-1 flex flex-col items-start w-full relative z-10 border-t border-theme-border/10 bg-theme-bg/20 rounded-b-2xl">
                 <div className="text-sm font-black text-theme-text text-left group-hover:text-theme-accent transition-colors flex justify-between items-center w-full">
                   <span>{t.name}</span>
                   {t.dustRequired && (
                     <span className="text-[10px] text-theme-accent bg-theme-accent/10 px-1.5 py-0.5 rounded-full">{t.dustRequired} ✨</span>
                   )}
                 </div>
                 <div className="text-[9px] uppercase tracking-widest text-theme-muted font-bold mt-1 text-left opacity-80">
                   {t.desc}
                 </div>
               </div>
             </motion.button>
          )
          })}`;

content = content.replace(oldRender, newRender);
fs.writeFileSync('src/components/Profile.tsx', content);

