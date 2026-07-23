import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

// Import AccessManager
content = content.replace(
  "import { User } from 'lucide-react';",
  "import { User } from 'lucide-react';\nimport { AccessManager } from '../AccessManager';\nimport confetti from 'canvas-confetti';"
);

// Add state for promo code
const promoState = `
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(AccessManager.isPremium());

  useEffect(() => {
    const handlePremium = () => setIsPremium(true);
    window.addEventListener('focusmoon_premium_unlocked', handlePremium);
    return () => window.removeEventListener('focusmoon_premium_unlocked', handlePremium);
  }, []);

  const handlePromoCode = () => {
    if (AccessManager.validateCode(promoCode)) {
      setPromoStatus('success');
      setPromoCode('');
      setTimeout(() => setPromoStatus(null), 5000);
    } else {
      setPromoStatus('error');
      setTimeout(() => setPromoStatus(null), 3000);
    }
  };
`;

content = content.replace(
  'const focusDust = stats?.focusDust || 0;',
  promoState + '\n  const focusDust = stats?.focusDust || 0;'
);

// Update isUnlocked logic
content = content.replace(
  'const isUnlocked = t.dustRequired ? (stats?.unlockedThemes || []).includes(t.id) : true;',
  'const isUnlocked = t.dustRequired ? (isPremium || (stats?.unlockedThemes || []).includes(t.id)) : true;'
);

// We need to add the promo code UI. Let's add it before the Themes section.
const promoUI = `
      {/* PROMO CODE SECTION */}
      <section className="glass-panel p-6 rounded-3xl border border-theme-border mt-8">
        <h3 className="text-xl font-black text-theme-text uppercase tracking-tight font-display mb-4">Секретный доступ</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="text" 
            placeholder="Введите промокод..."
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 bg-theme-bg/50 border border-theme-border/50 text-theme-text px-4 py-3 rounded-2xl outline-none focus:border-theme-accent focus:ring-0 transition-colors placeholder:text-theme-muted/50"
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

content = content.replace(
  '{/* Themes Grid */}',
  promoUI + '\n      {/* Themes Grid */}'
);

fs.writeFileSync('src/components/Profile.tsx', content);
