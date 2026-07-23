import fs from 'fs';

let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const themeRenderOld = /{themes\.map\(\(t\) => \([\s\S]*?<\/button>\s*\)\)}/;

const themeRenderNew = `{themes.map((t) => {
            const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isLocked) {
                    alert(\`Требуется \${t.dustRequired} ✨ звездной пыльцы\`);
                    return;
                  }
                  setTheme(t.id);
                }}
                className={\`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group relative overflow-hidden \${
                  theme === t.id ? 'border-theme-accent bg-theme-accent/5' : 'border-theme-text/5 bg-theme-text/2 hover:border-theme-text/10'
                } \${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}\`}
              >
                <div className="relative w-12 h-12 group/theme-icon">
                  <div 
                    className="w-full h-full rounded-full border-2 border-theme-border/30 transition-transform group-hover/theme-icon:scale-110 shadow-sm"
                    style={{ 
                      background: \`conic-gradient(\${t.colors[1]} 0deg 90deg, \${t.colors[2]} 90deg 180deg, \${t.colors[0]} 180deg 360deg)\` 
                    }}
                  />
                  {theme === t.id && !isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-theme-accent text-text-on-accent p-1 rounded-full shadow-lg scale-110">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-theme-bg/80 text-theme-text p-1.5 rounded-full shadow-lg">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center relative z-10 flex flex-col items-center">
                  <div className="text-sm font-bold text-theme-text">{t.name}</div>
                  <div className="text-[10px] text-theme-muted mb-1">{t.desc}</div>
                  {t.dustRequired && (
                    <div className={\`text-[10px] font-bold flex items-center gap-1 \${isLocked ? 'text-theme-accent' : 'text-theme-muted'}\`}>
                      {t.dustRequired} ✨
                    </div>
                  )}
                </div>
              </button>
            );
          })}`;

content = content.replace(themeRenderOld, themeRenderNew);
fs.writeFileSync('src/components/Settings.tsx', content);

