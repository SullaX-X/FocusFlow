import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

// Fix the promo code text
content = content.replace(
  '<h3 className="text-xl font-black text-theme-text uppercase tracking-tight font-display mb-4">Секретный доступ</h3>',
  '<h3 className="text-xl font-black text-theme-text uppercase tracking-tight font-display mb-4">Ключ Экосистемы</h3>'
);

content = content.replace(
  'placeholder="Введите промокод (например: Ima_Iman)"',
  'placeholder="Введите код доступа..."'
);

// Fix the hover overlay glitch
content = content.replace(
  'className="absolute inset-0 bg-theme-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20"',
  'className={`absolute inset-0 bg-theme-card/80 backdrop-blur-sm transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20 ${isPreviewing ? \'opacity-100\' : \'opacity-0 group-hover:opacity-100\'}`}'
);

fs.writeFileSync('src/components/Profile.tsx', content);
