import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /\/\* Header controls \*\/\n      <div className="flex justify-end items-center mb-4 z-20 relative px-2">\n          <button \n            onClick=\{\(\) => setShowDemo\(!showDemo\)\}\n            className=\{`px-4 py-2 rounded-xl font-black text-\[10px\] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 border \$\{\n              showDemo \n                 \? 'bg-theme-accent\/10 border-theme-accent\/20 text-theme-accent'\n                 : 'bg-theme-bg border-theme-border text-theme-muted hover:border-theme-accent\/30'\n            \}`\}\n          >\n            <span className="material-symbols-outlined text-lg">\n              \{showDemo \? 'visibility_off' : 'visibility'\}\n            <\/span>\n            <span className="hidden sm:inline">\{showDemo \? 'Скрыть демо' : 'Показать демо'\}<\/span>\n            <span className="sm:hidden">\{showDemo \? 'Демо' : 'Демо'\}<\/span>\n          <\/button>\n      <\/div>/;

content = content.replace(regex, '');

const starMapHeader = `<div className="mb-6 relative z-10">
          <h3 className="text-2xl md:text-3xl font-black text-theme-text uppercase tracking-tight font-display mb-2">Звездная Карта</h3>
          <p className="text-sm text-theme-muted font-medium opacity-60">Визуализация ваших сессий. Чем глубже фокус, тем ярче звезды.</p>
        </div>`;

const newStarMapHeader = `<div className="mb-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-theme-text uppercase tracking-tight font-display mb-2">Звездная Карта</h3>
            <p className="text-sm text-theme-muted font-medium opacity-60">Визуализация ваших сессий. Чем глубже фокус, тем ярче звезды.</p>
          </div>
          <button 
            onClick={() => setShowDemo(!showDemo)}
            className={\`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 border \${
              showDemo 
                 ? 'bg-theme-accent/10 border-theme-accent/20 text-theme-accent'
                 : 'bg-theme-bg border-theme-border text-theme-muted hover:border-theme-accent/30'
            }\`}
          >
            <span className="material-symbols-outlined text-lg">
              {showDemo ? 'visibility_off' : 'visibility'}
            </span>
            <span className="hidden sm:inline">{showDemo ? 'Скрыть демо' : 'Показать демо'}</span>
            <span className="sm:hidden">{showDemo ? 'Демо' : 'Демо'}</span>
          </button>
        </div>`;

content = content.replace(starMapHeader, newStarMapHeader);

fs.writeFileSync('src/components/Statistics.tsx', content);
