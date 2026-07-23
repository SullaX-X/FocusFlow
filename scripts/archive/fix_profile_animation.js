import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

// Add purchasing state
content = content.replace(
  'const [promoStatus, setPromoStatus] = useState<string | null>(null);',
  `const [promoStatus, setPromoStatus] = useState<string | null>(null);
  const [purchasingTheme, setPurchasingTheme] = useState<string | null>(null);`
);

// Update unlock logic
const unlockLogicRegex = /onClick=\{\(\) => \{\n                            if \(focusDust >= \(t\.dustRequired \|\| 0\)\) \{\n                              if \(updateStats\) \{\n                                const newUnlocked = \[\.\.\.\(stats\?\.unlockedThemes \|\| \[\]\), t\.id\];\n                                updateStats\(\{\n                                   focusDust: focusDust - \(t\.dustRequired \|\| 0\),\n                                  unlockedThemes: newUnlocked\n                                \}\);\n                                setTheme\(t\.id as any\);\n                              \}\n                            \} else \{\n                              alert\(\`Недостаточно звездной пыли! Нужно еще \$\{\(t\.dustRequired \|\| 0\) - focusDust\} ✨\`\);\n                            \}\n                          \}\}/;

const newUnlockLogic = `onClick={(e) => {
                            if (focusDust >= (t.dustRequired || 0) || isPremium) {
                              setPurchasingTheme(t.id);
                              
                              // Particle burst
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = (rect.left + rect.width / 2) / window.innerWidth;
                              const y = (rect.top + rect.height / 2) / window.innerHeight;
                              
                              confetti({
                                particleCount: 30,
                                spread: 60,
                                origin: { x, y },
                                colors: [t.colors[0], t.colors[2]],
                                disableForReducedMotion: true,
                                zIndex: 1000,
                              });

                              setTimeout(() => {
                                if (updateStats && !isPremium) {
                                  const newUnlocked = [...(stats?.unlockedThemes || []), t.id];
                                  updateStats({
                                    focusDust: focusDust - (t.dustRequired || 0),
                                    unlockedThemes: newUnlocked
                                  });
                                }
                                setTheme(t.id as any);
                                setPurchasingTheme(null);
                              }, 600); // 0.6s animation
                            } else {
                              alert(\`Недостаточно звездной пыли! Нужно еще \${(t.dustRequired || 0) - focusDust} ✨\`);
                            }
                          }}`;

content = content.replace(unlockLogicRegex, newUnlockLogic);

// Add scale animation to the card
const cardRegex = /className=\{\`group relative flex flex-col rounded-2xl border transition-all duration-300 bg-theme-card\/30 overflow-hidden \$\{/;
const newCard = `className={\`group relative flex flex-col rounded-2xl border transition-transform duration-500 will-change-transform bg-theme-card/30 overflow-hidden \${
                   purchasingTheme === t.id ? 'scale-105 opacity-80' : 'scale-100 opacity-100'
                 } \${`;

content = content.replace(cardRegex, newCard);

fs.writeFileSync('src/components/Profile.tsx', content);
