import fs from 'fs';

let content = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');

const oldRender = `                        const isFavorite = favoriteThemes.includes(t.id);
                        const colors = {
                          bg: t.colors[0],
                          card: t.colors[1],
                          accent: t.colors[2]
                        };
                        return (
                          <motion.button 
                            layout
                            key={t.id}
                            ref={el => itemRefs.current[index] = el}
                            onMouseEnter={() => { setSelectedIndex(index); setTheme(t.id); }}
                            onClick={() => {
                              setOriginalTheme(t.id);
                              setTheme(t.id);
                              onClose();
                            }}
                            className={\`w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between group transition-all relative \${isSelected ? 'bg-theme-accent/10' : 'hover:bg-theme-bg/50'}\`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={\`w-10 h-10 rounded-xl \${theme === t.id ? 'bg-theme-accent text-text-on-accent shadow-lg shadow-theme-accent/20' : 'bg-theme-bg text-theme-muted'} flex items-center justify-center transition-all\`}>
                                <span className="material-symbols-outlined text-[20px]">{theme === t.id ? 'check' : 'palette'}</span>
                              </div>
                              <div className={\`text-sm font-bold tracking-tight \${theme === t.id ? 'text-theme-accent' : 'text-theme-text'}\`}>
                                {highlightMatch(t.name, query)}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-5">
                              <div className={\`flex items-center gap-1.5 bg-theme-bg px-2.5 py-1.5 rounded-full border border-theme-border/50 shadow-inner transition-opacity \${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.bg }}></div>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.card }}></div>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.accent }}></div>
                              </div>
  
                              <div 
                                onClick={(e) => toggleFavoriteTheme(e, t.id)}
                                className={\`material-symbols-outlined text-[20px] hover:scale-125 active:scale-90 transition-all \${isFavorite ? 'text-yellow-400 fill-1' : \`text-theme-muted/30 hover:text-yellow-400 \${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}\`}
                                style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                star
                              </div>
                            </div>
                          </motion.button>
                        );`;

const newRender = `                        const isFavorite = favoriteThemes.includes(t.id);
                        const colors = {
                          bg: t.colors[0],
                          card: t.colors[1],
                          accent: t.colors[2]
                        };
                        const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired;
                        
                        return (
                          <motion.button 
                            layout
                            key={t.id}
                            ref={el => itemRefs.current[index] = el}
                            onMouseEnter={() => { 
                              setSelectedIndex(index); 
                              if (!isLocked) { setTheme(t.id); } else { setTheme(originalTheme); }
                            }}
                            onClick={() => {
                              if (isLocked) {
                                alert(\`Требуется \${t.dustRequired} ✨ звездной пыльцы\`);
                                return;
                              }
                              setOriginalTheme(t.id);
                              setTheme(t.id);
                              onClose();
                            }}
                            className={\`w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between group transition-all relative \${isSelected ? 'bg-theme-accent/10' : 'hover:bg-theme-bg/50'} \${isLocked ? 'opacity-60 grayscale' : ''}\`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={\`w-10 h-10 rounded-xl \${theme === t.id ? 'bg-theme-accent text-text-on-accent shadow-lg shadow-theme-accent/20' : 'bg-theme-bg text-theme-muted'} flex items-center justify-center transition-all\`}>
                                <span className="material-symbols-outlined text-[20px]">{isLocked ? 'lock' : (theme === t.id ? 'check' : 'palette')}</span>
                              </div>
                              <div className="flex flex-col">
                                <div className={\`text-sm font-bold tracking-tight \${theme === t.id && !isLocked ? 'text-theme-accent' : 'text-theme-text'}\`}>
                                  {highlightMatch(t.name, query)}
                                </div>
                                {t.dustRequired && (
                                  <div className={\`text-[10px] font-bold flex items-center gap-1 \${isLocked ? 'text-theme-accent' : 'text-theme-muted'}\`}>
                                    {t.dustRequired} ✨
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-5">
                              <div className={\`flex items-center gap-1.5 bg-theme-bg px-2.5 py-1.5 rounded-full border border-theme-border/50 shadow-inner transition-opacity \${isSelected || isLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.bg }}></div>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.card }}></div>
                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: colors.accent }}></div>
                              </div>
  
                              <div 
                                onClick={(e) => {
                                  if (!isLocked) toggleFavoriteTheme(e, t.id);
                                  else e.stopPropagation();
                                }}
                                className={\`material-symbols-outlined text-[20px] hover:scale-125 active:scale-90 transition-all \${isLocked ? 'cursor-not-allowed opacity-30' : (isFavorite ? 'text-yellow-400 fill-1' : \`text-theme-muted/30 hover:text-yellow-400 \${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`)}\`}
                                style={{ fontVariationSettings: isFavorite && !isLocked ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                star
                              </div>
                            </div>
                          </motion.button>
                        );`;
                        
content = content.replace(oldRender, newRender);
fs.writeFileSync('src/components/CommandPalette.tsx', content);

