import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const replacement = `                    ) : (
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => isPreviewing ? setPreviewTheme(null) : setPreviewTheme(t.id as any)}
                          className={\`flex-1 py-1.5 rounded-lg border text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-colors \${isPreviewing ? 'bg-theme-accent/20 border-theme-accent text-theme-accent' : 'bg-theme-bg/50 border-theme-border hover:border-theme-accent'}\`}
                        >
                          {isPreviewing ? 'Отменить' : 'Обзор'}
                        </button>
                        <button 
                          onClick={() => setTheme(t.id as any)}
                          className="flex-1 py-1.5 rounded-lg bg-theme-accent text-text-on-accent text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95"
                        >
                          Применить
                        </button>
                      </div>
                    )}`;

content = content.replace(
  /\) : \(\n\s*<button \n\s*onClick=\{\(\) => setTheme\(t\.id as any\)\}\n\s*className="w-full py-2 rounded-lg bg-theme-accent text-text-on-accent text-\[10px\] font-black uppercase tracking-widest shadow-lg active:scale-95"\n\s*>\n\s*Применить\n\s*<\/button>\n\s*\)\}/,
  replacement
);

fs.writeFileSync('src/components/Profile.tsx', content);
