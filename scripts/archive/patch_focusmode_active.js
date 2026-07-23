import fs from 'fs';
let content = fs.readFileSync('src/components/FocusMode.tsx', 'utf8');

const activeOld = `{sounds.filter(s => activeSounds[s.id]?.isPlaying).map(s => (
                                  <motion.div 
                                    layout
                                    key={s.id}
                                    className="bg-theme-card border border-theme-accent/20 rounded-xl p-3 flex flex-col gap-3 min-w-[280px] md:min-w-[320px] shadow-sm shrink-0"
                                  >
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-theme-accent/10 flex items-center justify-center text-theme-accent shrink-0">
                                          <span className="material-symbols-outlined text-sm">
                                            {s.category === 'Природа' ? 'forest' : s.category === 'Шумы' ? 'waves' : s.category === 'Музыка' ? 'piano' : 'graphic_eq'}
                                          </span>
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <p className="text-[11px] font-black text-theme-text truncate">{s.name}</p>
                                            <span className={\`text-[7px] px-1 py-0.25 rounded uppercase font-black tracking-tighter border \${s.category === 'Частоты' ? 'bg-theme-accent/10 text-theme-accent border-theme-accent/20' : 'bg-theme-muted/10 text-theme-muted border-theme-muted/20'}\`}>
                                              {s.category === 'Частоты' ? '[Сгенерировано]' : '[MP3]'}
                                            </span>
                                          </div>
                                          <p className="text-[8px] text-theme-muted uppercase font-bold tracking-wider">{s.category}</p>
                                        </div>
                                        {s.category === 'Частоты' && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-theme-accent/10 border border-theme-accent/20 text-theme-accent ml-1">
                                            <span className="material-symbols-outlined text-[10px]">warning</span>
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Caution</span>
                                          </div>
                                        )}
                                      </div>
                                      <button onClick={() => toggleSound(s.id)} className="p-1 text-theme-muted hover:text-red-500 transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                      </button>
                                    </div>`;

const activeNew = `{sounds.filter(s => activeSounds[s.id]?.isPlaying).map(s => {
                                  const isLocked = s.dustRequired && (stats?.focusDust || 0) < s.dustRequired;
                                  return (
                                  <motion.div 
                                    layout
                                    key={s.id}
                                    className={\`bg-theme-card border \${isLocked ? 'border-theme-muted/20 opacity-70 grayscale' : 'border-theme-accent/20'} rounded-xl p-3 flex flex-col gap-3 min-w-[280px] md:min-w-[320px] shadow-sm shrink-0\`}
                                  >
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={\`w-8 h-8 rounded-lg \${isLocked ? 'bg-theme-bg' : 'bg-theme-accent/10 text-theme-accent'} flex items-center justify-center shrink-0\`}>
                                          <span className="material-symbols-outlined text-sm">
                                            {isLocked ? 'lock' : (s.category === 'Природа' ? 'forest' : s.category === 'Шумы' ? 'waves' : s.category === 'Музыка' ? 'piano' : 'graphic_eq')}
                                          </span>
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <p className="text-[11px] font-black text-theme-text truncate">{s.name}</p>
                                            <span className={\`text-[7px] px-1 py-0.25 rounded uppercase font-black tracking-tighter border \${s.category === 'Частоты' ? 'bg-theme-accent/10 text-theme-accent border-theme-accent/20' : 'bg-theme-muted/10 text-theme-muted border-theme-muted/20'}\`}>
                                              {s.category === 'Частоты' ? '[Сгенерировано]' : '[MP3]'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <p className="text-[8px] text-theme-muted uppercase font-bold tracking-wider">{s.category}</p>
                                            {s.dustRequired && (
                                              <span className={\`text-[7px] font-bold px-1 py-0.5 rounded-sm \${isLocked ? 'bg-theme-accent/20 text-theme-accent' : 'bg-theme-text/10 text-theme-muted'}\`}>
                                                {s.dustRequired} ✨
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {s.category === 'Частоты' && !isLocked && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-theme-accent/10 border border-theme-accent/20 text-theme-accent ml-1">
                                            <span className="material-symbols-outlined text-[10px]">warning</span>
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Caution</span>
                                          </div>
                                        )}
                                      </div>
                                      <button onClick={() => {
                                        if (isLocked) {
                                          alert(\`Требуется \${s.dustRequired} ✨ звездной пыльцы\`);
                                          return;
                                        }
                                        toggleSound(s.id);
                                      }} className="p-1 text-theme-muted hover:text-red-500 transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-sm">{isLocked ? 'lock' : 'close'}</span>
                                      </button>
                                    </div>`;

content = content.replace(activeOld, activeNew);
fs.writeFileSync('src/components/FocusMode.tsx', content);

