import fs from 'fs';
let code = fs.readFileSync('src/components/FocusMode.tsx', 'utf8');

const target = `                              {sounds
                                .filter(s => selectedAudioCategory === "Все" || s.category === selectedAudioCategory)
                                .map(s => {
                                const isActive = activeSounds[s.id]?.isPlaying;
                                const isLocked = s.dustRequired && (stats?.focusDust || 0) < s.dustRequired && !AccessManager.isPremium();
                                return (
                                  <motion.button
                                    key={s.id}
                                    whileHover={!isLocked ? { y: -1 } : {}}
                                    whileTap={!isLocked ? { scale: 0.99 } : {}}
                                    onClick={() => {
                                      if (isLocked) {
                                        alert(\`Требуется \${s.dustRequired} ✨ звездной пыльцы\`);
                                        return;
                                      }
                                      toggleSound(s.id);
                                    }}
                                    className={\`group relative w-full p-2.5 sm:p-3.5 rounded-xl border transition-all flex items-center gap-3 text-left overflow-hidden \${isLocked ? 'opacity-50 grayscale cursor-not-allowed bg-theme-bg border-transparent' : (isActive ? 'bg-theme-accent border-theme-accent text-text-on-accent shadow-md' : 'bg-theme-card border-theme-border/50 hover:border-theme-accent text-theme-text hover:bg-theme-card-hover')}\`}
                                  >
                                    <div className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all shrink-0 \${isLocked ? 'bg-theme-bg/50' : (isActive ? 'bg-text-on-accent/10' : 'bg-theme-bg group-hover:bg-theme-accent/10')}\`}>
                                      <span className={\`material-symbols-outlined text-lg sm:text-xl transition-colors \${isLocked ? 'text-theme-muted' : (isActive ? 'text-text-on-accent' : 'text-theme-muted group-hover:text-theme-accent')}\`}>
                                        {isLocked ? 'lock' : (s.category === 'Природа' ? 'forest' : s.category === 'Шумы' ? 'waves' : s.category === 'Музыка' ? 'piano' : 'graphic_eq')}
                                      </span>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <p className="text-[11px] sm:text-xs font-black truncate tracking-tight">{s.name}</p>
                                        <span className={\`text-[7px] px-1 py-0.25 rounded uppercase font-black tracking-tighter border transition-colors \${isLocked ? 'bg-theme-muted/10 text-theme-muted border-theme-muted/20' : (isActive ? 'bg-text-on-accent/10 text-text-on-accent border-text-on-accent/20' : s.category === 'Частоты' ? 'bg-theme-accent/10 text-theme-accent border-theme-accent/20' : 'bg-theme-muted/10 text-theme-muted border-theme-muted/20')}\`}>
                                          {s.category === 'Частоты' ? '[Сгенерировано]' : '[MP3]'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <p className={\`text-[8px] font-bold uppercase tracking-wider \${isLocked ? 'text-theme-muted' : (isActive ? 'text-text-on-accent/70' : 'text-theme-muted')}\`}>
                                          {s.category}
                                        </p>
                                        {s.dustRequired && (
                                          <span className={\`text-[7px] font-bold px-1 py-0.5 rounded-sm \${isLocked ? 'bg-theme-accent/20 text-theme-accent' : (isActive ? 'bg-text-on-accent/20 text-text-on-accent' : 'bg-theme-text/10 text-theme-muted')}\`}>
                                            {s.dustRequired} ✨
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="shrink-0 flex items-center gap-2">
                                      {s.category === 'Частоты' && !isLocked && (
                                        <div className={\`flex items-center gap-1 px-1.5 py-0.5 rounded-md border transition-colors \${isActive ? 'bg-text-on-accent/10 border-text-on-accent/20 text-text-on-accent' : 'bg-theme-accent/10 border-theme-accent/20 text-theme-accent'}\`}>
                                          <span className="material-symbols-outlined text-[10px]">warning</span>
                                          <span className="text-[8px] font-black uppercase tracking-tighter">Caution</span>
                                        </div>
                                      )}
                                      {isActive && !isLocked && (
                                        <div className="flex gap-[1.5px] h-3 items-end mb-0.5">
                                          {[...Array(3)].map((_, i) => (
                                            <motion.div 
                                              key={i}
                                              animate={{ height: [\`\${30 + Math.random() * 70}%\`, \`\${10 + Math.random() * 40}%\`, \`\${50 + Math.random() * 50}%\`] }}
                                              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                                              className="w-0.5 bg-current rounded-full"
                                            />
                                          ))}
                                        </div>
                                      )}
                                      <span className="material-symbols-outlined text-lg opacity-50 group-hover:opacity-100 transition-opacity">
                                        {isActive ? 'pause_circle' : 'play_circle'}
                                      </span>
                                    </div>
                                  </motion.button>
                                );
                              })}`;

const replacement = `                              {sounds
                                .filter(s => selectedAudioCategory === "Все" || s.category === selectedAudioCategory)
                                .map(s => {
                                const isActive = activeSounds[s.id]?.isPlaying;
                                const isUnlocked = !s.dustRequired || AccessManager.isPremium() || (stats?.unlockedSounds || []).includes(s.id);
                                const isLocked = !isUnlocked;
                                return (
                                  <div
                                    key={s.id}
                                    className={\`group relative w-full p-2.5 sm:p-3.5 rounded-xl border transition-all duration-500 will-change-transform flex items-center gap-3 text-left overflow-hidden \${purchasingSound === s.id ? 'scale-105 opacity-80 border-theme-accent ring-2 ring-theme-accent/50 bg-theme-accent/5' : isLocked && purchasingSound !== s.id ? 'bg-theme-bg/50 border-transparent' : (isActive ? 'bg-theme-accent border-theme-accent text-text-on-accent shadow-md' : 'bg-theme-card border-theme-border/50 hover:border-theme-accent text-theme-text hover:bg-theme-card-hover')}\`}
                                  >
                                    <button
                                      onClick={() => toggleSound(s.id)}
                                      className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all shrink-0 \${isActive ? 'bg-text-on-accent/20 text-text-on-accent' : 'bg-theme-bg group-hover:bg-theme-accent/10 text-theme-muted group-hover:text-theme-accent'}\`}
                                      title={isLocked ? 'Прослушать демо' : 'Слушать'}
                                    >
                                      <span className="material-symbols-outlined text-lg sm:text-xl transition-colors">
                                        {isActive ? 'pause' : 'play_arrow'}
                                      </span>
                                    </button>
                                    
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isLocked && toggleSound(s.id)}>
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <p className="text-[11px] sm:text-xs font-black truncate tracking-tight">{s.name}</p>
                                        <span className={\`text-[7px] px-1 py-0.25 rounded uppercase font-black tracking-tighter border transition-colors \${isLocked ? 'bg-theme-muted/10 text-theme-muted border-theme-muted/20' : (isActive ? 'bg-text-on-accent/10 text-text-on-accent border-text-on-accent/20' : s.category === 'Частоты' ? 'bg-theme-accent/10 text-theme-accent border-theme-accent/20' : 'bg-theme-muted/10 text-theme-muted border-theme-muted/20')}\`}>
                                          {s.category === 'Частоты' ? '[Сгенерировано]' : '[MP3]'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <p className={\`text-[8px] font-bold uppercase tracking-wider \${isLocked ? 'text-theme-muted' : (isActive ? 'text-text-on-accent/70' : 'text-theme-muted')}\`}>
                                          {s.category}
                                        </p>
                                        {s.dustRequired && (
                                          <span className={\`text-[7px] font-bold px-1 py-0.5 rounded-sm \${isLocked ? 'bg-theme-accent/20 text-theme-accent' : (isActive ? 'bg-text-on-accent/20 text-text-on-accent' : 'bg-theme-text/10 text-theme-muted')}\`}>
                                            {s.dustRequired} ✨
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="shrink-0 flex items-center gap-2">
                                      {isLocked ? (
                                        <button 
                                          onClick={() => {
                                            if ((stats?.focusDust || 0) >= (s.dustRequired || 0)) {
                                              setConfirmSound(s.id);
                                            } else {
                                              alert(\`Недостаточно звездной пыли! Нужно еще \${(s.dustRequired || 0) - (stats?.focusDust || 0)} ✨\`);
                                            }
                                          }}
                                          className={\`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all \${
                                            (stats?.focusDust || 0) >= (s.dustRequired || 0)
                                              ? 'bg-theme-accent text-text-on-accent shadow-lg active:scale-95 hover:brightness-110' 
                                              : 'bg-theme-muted/20 text-theme-muted cursor-not-allowed'
                                          }\`}
                                        >
                                          Купить
                                        </button>
                                      ) : (
                                        <>
                                          {s.category === 'Частоты' && (
                                            <div className={\`flex items-center gap-1 px-1.5 py-0.5 rounded-md border transition-colors \${isActive ? 'bg-text-on-accent/10 border-text-on-accent/20 text-text-on-accent' : 'bg-theme-accent/10 border-theme-accent/20 text-theme-accent'}\`}>
                                              <span className="material-symbols-outlined text-[10px]">warning</span>
                                              <span className="text-[8px] font-black uppercase tracking-tighter">Caution</span>
                                            </div>
                                          )}
                                          {isActive && (
                                            <div className="flex gap-[1.5px] h-3 items-end mb-0.5">
                                              {[...Array(3)].map((_, i) => (
                                                <motion.div 
                                                  key={i}
                                                  animate={{ height: [\`\${30 + Math.random() * 70}%\`, \`\${10 + Math.random() * 40}%\`, \`\${50 + Math.random() * 50}%\`] }}
                                                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                                                  className="w-0.5 bg-current rounded-full"
                                                />
                                              ))}
                                            </div>
                                          )}
                                          <button onClick={() => toggleSound(s.id)}>
                                            <span className="material-symbols-outlined text-lg opacity-50 hover:opacity-100 transition-opacity">
                                              {isActive ? 'pause_circle' : 'play_circle'}
                                            </span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/FocusMode.tsx', code);
  console.log("Success!");
} else {
  console.log("Target not found!");
  const trimmedTarget = target.trim();
  if (code.includes(trimmedTarget)) {
     console.log("Found trimmed target!");
  } else {
     console.log("Still not found...");
  }
}
