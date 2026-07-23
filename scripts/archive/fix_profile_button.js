import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const regex = /onClick=\{\(\) => \{\n                            if \(focusDust >= \(t\.dustRequired \|\| 0\)\) \{\n                              if \(updateStats\) \{\n                                const newUnlocked = \[\.\.\.\(stats\?\.unlockedThemes \|\| \[\]\), t\.id\];\n                                updateStats\(\{\n                                   focusDust: focusDust - \(t\.dustRequired \|\| 0\),\n                                  unlockedThemes: newUnlocked\n                                \}\);\n                                setTheme\(t\.id as any\);\n                              \}\n                            \} else \{\n                              alert\(\`Недостаточно звездной пыли! Нужно еще \$\{\(t\.dustRequired \|\| 0\) - focusDust\} ✨\`\);\n                            \}\n                          \}\}/;

const replacement = `onClick={(e) => {
                            if (focusDust >= (t.dustRequired || 0) || isPremium) {
                              setPurchasingTheme(t.id);
                              
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = (rect.left + rect.width / 2) / window.innerWidth;
                              const y = (rect.top + rect.height / 2) / window.innerHeight;
                              
                              confetti({
                                particleCount: 40,
                                spread: 70,
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
                                } else if (updateStats && isPremium) {
                                  const newUnlocked = [...(stats?.unlockedThemes || []), t.id];
                                  updateStats({
                                    unlockedThemes: newUnlocked
                                  });
                                }
                                setTheme(t.id as any);
                                setPurchasingTheme(null);
                              }, 600);
                            } else {
                              alert(\`Недостаточно звездной пыли! Нужно еще \${(t.dustRequired || 0) - focusDust} ✨\`);
                            }
                          }}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Profile.tsx', content);
