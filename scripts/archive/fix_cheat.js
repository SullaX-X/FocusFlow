import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const newPromo = `  const handlePromoCode = () => {
    if (AccessManager.validateCode(promoCode)) {
      setPromoStatus('success');
      setPromoCode('');
      setTimeout(() => setPromoStatus(null), 5000);
    } else if (promoCode === '1000000' || promoCode.toLowerCase() === 'million') {
      if (updateStats) {
        updateStats({ focusDust: (stats?.focusDust || 0) + 1000000 });
      }
      setPromoStatus('success_dust');
      setPromoCode('');
      setTimeout(() => setPromoStatus(null), 5000);
    } else {
      setPromoStatus('error');
      setTimeout(() => setPromoStatus(null), 3000);
    }
  };`;

content = content.replace(
  /const handlePromoCode = \(\) => \{[\s\S]*?^\s*\};\n/m,
  newPromo + '\n'
);

const successDust = `        {promoStatus === 'success_dust' && (
          <p className="mt-4 text-theme-accent font-bold text-sm">Вам начислено 1 000 000 ✨ звездной пыльцы!</p>
        )}`;

content = content.replace(
  "{promoStatus === 'success' && (",
  successDust + "\n        {promoStatus === 'success' && ("
);

fs.writeFileSync('src/components/Profile.tsx', content);
