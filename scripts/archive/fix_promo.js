import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const promoUI = `
      {/* PROMO CODE SECTION */}
      <section className="glass-panel p-6 rounded-3xl border border-theme-border mt-8 mb-8">
        <h3 className="text-xl font-black text-theme-text uppercase tracking-tight font-display mb-4">Секретный доступ</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="text" 
            placeholder="Введите промокод (например: Ima_Iman)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 bg-theme-bg/30 backdrop-blur-md border border-theme-border/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)] text-theme-text px-4 py-3 rounded-2xl outline-none focus:border-theme-accent focus:ring-0 transition-all placeholder:text-theme-muted/50"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          />
          <button
            onClick={handlePromoCode}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all bg-theme-accent text-text-on-accent hover:bg-theme-accent/90"
          >
            Применить
          </button>
        </div>
        {promoStatus === 'success' && (
          <p className="mt-4 text-theme-accent font-bold text-sm">Доступ разрешен. Добро пожаловать, Хранитель Вселенной!</p>
        )}
        {promoStatus === 'error' && (
          <p className="mt-4 text-red-500 font-bold text-sm">Неверный код.</p>
        )}
      </section>
`;

content = content.replace('{/* Theme Selection Grid */}', promoUI + '      {/* Theme Selection Grid */}');

fs.writeFileSync('src/components/Profile.tsx', content);
