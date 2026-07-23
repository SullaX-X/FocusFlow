import fs from 'fs';
let content = fs.readFileSync('src/components/UserMenu.tsx', 'utf8');

const oldRender = `{themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setIsOpen(false); }}
                    className={\`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-3 transition-colors \${theme === t.id ? 'bg-theme-accent/15 text-theme-accent font-semibold' : 'text-theme-text hover:bg-theme-bg'}\`}
                  >
                    <div className="w-4 h-4 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                        <path d="M 50 50 L 50 2 A 48 48 0 0 0 50 98 Z" fill={t.colors[0]} />
                        <path d="M 50 50 L 50 2 A 48 48 0 0 1 98 50 Z" fill={t.colors[1]} />
                        <path d="M 50 50 L 98 50 A 48 48 0 0 1 50 98 Z" fill={t.colors[2]} />
                        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                      </svg>
                    </div>
                    {t.name}
                  </button>
                ))}`;

const newRender = `{themes.map(t => {
                  const isLocked = t.dustRequired && (stats?.focusDust || 0) < t.dustRequired;
                  return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isLocked) {
                        alert(\`Требуется \${t.dustRequired} ✨ звездной пыльцы\`);
                        return;
                      }
                      setTheme(t.id); setIsOpen(false); 
                    }}
                    className={\`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-3 transition-colors \${isLocked ? 'opacity-50 grayscale cursor-not-allowed text-theme-muted' : (theme === t.id ? 'bg-theme-accent/15 text-theme-accent font-semibold' : 'text-theme-text hover:bg-theme-bg')}\`}
                  >
                    <div className="w-4 h-4 shrink-0">
                      {isLocked ? (
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                      ) : (
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                          <path d="M 50 50 L 50 2 A 48 48 0 0 0 50 98 Z" fill={t.colors[0]} />
                          <path d="M 50 50 L 50 2 A 48 48 0 0 1 98 50 Z" fill={t.colors[1]} />
                          <path d="M 50 50 L 98 50 A 48 48 0 0 1 50 98 Z" fill={t.colors[2]} />
                          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1">{t.name}</span>
                    {t.dustRequired && (
                      <span className="text-[9px] font-bold opacity-60 shrink-0">{t.dustRequired} ✨</span>
                    )}
                  </button>
                )
                })}`;

content = content.replace(oldRender, newRender);
fs.writeFileSync('src/components/UserMenu.tsx', content);

