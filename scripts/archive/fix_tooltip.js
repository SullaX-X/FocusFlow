import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const oldTooltip = `<div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-theme-card/95 backdrop-blur-2xl text-theme-text text-xs font-bold rounded-2xl border border-theme-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl transition-all scale-90 group-hover:scale-100 min-w-[200px]">
                              <p className="text-theme-muted text-[10px] uppercase mb-2 tracking-widest border-b border-theme-border/50 pb-1">{day.label}</p>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-theme-muted uppercase font-black">Время</span>
                                  <span className="text-sm font-mono text-theme-accent">{day.minutes} мин</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] text-theme-muted uppercase font-black">Сессии</span>
                                  <span className="text-sm font-mono">{day.sessionsCount}</span>
                                </div>
                              </div>
                              {day.isDeep && (
                                <div className="mt-2 text-[8px] text-theme-accent font-black uppercase tracking-widest flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">bolt</span>
                                  Глубокая работа
                                </div>
                              )}
                            </div>`;

const newTooltip = `<div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-theme-text text-theme-bg text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity flex flex-col items-center">
                              <span className="font-bold">{day.minutes > 0 ? \`\${day.minutes} мин (\${day.sessionsCount} сессий)\` : 'Нет активности'}</span>
                              <span className="opacity-70">{day.label}</span>
                            </div>`;

content = content.replace(oldTooltip, newTooltip);
fs.writeFileSync('src/components/Statistics.tsx', content);
