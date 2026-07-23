import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  '<CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} disciplines={disciplines} onQuickFocus={() => handleStartFocus(\'free\')} initialMode={commandPaletteMode} />',
  '<CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} disciplines={disciplines} onQuickFocus={() => handleStartFocus(\'free\')} initialMode={commandPaletteMode} stats={stats} />'
);
fs.writeFileSync('src/App.tsx', appContent);

let cpContent = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');
cpContent = cpContent.replace(
  'export default function CommandPalette({ isOpen, onClose, disciplines, onQuickFocus, initialMode = \'root\' }: { isOpen: boolean; onClose: () => void, disciplines: Discipline[], onQuickFocus: () => void, initialMode?: \'root\' | \'themes\' }) {',
  'export default function CommandPalette({ isOpen, onClose, disciplines, onQuickFocus, initialMode = \'root\', stats = {} }: { isOpen: boolean; onClose: () => void, disciplines: Discipline[], onQuickFocus: () => void, initialMode?: \'root\' | \'themes\', stats?: any }) {'
);

const themeRenderOld = `                        const isFavorite = favoriteThemes.includes(t.id);
                        const colors = {
                          bg: t.colors[0],
                          card: t.colors[1],
                          accent: t.colors[2]
                        };
                        return (
                          <button
                            key={t.id}
                            ref={el => itemRefs.current[index] = el}
                            onClick={() => { setOriginalTheme(t.id); setTheme(t.id); onClose(); }}`;

const themeRenderNew = `                        const isFavorite = favoriteThemes.includes(t.id);
                        const colors = {
                          bg: t.colors[0],
                          card: t.colors[1],
                          accent: t.colors[2]
                        };
                        const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired;
                        return (
                          <button
                            key={t.id}
                            ref={el => itemRefs.current[index] = el}
                            onClick={() => {
                              if (isLocked) {
                                alert(\`Требуется \${t.dustRequired} ✨ звездной пыльцы\`);
                                return;
                              }
                              setOriginalTheme(t.id); setTheme(t.id); onClose(); 
                            }}`;

cpContent = cpContent.replace(themeRenderOld, themeRenderNew);

// Disable preview for locked themes
const previewOld = `    if (mode === 'themes' && currentItems.length > 0) {
      const activeTheme = currentItems[selectedIndex] as any;
      if (activeTheme && typeof activeTheme === 'object' && 'id' in activeTheme) {
        setTheme(activeTheme.id);
      }
    }`;

const previewNew = `    if (mode === 'themes' && currentItems.length > 0) {
      const activeTheme = currentItems[selectedIndex] as any;
      if (activeTheme && typeof activeTheme === 'object' && 'id' in activeTheme) {
        const isLocked = activeTheme.dustRequired && (stats?.focusDust || 0) < activeTheme.dustRequired;
        if (!isLocked) {
          setTheme(activeTheme.id);
        } else {
          setTheme(originalTheme);
        }
      }
    }`;
cpContent = cpContent.replace(previewOld, previewNew);

// Enter key logic
const enterOld = `      if (mode === 'themes') {
        const t = selected as any;
        setOriginalTheme(t.id);
        setTheme(t.id);
        onClose();
      }`;

const enterNew = `      if (mode === 'themes') {
        const t = selected as any;
        const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired;
        if (isLocked) {
          alert(\`Требуется \${t.dustRequired} ✨ звездной пыльцы\`);
          return;
        }
        setOriginalTheme(t.id);
        setTheme(t.id);
        onClose();
      }`;
cpContent = cpContent.replace(enterOld, enterNew);

// Add lock icon / dust display
const contentRenderOld = `                            <div className="flex items-center gap-3 w-full">
                              <div 
                                className="w-10 h-10 rounded-full border shadow-sm shrink-0 relative flex items-center justify-center overflow-hidden"
                                style={{ borderColor: 'var(--color-theme-border)' }}
                              >
                                <div 
                                  className="absolute inset-0 opacity-20"
                                  style={{ background: colors.bg }}
                                />
                                <div 
                                  className="w-full h-full rounded-full"
                                  style={{ 
                                    background: \`conic-gradient(\${colors.card} 0deg 90deg, \${colors.accent} 90deg 180deg, \${colors.bg} 180deg 360deg)\` 
                                  }}
                                />
                              </div>
                              <div className="flex flex-col items-start flex-1 text-left">
                                <span className="font-bold text-sm text-theme-text">{t.name}</span>
                                <span className="text-[10px] text-theme-muted uppercase tracking-widest">{t.desc}</span>
                              </div>
                              
                              <div 
                                onClick={(e) => toggleFavoriteTheme(e, t.id)}
                                className={\`p-2 rounded-full transition-colors \${isFavorite ? 'text-theme-accent' : 'text-theme-muted hover:text-theme-text'}\`}
                              >
                                <span className={\`material-symbols-outlined text-[18px] \${isFavorite ? 'fill-current' : ''}\`}>
                                  star
                                </span>
                              </div>
                            </div>
                          </button>`;

const contentRenderNew = `                            <div className="flex items-center gap-3 w-full">
                              <div 
                                className={\`w-10 h-10 rounded-full border shadow-sm shrink-0 relative flex items-center justify-center overflow-hidden \${isLocked ? 'grayscale' : ''}\`}
                                style={{ borderColor: 'var(--color-theme-border)' }}
                              >
                                <div 
                                  className="absolute inset-0 opacity-20"
                                  style={{ background: colors.bg }}
                                />
                                <div 
                                  className="w-full h-full rounded-full"
                                  style={{ 
                                    background: \`conic-gradient(\${colors.card} 0deg 90deg, \${colors.accent} 90deg 180deg, \${colors.bg} 180deg 360deg)\` 
                                  }}
                                />
                                {isLocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <span className="material-symbols-outlined text-[14px] text-white">lock</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-start flex-1 text-left">
                                <span className={\`font-bold text-sm \${isLocked ? 'text-theme-muted' : 'text-theme-text'}\`}>{t.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-theme-muted uppercase tracking-widest">{t.desc}</span>
                                  {t.dustRequired && (
                                    <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded-full \${isLocked ? 'bg-theme-accent/10 text-theme-accent' : 'bg-theme-text/10 text-theme-muted'}\`}>
                                      {t.dustRequired} ✨
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div 
                                onClick={(e) => {
                                  if (!isLocked) {
                                    toggleFavoriteTheme(e, t.id);
                                  } else {
                                    e.stopPropagation();
                                  }
                                }}
                                className={\`p-2 rounded-full transition-colors \${isLocked ? 'opacity-50 cursor-not-allowed text-theme-muted' : (isFavorite ? 'text-theme-accent' : 'text-theme-muted hover:text-theme-text')}\`}
                              >
                                <span className={\`material-symbols-outlined text-[18px] \${isFavorite ? 'fill-current' : ''}\`}>
                                  star
                                </span>
                              </div>
                            </div>
                          </button>`;

cpContent = cpContent.replace(contentRenderOld, contentRenderNew);
fs.writeFileSync('src/components/CommandPalette.tsx', cpContent);

