import re

with open('src/components/Profile.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_click = """onClick={() => {
                            if (focusDust >= (t.dustRequired || 0)) {
                              if (updateStats) {
                                const newUnlocked = [...(stats?.unlockedThemes || []), t.id];
                                updateStats({ 
                                  focusDust: focusDust - (t.dustRequired || 0),
                                  unlockedThemes: newUnlocked
                                });
                                setTheme(t.id as any);
                              }
                            } else {
                              alert(`Недостаточно звездной пыли! Нужно еще ${(t.dustRequired || 0) - focusDust} ✨`);
                            }
                          }}"""

new_click = """onClick={(e) => {
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
                              alert(`Недостаточно звездной пыли! Нужно еще ${(t.dustRequired || 0) - focusDust} ✨`);
                            }
                          }}"""

content = re.sub(r'onClick=\{\(\) => \{\n\s*if \(focusDust >= \(t\.dustRequired \|\| 0\)\) \{\n\s*if \(updateStats\) \{\n\s*const newUnlocked = \[\.\.\.\(stats\?\.unlockedThemes \|\| \[\]\), t\.id\];\n\s*updateStats\(\{\s*\n\s*focusDust: focusDust - \(t\.dustRequired \|\| 0\),\n\s*unlockedThemes: newUnlocked\n\s*\}\);\n\s*setTheme\(t\.id as any\);\n\s*\}\n\s*\} else \{\n\s*alert\(`Недостаточно звездной пыли! Нужно еще \$\{\(t\.dustRequired \|\| 0\) - focusDust\} ✨`\);\n\s*\}\n\s*\}\}', new_click, content)

with open('src/components/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
